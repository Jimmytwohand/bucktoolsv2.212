"use client"

import {
  useRef,
  useEffect,
  useState,
  type MouseEvent,
  type WheelEvent,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react"
import { useMap } from "@/contexts/map-context"
import { calculateDistance } from "@/lib/utils"
import { MapError } from "@/components/map/map-error"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapCanvasProps {
  mapUrl: string
  onReset?: () => void
}

export const MapCanvas = forwardRef<
  { fitToScreen: () => void; getCanvasElement: () => HTMLCanvasElement | null },
  MapCanvasProps
>(({ mapUrl, onReset }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [clickPoint, setClickPoint] = useState<{ x: number; y: number } | null>(null)
  const [tempEndPoint, setTempEndPoint] = useState<{ x: number; y: number } | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<Error | null>(null)

  // Drawing state
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStartPoint, setDrawingStartPoint] = useState<{ x: number; y: number } | null>(null)

  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Add a new state for out of bounds drawing
  const [outOfBoundsStartPoint, setOutOfBoundsStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [outOfBoundsPath, setOutOfBoundsPath] = useState<{ x: number; y: number }[]>([])
  const [isDrawingOutOfBounds, setIsDrawingOutOfBounds] = useState(false)

  // Add a new state for cap drawing
  const [capStartPoint, setCapStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [capPath, setCapPath] = useState<{ x: number; y: number }[]>([])
  const [isDrawingCap, setIsDrawingCap] = useState(false)

  // Add a new state for location picking preview
  const [locationPickerPreview, setLocationPickerPreview] = useState<{ x: number; y: number } | null>(null)

  const {
    scale,
    activeTool,
    setActiveTool,
    measurements,
    addMeasurement,
    rangeCircles,
    addRangeCircle,
    visibleLayers,
    calibrationPoints,
    setCalibrationPoints,
    knownDistance,
    setScale,
    showCalibrationLine,
    // Drawing related
    drawingPaths,
    addDrawingPath,
    drawingSettings,
    // Artillery related
    artilleryShots,
    addArtilleryShot,
    artillerySettings,
    // Icon related
    customIcons,
    placedIcons,
    addPlacedIcon,
    removePlacedIcon,
    updatePlacedIcon,
    selectedIconId,
    // Out of bounds related
    outOfBoundsLines,
    addOutOfBoundsLine,
    outOfBoundsSettings,
    // Selection related
    selectedItem,
    setSelectedItem,
    deleteSelectedItem,
    // Time related
    timeMeasurements,
    addTimeMeasurement,
    timeToolSettings,
    // Cap related
    capLines,
    addCapLine,
    // Text related
    textElements,
    addTextElement,
    textSettings,
    // Briefing related
    highlightedMapPoints,
    briefingMode,
    briefingPanelWidth,
    locationPickingState,
    completeLocationPicking,
    cancelLocationPicking,
    briefingData,
    viewLocation,
    setBriefingData,
  } = useMap()

  // Helper functions for drawing
  const drawMeasurement = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number },
    distance: number | null,
    isSelected = false,
  ) => {
    // Draw line
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = isSelected ? "#00ff00" : "#ffcc00"
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.stroke()

    // Draw endpoints
    ctx.beginPath()
    ctx.arc(start.x, start.y, 4, 0, Math.PI * 2)
    ctx.arc(end.x, end.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = isSelected ? "#00ff00" : "#ffcc00"
    ctx.fill()

    // Display distance
    if (distance !== null) {
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2

      // Draw background for text
      ctx.font = "14px sans-serif"
      const text = `${distance.toFixed(1)} yards`
      const textWidth = ctx.measureText(text).width

      // Use a different background color for selected measurements
      ctx.fillStyle = isSelected ? "rgba(0, 100, 0, 0.8)" : "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(midX - textWidth / 2 - 5, midY - 20, textWidth + 10, 24)

      // Draw text
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(text, midX, midY)
    }
  }

  const drawRangeCircle = (
    ctx: CanvasRenderingContext2D,
    center: { x: number; y: number },
    radius: number | null,
    isSelected = false,
  ) => {
    if (radius === null || !scale) return

    // Draw center point
    ctx.beginPath()
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = isSelected ? "#00ff00" : "#00ccff"
    ctx.fill()

    // Convert radius from yards to pixels
    const radiusInPixels = radius / scale

    // Draw main circle
    ctx.beginPath()
    ctx.arc(center.x, center.y, radiusInPixels, 0, Math.PI * 2)
    ctx.strokeStyle = isSelected ? "#00ff00" : "#00ccff"
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.stroke()

    // Get canvas dimensions for boundary checking
    const canvasWidth = ctx.canvas.width / zoom
    const canvasHeight = ctx.canvas.height / zoom

    // Draw 50-yard interval circles
    const maxIntervals = Math.floor(radius / 50)
    for (let i = 1; i <= maxIntervals; i++) {
      const intervalYards = i * 50
      const intervalPixels = intervalYards / scale

      ctx.beginPath()
      ctx.arc(center.x, center.y, intervalPixels, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? "rgba(0, 255, 0, 0.5)" : "rgba(0, 204, 255, 0.5)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Determine optimal angle for label placement based on circle position
      // Default is top (270 degrees or -Math.PI/2)
      let labelAngle = -Math.PI / 2 // Top position (in radians)

      // Check if too close to top edge
      if (center.y - intervalPixels < 30) {
        labelAngle = Math.PI / 2 // Bottom position
      }

      // Check if too close to left edge
      if (center.x - intervalPixels < 50) {
        labelAngle = 0 // Right position
      }

      // Check if too close to right edge
      if (center.x + intervalPixels > canvasWidth - 50) {
        labelAngle = Math.PI // Left position
      }

      // Calculate label position using the determined angle
      const labelX = center.x + Math.cos(labelAngle) * intervalPixels
      const labelY = center.y + Math.sin(labelAngle) * intervalPixels

      // Prepare label text
      const labelText = `${intervalYards} yards`

      // Draw background for text
      ctx.font = "12px sans-serif"
      const textWidth = ctx.measureText(labelText).width
      const textHeight = 16

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(
        labelX - textWidth / 2 - 3,
        labelY - (labelAngle === Math.PI / 2 ? 0 : textHeight) - 3,
        textWidth + 6,
        textHeight + 6,
      )

      // Draw label text
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = labelAngle === Math.PI / 2 ? "top" : "bottom"
      ctx.fillText(labelText, labelX, labelY + (labelAngle === Math.PI / 2 ? 5 : -5))

      // Reset text baseline
      ctx.textBaseline = "alphabetic"
    }
  }

  // Function to draw a path with specified style
  const drawPath = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    thickness: number,
    lineStyle: string,
    isStraightLine: boolean,
    isSelected = false,
  ) => {
    if (points.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = isSelected ? "#00ff00" : color
    ctx.lineWidth = isSelected ? thickness + 1 : thickness

    // Set line style
    if (lineStyle === "dashed") {
      ctx.setLineDash([thickness * 2, thickness])
    } else if (lineStyle === "dotted") {
      ctx.setLineDash([thickness, thickness * 2])
    } else {
      ctx.setLineDash([])
    }

    if (isStraightLine) {
      // Draw a straight line from first to last point
      ctx.moveTo(points[0].x, points[0].y)
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    } else {
      // Draw a path through all points
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
    }

    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash
  }

  // Function to draw artillery shot
  const drawArtilleryShot = (
    ctx: CanvasRenderingContext2D,
    shot: {
      position: { x: number; y: number }
      target: { x: number; y: number }
      distance: number
      type: string
      elevation: number
      shotType: string
      fuseType: string
      fuseTime: number
    },
    isSelected = false,
  ) => {
    if (!scale) return

    const { position, target, distance, type, elevation, shotType, fuseTime } = shot

    // Calculate predicted fuse time based on artillery type and distance
    const velocity = type === "napoleon" ? 405 : 300 // yards per second
    const predictedFuseTime = distance !== undefined ? distance / velocity : 0

    // Draw artillery position (cannon icon)
    ctx.beginPath()
    ctx.arc(position.x, position.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = isSelected ? "#00ff00" : "#ff6600"
    ctx.fill()
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw a small cannon barrel pointing toward the target
    const angle = Math.atan2(target.y - position.y, target.x - position.x)
    const barrelLength = 15

    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
    ctx.lineTo(position.x + Math.cos(angle) * barrelLength, position.y + Math.sin(angle) * barrelLength)
    ctx.lineWidth = 4
    ctx.strokeStyle = "#333333"
    ctx.stroke()

    // Draw line connecting artillery to target
    ctx.beginPath()
    ctx.moveTo(position.x, position.y)

    // Draw an arc to simulate the trajectory based on elevation
    const controlPointDistance = distance / (2 * scale) // Convert to pixels
    const elevationFactor = elevation / 45 // 0 to 1 based on elevation
    const maxHeight = controlPointDistance * 0.5 * elevationFactor

    // Calculate control point for the quadratic curve
    const controlX = (position.x + target.x) / 2
    const controlY = (position.y + target.y) / 2 - maxHeight

    // Draw the trajectory curve
    ctx.quadraticCurveTo(controlX, controlY, target.x, target.y)

    ctx.strokeStyle = isSelected ? "#00ff00" : "#ffffff"
    ctx.lineWidth = isSelected ? 2.5 : 1.5
    ctx.setLineDash([4, 4]) // Dashed line for trajectory
    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash

    // Impact area visualization based on shot type
    if (shotType === "shell") {
      // SHELL: 6 yard lethal area + 40 yard 50% lethal area
      // Create a gradient for the explosion effect
      const lethalRadius = 6 / scale // Convert 6 yards to pixels
      const outerRadius = 20 / scale // Convert 20 yards to pixels (40 yard diameter)

      const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, outerRadius)
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.9)") // Bright red center (lethal)
      gradient.addColorStop(lethalRadius / outerRadius, "rgba(255, 0, 0, 0.8)") // Edge of lethal area
      gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)") // Fade out at edge

      // Draw the explosion area
      ctx.beginPath()
      ctx.arc(target.x, target.y, outerRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw outline of the lethal area
      ctx.beginPath()
      ctx.arc(target.x, target.y, lethalRadius, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? "rgba(0, 255, 0, 0.7)" : "rgba(255, 255, 255, 0.7)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add labels for the areas
      ctx.font = "bold 10px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"

      // Label for lethal area
      ctx.fillText(`6 YD`, target.x, target.y - lethalRadius / 2)

      // Label for outer area
      ctx.fillText(`40 YD AREA`, target.x, target.y + outerRadius / 2)
      ctx.fillText(`50% DENSITY`, target.x, target.y + outerRadius / 2 + 12)
    } else if (shotType === "case") {
      // CASE: 4 yard lethal area + 30 yard 75% lethal area
      // Create a gradient for the explosion effect
      const lethalRadius = 4 / scale // Convert 4 yards to pixels
      const outerRadius = 15 / scale // Convert 15 yards to pixels (30 yard diameter)

      const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, outerRadius)
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.9)") // Bright red center (lethal)
      gradient.addColorStop(lethalRadius / outerRadius, "rgba(255, 0, 0, 0.8)") // Edge of lethal area
      gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)") // Fade out at edge

      // Draw the explosion area
      ctx.beginPath()
      ctx.arc(target.x, target.y, outerRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw outline of the lethal area
      ctx.beginPath()
      ctx.arc(target.x, target.y, lethalRadius, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? "rgba(0, 255, 0, 0.7)" : "rgba(255, 255, 255, 0.7)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add labels for the areas
      ctx.font = "bold 10px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"

      // Label for lethal area
      ctx.fillText(`4 YD`, target.x, target.y - lethalRadius / 2)

      // Label for outer area
      ctx.fillText(`30 YD AREA`, target.x, target.y + outerRadius / 2)
      ctx.fillText(`75% DENSITY`, target.x, target.y + outerRadius / 2 + 12)
    } else if (shotType === "canister") {
      // Draw spread pattern for canister
      const spreadRadius = 20 / scale // pixels
      const numPellets = 18

      ctx.beginPath()
      ctx.arc(target.x, target.y, spreadRadius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
      ctx.fill()

      if (isSelected) {
        ctx.strokeStyle = "rgba(0, 255, 0, 0.7)"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw pellets
      for (let i = 0; i < numPellets; i++) {
        const spreadAngle = angle + ((Math.random() - 0.5) * Math.PI) / 1.5
        const spreadDistance = Math.random() * spreadRadius

        const pelletX = target.x + Math.cos(spreadAngle) * spreadDistance
        const pelletY = target.y + Math.sin(spreadAngle) * spreadDistance

        ctx.beginPath()
        ctx.arc(pelletX, pelletY, 2, 0, Math.PI * 2)
        ctx.fillStyle = isSelected ? "#00ff00" : "#ff0000"
        ctx.fill()
      }
    }

    // Display distance and artillery info
    const midX = (position.x + target.x) / 2
    const midY = (position.y + target.y) / 2 - 20

    // Draw background for text
    ctx.font = "12px sans-serif"
    let artilleryTypeText = ""
    switch (type) {
      case "napoleon":
        artilleryTypeText = "12-pdr Napoleon"
        break
      case "parrott":
        artilleryTypeText = "10-pdr Parrott"
        break
      case "ordnance":
        artilleryTypeText = "3-in Ordnance"
        break
    }

    const text = `${distance !== undefined ? distance.toFixed(0) : "0"} yards - ${artilleryTypeText} - ${elevation !== undefined ? elevation.toFixed(2) : "0.00"}°`
    const textWidth = ctx.measureText(text).width

    ctx.fillStyle = isSelected ? "rgba(0, 100, 0, 0.8)" : "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(midX - textWidth / 2 - 5, midY - 15, textWidth + 10, 20)

    // Draw text
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.fillText(text, midX, midY)

    // Display fuse time information
    const fuseY = midY + 20
    const fuseText = `Fuse: ${fuseTime !== undefined ? fuseTime.toFixed(2) : "0.00"}s (Pred: ${predictedFuseTime !== undefined ? predictedFuseTime.toFixed(2) : "0.00"}s)`
    const fuseTextWidth = ctx.measureText(fuseText).width

    ctx.fillStyle = isSelected ? "rgba(0, 100, 0, 0.8)" : "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(midX - fuseTextWidth / 2 - 5, fuseY - 15, fuseTextWidth + 10, 20)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(fuseText, midX, fuseY)

    // Optional title for shot
    ctx.font = "bold 14px sans-serif"
    ctx.fillText(shotType.toUpperCase(), target.x, target.y - (shotType === "shell" ? 50 : 40))
  }

  // Function to draw out of bounds lines
  const drawOutOfBoundsLine = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    side: "union" | "csa",
    isSelected = false,
  ) => {
    if (points.length < 2) return

    // Set color based on side
    const color = isSelected ? "#00ff00" : side === "union" ? "#0000ff" : "#ff0000"

    // Draw the line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = isSelected ? 4 : 3
    ctx.setLineDash([10, 5]) // Always use dashed line for out of bounds

    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash

    // Add label
    if (points.length >= 2) {
      // Find the middle point of the line
      const midIndex = Math.floor(points.length / 2)
      const midPoint = points[midIndex]

      // Calculate angle for text rotation
      let angle = 0
      if (midIndex > 0) {
        const prevPoint = points[midIndex - 1]
        angle = Math.atan2(midPoint.y - prevPoint.y, midPoint.x - prevPoint.x)

        // Keep text upright
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI
        }
      }

      // Draw label background
      const label = `${side === "union" ? "UNION" : "CSA"} OOB`
      ctx.save()
      ctx.translate(midPoint.x, midPoint.y)
      ctx.rotate(angle)

      ctx.font = "bold 14px sans-serif"
      const textWidth = ctx.measureText(label).width

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(-textWidth / 2 - 5, -25, textWidth + 10, 20)

      // Draw label text
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(label, 0, -10)

      ctx.restore()
    }
  }

  // Add a function to draw time measurements
  const drawTimeMeasurement = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number },
    distance: number,
    timeSeconds: number,
    speedMode: "double" | "triple",
    isSelected = false,
  ) => {
    // Draw line
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = isSelected ? "#00ff00" : "#4f46e5" // Use indigo for all time measurements

    ctx.lineWidth = isSelected ? 3 : 2
    ctx.stroke()

    // Draw endpoints
    ctx.beginPath()
    ctx.arc(start.x, start.y, 4, 0, Math.PI * 2)
    ctx.arc(end.x, end.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = isSelected ? "#00ff00" : "#4f46e5"
    ctx.fill()

    // Display time and distance
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    // Calculate both times
    const doubleQuickSpeed = 3.642 // yards per second
    const tripleQuickSpeed = 5.06 // yards per second

    const doubleQuickTime = distance / doubleQuickSpeed
    const tripleQuickTime = distance / tripleQuickSpeed

    // Format times as minutes and seconds
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.round(seconds % 60)
      return `${minutes}m ${secs}s`
    }

    const doubleTimeText = formatTime(doubleQuickTime)
    const tripleTimeText = formatTime(tripleQuickTime)

    // Draw background for text
    ctx.font = "14px sans-serif"
    const distanceText = `${distance.toFixed(1)} yards`
    const timeText = `Double: ${doubleTimeText} | Triple: ${tripleTimeText}`
    const timeWidth = ctx.measureText(timeText).width
    const distanceWidth = ctx.measureText(distanceText).width
    const maxWidth = Math.max(timeWidth, distanceWidth)

    // Use a different background color for selected time measurements
    ctx.fillStyle = isSelected ? "rgba(0, 100, 0, 0.8)" : "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(midX - maxWidth / 2 - 5, midY - 36, maxWidth + 10, 40)

    // Draw text
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.fillText(timeText, midX, midY - 20)
    ctx.fillText(distanceText, midX, midY - 4)
  }

  // Add a function to draw cap lines
  // Function to draw cap lines
  const drawCapLine = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], isSelected = false) => {
    if (points.length < 2) return

    // Draw the line
    ctx.beginPath()
    ctx.strokeStyle = isSelected ? "#00ff00" : "#00cc00" // Green color
    ctx.lineWidth = isSelected ? 4 : 3
    ctx.setLineDash([10, 5]) // Always use dashed line for cap

    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash

    // Add label
    if (points.length >= 2) {
      // Find the middle point of the line
      const midIndex = Math.floor(points.length / 2)
      const midPoint = points[midIndex]

      // Calculate angle for text rotation
      let angle = 0
      if (midIndex > 0) {
        const prevPoint = points[midIndex - 1]
        angle = Math.atan2(midPoint.y - prevPoint.y, midPoint.x - prevPoint.x)

        // Keep text upright
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI
        }
      }

      // Draw label background
      const label = "CAP"
      ctx.save()
      ctx.translate(midPoint.x, midPoint.y)
      ctx.rotate(angle)

      ctx.font = "bold 14px sans-serif"
      const textWidth = ctx.measureText(label).width

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(-textWidth / 2 - 5, -25, textWidth + 10, 20)

      // Draw label text
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(label, 0, -10)

      ctx.restore()
    }
  }

  const drawPlacedIcons = (ctx: CanvasRenderingContext2D) => {
    if (!visibleLayers.includes("icons")) return

    placedIcons.forEach((placedIcon) => {
      const icon = customIcons.find((i) => i.id === placedIcon.iconId)
      if (!icon) return

      // Create a new image for each icon
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = icon.url

      // Only draw if the image is loaded
      if (img.complete) {
        const isSelected = selectedItem?.type === "placedIcon" && selectedItem.id === placedIcon.id
        drawSingleIcon(ctx, img, placedIcon, icon, isSelected)
      } else {
        // Set up onload handler
        img.onload = () => {
          const isSelected = selectedItem?.type === "placedIcon" && selectedItem.id === placedIcon.id
          drawSingleIcon(ctx, img, placedIcon, icon, isSelected)
          // Force a redraw when the image loads
          redrawCanvas()
        }
      }
    })
  }

  // Helper function to draw a single icon
  const drawSingleIcon = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    placedIcon: any,
    icon: any,
    isSelected = false,
  ) => {
    // Calculate scaled dimensions - use the original icon dimensions
    const scaledWidth = icon.width * placedIcon.scale
    const scaledHeight = icon.height * placedIcon.scale

    // Save context state
    ctx.save()

    // Translate to the icon position
    ctx.translate(placedIcon.position.x, placedIcon.position.y)

    // Rotate if needed
    if (placedIcon.rotation !== 0) {
      ctx.rotate((placedIcon.rotation * Math.PI) / 180)
    }

    // Draw selection highlight if selected
    if (isSelected) {
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(scaledWidth, scaledHeight) / 2 + 5, 0, Math.PI * 2)
      ctx.strokeStyle = "#00ff00"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw the icon centered at the position
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)

    // Draw label if present
    if (placedIcon.label) {
      // Draw background for text
      ctx.font = "12px sans-serif"
      const textWidth = ctx.measureText(placedIcon.label).width

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(-textWidth / 2 - 4, scaledHeight / 2 + 4, textWidth + 8, 20)

      // Draw text
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(placedIcon.label, 0, scaledHeight / 2 + 18)
    }

    // Restore context state
    ctx.restore()
  }

  // Add keyboard event listener for delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItem) {
        deleteSelectedItem()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedItem, deleteSelectedItem])

  // Expose the fitToScreen function and getCanvasElement to the parent component
  useImperativeHandle(ref, () => ({
    fitToScreen: () => {
      if (image) {
        fitToScreen()
      }
    },
    getCanvasElement: () => canvasRef.current,
  }))

  // Function to fit image to screen
  const fitToScreen = () => {
    if (!image || !containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate the scale to fit the image within the container
    const scaleX = containerWidth / image.width
    const scaleY = containerHeight / image.height
    const newZoom = Math.min(scaleX, scaleY) * 0.95 // 95% to leave a small margin

    // Center the image
    const scaledWidth = image.width * newZoom
    const scaledHeight = image.height * newZoom
    const newPanX = (containerWidth - scaledWidth) / 2
    const newPanY = (containerHeight - scaledHeight) / 2

    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })

    // Store sizes for reference
    setImageSize({ width: image.width, height: image.height })
    setContainerSize({ width: containerWidth, height: containerHeight })
  }

  // Load the map image
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsLoading(true)
    setLoadError(false)

    // Set initial canvas size
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth
      canvas.height = containerRef.current.clientHeight
    } else {
      canvas.width = 800
      canvas.height = 600
    }

    // Create an array of methods to try loading the image
    const loadMethods = [
      // Method 1: Try direct loading with CORS
      () => {
        console.log("Trying direct loading with CORS")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = mapUrl
        return img
      },
      // Method 2: Try using cors-anywhere proxy
      () => {
        console.log("Trying cors-anywhere proxy")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `https://cors-anywhere.herokuapp.com/${mapUrl}`
        return img
      },
      // Method 3: Try using allorigins proxy
      () => {
        console.log("Trying allorigins proxy")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(mapUrl)}`
        return img
      },
      // Method 4: Try using a data URL proxy (for smaller images)
      () => {
        console.log("Trying data URL proxy")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `/api/proxy-image?url=${encodeURIComponent(mapUrl)}`
        return img
      },
      // Method 5: Try using a JSONP proxy
      () => {
        console.log("Trying JSONP proxy")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `https://crossorigin.me/${mapUrl}`
        return img
      },
    ]

    // Try each method in sequence
    let currentMethodIndex = 0

    function tryNextMethod() {
      if (currentMethodIndex >= loadMethods.length) {
        console.error("All image loading methods failed")
        setLoadError(true)
        setIsLoading(false)
        return
      }

      const img = loadMethods[currentMethodIndex]()

      img.onload = () => {
        console.log(`Method ${currentMethodIndex + 1} succeeded`)

        // Set canvas size to match container
        if (containerRef.current) {
          canvas.width = containerRef.current.clientWidth
          canvas.height = containerRef.current.clientHeight
        }

        setImage(img)
        setIsLoading(false)

        // Fit image to screen after loading
        setTimeout(fitToScreen, 100)
      }

      img.onerror = () => {
        console.error(`Method ${currentMethodIndex + 1} failed`)
        currentMethodIndex++
        tryNextMethod()
      }
    }

    tryNextMethod()

    // Cleanup function
    return () => {
      // Cancel any pending image loads
      loadMethods.forEach((_, index) => {
        if (index <= currentMethodIndex) {
          const img = loadMethods[index]()
          img.onload = null
          img.onerror = null
          img.src = ""
        }
      })
    }
  }, [mapUrl])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return

      const canvas = canvasRef.current
      canvas.width = containerRef.current.clientWidth
      canvas.height = containerRef.current.clientHeight

      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      // Redraw with new dimensions
      redrawCanvas()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [image, zoom, pan])

  // Add this useEffect to handle canvas resizing when the briefing panel opens/closes
  useEffect(() => {
    // Force a redraw and resize when the container size changes
    if (containerRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = containerRef.current.clientWidth
      canvas.height = containerRef.current.clientHeight

      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      // Redraw with new dimensions
      redrawCanvas()

      // Fit to screen after a short delay to ensure proper sizing
      setTimeout(fitToScreen, 100)
    }
  }, [briefingMode, briefingPanelWidth])

  // Function to check if a point is near a line segment
  const isPointNearLine = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
    threshold = 10,
  ) => {
    // Calculate the distance from point to line segment
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    let param = -1
    if (len_sq !== 0) param = dot / len_sq

    let xx, yy

    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance < threshold
  }

  // Function to check if a point is near a path
  const isPointNearPath = (point: { x: number; y: number }, path: { x: number; y: number }[], threshold = 10) => {
    if (path.length < 2) return false

    for (let i = 0; i < path.length - 1; i++) {
      if (isPointNearLine(point, path[i], path[i + 1], threshold)) {
        return true
      }
    }
    return false
  }

  // Function to check if a point is near a circle
  const isPointNearCircle = (
    point: { x: number; y: number },
    center: { x: number; y: number },
    radius: number,
    threshold = 10,
  ) => {
    const distance = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
    return Math.abs(distance - radius / scale) < threshold
  }

  // Function to find the item at a given point
  const findItemAtPoint = useCallback(
    (point: { x: number; y: number }) => {
      // Check strategic locations
      if (visibleLayers.includes("locations") && briefingData?.strategicLocations) {
        for (const location of briefingData.strategicLocations) {
          const distance = Math.sqrt(
            Math.pow(point.x - location.coordinates.x, 2) + Math.pow(point.y - location.coordinates.y, 2),
          )
          if (distance <= 15) {
            // 15px radius for clicking
            // Instead of returning a selected item, open the location viewer
            viewLocation(location.id)
            return null // Don't select the location as an item
          }
        }
      }

      // Check measurements
      if (visibleLayers.includes("measurements") && measurements) {
        for (const measurement of measurements) {
          if (isPointNearLine(point, measurement.start, measurement.end)) {
            return { type: "measurement" as const, id: measurement.id }
          }
        }
      }

      // Check range circles
      if (visibleLayers.includes("ranges") && rangeCircles) {
        for (const circle of rangeCircles) {
          if (isPointNearCircle(point, circle.center, circle.radius)) {
            return { type: "rangeCircle" as const, id: circle.id }
          }
        }
      }

      // Check drawings
      if (visibleLayers.includes("drawings") && drawingPaths) {
        for (const path of drawingPaths) {
          if (isPointNearPath(point, path.points)) {
            return { type: "drawingPath" as const, id: path.id }
          }
        }
      }

      // Check artillery shots
      if (visibleLayers.includes("artillery") && artilleryShots) {
        for (const shot of artilleryShots) {
          if (isPointNearLine(point, shot.position, shot.target)) {
            return { type: "artilleryShot" as const, id: shot.id }
          }
        }
      }

      // Check out of bounds lines
      if (visibleLayers.includes("bounds") && outOfBoundsLines) {
        for (const line of outOfBoundsLines) {
          if (isPointNearPath(point, line.points)) {
            return { type: "outOfBoundsLine" as const, id: line.id }
          }
        }
      }

      // Check placed icons
      if (visibleLayers.includes("icons") && placedIcons && customIcons) {
        for (const icon of placedIcons) {
          const customIcon = customIcons.find((i) => i.id === icon.iconId)
          if (customIcon) {
            const iconSize = (Math.max(customIcon.width, customIcon.height) * icon.scale) / 2
            const distance = Math.sqrt(Math.pow(point.x - icon.position.x, 2) + Math.pow(point.y - icon.position.y, 2))
            if (distance < iconSize) {
              return { type: "placedIcon" as const, id: icon.id }
            }
          }
        }
      }

      // Check time measurements
      if (visibleLayers.includes("time") && timeMeasurements) {
        for (const measurement of timeMeasurements) {
          if (isPointNearLine(point, measurement.start, measurement.end)) {
            return { type: "timeMeasurement" as const, id: measurement.id }
          }
        }
      }

      // Check cap lines
      if (visibleLayers.includes("cap") && capLines) {
        for (const line of capLines) {
          if (isPointNearPath(point, line.points)) {
            return { type: "capLine" as const, id: line.id }
          }
        }
      }

      // Check text elements
      if (visibleLayers.includes("text")) {
        for (const element of textElements) {
          // Create a bounding box around the text
          const textWidth = element.text.length * (element.fontSize * 0.6) // Approximate width
          const textHeight = element.fontSize * 1.2 // Approximate height

          if (
            point.x >= element.position.x - 5 &&
            point.x <= element.position.x + textWidth + 5 &&
            point.y >= element.position.y - textHeight &&
            point.y <= element.position.y + 5
          ) {
            return { type: "textElement" as const, id: element.id }
          }
        }
      }

      return null
    },
    [
      visibleLayers,
      measurements,
      rangeCircles,
      drawingPaths,
      artilleryShots,
      outOfBoundsLines,
      placedIcons,
      customIcons,
      scale,
      timeMeasurements,
      capLines,
      briefingData,
      viewLocation,
      textElements,
    ],
  )

  // Function to redraw the canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Draw the image
    ctx.drawImage(image, 0, 0)

    // Find the selected item for each category
    const selectedMeasurement =
      selectedItem?.type === "measurement" ? measurements.find((m) => m.id === selectedItem.id) : null

    const selectedRangeCircle =
      selectedItem?.type === "rangeCircle" ? rangeCircles.find((c) => c.id === selectedItem.id) : null

    const selectedDrawingPath =
      selectedItem?.type === "drawingPath" ? drawingPaths.find((p) => p.id === selectedItem.id) : null

    const selectedArtilleryShot =
      selectedItem?.type === "artilleryShot" ? artilleryShots.find((s) => s.id === selectedItem.id) : null

    const selectedOutOfBoundsLine =
      selectedItem?.type === "outOfBoundsLine" ? outOfBoundsLines.find((l) => l.id === selectedItem.id) : null

    const selectedTimeMeasurement =
      selectedItem?.type === "timeMeasurement" ? timeMeasurements.find((m) => m.id === selectedItem.id) : null

    const selectedCapLine = selectedItem?.type === "capLine" ? capLines.find((l) => l.id === selectedItem.id) : null

    const selectedPlacedIcon =
      selectedItem?.type === "placedIcon" ? placedIcons.find((i) => i.id === selectedItem.id) : null

    // Draw placed icons (except selected one) - FIRST LAYER
    if (visibleLayers.includes("icons")) {
      // Add null check before filtering
      if (placedIcons) {
        placedIcons
          .filter((i) => i.id !== selectedPlacedIcon?.id)
          .forEach((placedIcon) => {
            const icon = customIcons.find((i) => i.id === placedIcon.iconId)
            if (icon) {
              // Create a new image for each icon
              const img = new Image()
              img.crossOrigin = "anonymous"
              img.src = icon.url

              // Only draw if the image is loaded
              if (img.complete) {
                drawSingleIcon(ctx, img, placedIcon, icon, false)
              } else {
                // Set up onload handler
                img.onload = () => {
                  drawSingleIcon(ctx, img, placedIcon, icon, false)
                  // Force a redraw when the image loads
                  redrawCanvas()
                }
              }
            }
          })
      }
    }

    // Draw out of bounds lines (except selected one) - SECOND LAYER
    if (visibleLayers.includes("bounds")) {
      // Add null check before filtering
      if (outOfBoundsLines) {
        outOfBoundsLines
          .filter((l) => l.id !== selectedOutOfBoundsLine?.id)
          .forEach((line) => {
            drawOutOfBoundsLine(ctx, line.points, line.side, false)
          })
      }
    }

    // Draw cap lines (except selected one) - THIRD LAYER
    if (visibleLayers.includes("cap")) {
      // Add null check before filtering
      if (capLines) {
        capLines
          .filter((l) => l.id !== selectedCapLine?.id)
          .forEach((line) => {
            drawCapLine(ctx, line.points, false)
          })
      }
    }

    // Draw range circles (except selected one) - FOURTH LAYER
    if (visibleLayers.includes("ranges")) {
      // Add null check before filtering
      if (rangeCircles) {
        rangeCircles
          .filter((c) => c.id !== selectedRangeCircle?.id)
          .forEach((circle) => {
            drawRangeCircle(ctx, circle.center, circle.radius, false)
          })
      }
    }

    // Draw measurements (except selected one) - FIFTH LAYER
    if (visibleLayers.includes("measurements")) {
      // Add null check before filtering
      if (measurements) {
        measurements
          .filter((m) => m.id !== selectedMeasurement?.id)
          .forEach((measurement) => {
            drawMeasurement(ctx, measurement.start, measurement.end, measurement.distance, false)
          })
      }
    }

    // Draw time measurements (except selected one) - SIXTH LAYER
    if (visibleLayers.includes("time")) {
      // Add null check before filtering
      if (timeMeasurements) {
        timeMeasurements
          .filter((m) => m.id !== selectedTimeMeasurement?.id)
          .forEach((measurement) => {
            drawTimeMeasurement(
              ctx,
              measurement.start,
              measurement.end,
              measurement.distance,
              measurement.timeSeconds,
              measurement.speedMode,
              false,
            )
          })
      }
    }

    // Draw saved drawing paths (except selected one)
    if (visibleLayers.includes("drawings")) {
      // Add null check before filtering
      if (drawingPaths) {
        drawingPaths
          .filter((p) => p.id !== selectedDrawingPath?.id)
          .forEach((path) => {
            drawPath(ctx, path.points, path.color, path.thickness, path.lineStyle, path.isStraightLine, false)
          })
      }
    }

    // Draw artillery shots (except selected one)
    if (visibleLayers.includes("artillery")) {
      // Add null check before filtering
      if (artilleryShots) {
        artilleryShots
          .filter((s) => s.id !== selectedArtilleryShot?.id)
          .forEach((shot) => {
            drawArtilleryShot(ctx, shot, false)
          })
      }
    }

    // Add a function to draw text elements
    const drawTextElement = (
      ctx: CanvasRenderingContext2D,
      element: {
        position: { x: number; y: number }
        text: string
        color: string
        fontSize: number
        fontStyle: string
      },
      isSelected = false,
    ) => {
      // Set font style
      ctx.font = `${element.fontStyle} ${element.fontSize}px sans-serif`

      // Draw selection highlight if selected
      if (isSelected) {
        const textWidth = ctx.measureText(element.text).width
        const textHeight = element.fontSize * 1.2

        ctx.fillStyle = "rgba(0, 255, 0, 0.2)"
        ctx.fillRect(element.position.x - 5, element.position.y - textHeight, textWidth + 10, textHeight + 5)

        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 2
        ctx.strokeRect(element.position.x - 5, element.position.y - textHeight, textWidth + 10, textHeight + 5)
      }

      // Draw text
      ctx.fillStyle = isSelected ? "#00ff00" : element.color
      ctx.fillText(element.text, element.position.x, element.position.y)
    }

    // Draw text elements (except selected one)
    if (visibleLayers.includes("text")) {
      const selectedTextElement =
        selectedItem?.type === "textElement" ? textElements.find((e) => e.id === selectedItem.id) : null

      textElements
        .filter((e) => e.id !== selectedTextElement?.id)
        .forEach((element) => {
          drawTextElement(ctx, element, false)
        })
    }

    // Draw current out of bounds path
    if (isDrawingOutOfBounds && outOfBoundsPath.length > 0) {
      drawOutOfBoundsLine(ctx, outOfBoundsPath, outOfBoundsSettings.side)
    }

    // Draw current drawing path
    if (isDrawing && currentPath.length > 0) {
      drawPath(
        ctx,
        currentPath,
        drawingSettings.color,
        drawingSettings.thickness,
        drawingSettings.lineStyle,
        drawingSettings.isStraightLine,
      )
    }

    // Draw temporary measurement line
    if (activeTool === "measure" && clickPoint && tempEndPoint) {
      const distance = scale
        ? calculateDistance(clickPoint.x, clickPoint.y, tempEndPoint.x, tempEndPoint.y, scale)
        : null

      drawMeasurement(ctx, clickPoint, tempEndPoint, distance)
    }

    // Draw temporary range preview
    if (activeTool === "range" && clickPoint && tempEndPoint) {
      // Calculate the distance in pixels
      const pixelDistance = Math.sqrt(
        Math.pow(tempEndPoint.x - clickPoint.x, 2) + Math.pow(tempEndPoint.y - clickPoint.y, 2),
      )

      // Convert to yards using the scale
      const radiusInYards = scale ? pixelDistance * scale : null

      drawRangeCircle(ctx, clickPoint, radiusInYards)
    }

    // Draw temporary straight line preview for drawing tool
    if (activeTool === "draw" && drawingSettings.isStraightLine && drawingStartPoint && tempEndPoint) {
      drawPath(
        ctx,
        [drawingStartPoint, tempEndPoint],
        drawingSettings.color,
        drawingSettings.thickness,
        drawingSettings.lineStyle,
        true,
      )
    }

    // Draw temporary artillery shot preview
    if (activeTool === "artillery" && clickPoint && tempEndPoint) {
      const distance = scale ? calculateDistance(clickPoint.x, clickPoint.y, tempEndPoint.x, tempEndPoint.y, scale) : 0

      drawArtilleryShot(ctx, {
        id: "temp",
        position: clickPoint,
        target: tempEndPoint,
        distance,
        type: artillerySettings.type,
        elevation: artillerySettings.elevation,
        shotType: artillerySettings.shotType,
        fuseType: artillerySettings.fuseType,
        fuseTime: artillerySettings.fuseTime,
        notes: "",
      })
    }

    // Draw temporary time measurement line
    if (activeTool === "time" && clickPoint && tempEndPoint && scale) {
      const distance = calculateDistance(clickPoint.x, clickPoint.y, tempEndPoint.x, tempEndPoint.y, scale)
      const doubleQuickSpeed = 3.642 // yards per second
      const timeSeconds = distance / doubleQuickSpeed // Use double quick as default for the data structure

      drawTimeMeasurement(ctx, clickPoint, tempEndPoint, distance, timeSeconds, "double")
    }

    // Draw calibration points only if showCalibrationLine is true or we're in calibration mode
    if (calibrationPoints.length > 0 && (showCalibrationLine || calibrationPoints.length < 2)) {
      calibrationPoints.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#00ff00"
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.font = "14px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText(`Point ${index + 1}`, point.x + 10, point.y - 10)
      })

      // Draw line between calibration points
      if (calibrationPoints.length === 2) {
        ctx.beginPath()
        ctx.moveTo(calibrationPoints[0].x, calibrationPoints[0].y)
        ctx.lineTo(calibrationPoints[1].x, calibrationPoints[1].y)
        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 2
        ctx.stroke()

        // Calculate and display distance
        const pixelDistance = Math.sqrt(
          Math.pow(calibrationPoints[1].x - calibrationPoints[0].x, 2) +
            Math.pow(calibrationPoints[1].y - calibrationPoints[0].y, 2),
        )

        const midX = (calibrationPoints[0].x + calibrationPoints[1].x) / 2
        const midY = (calibrationPoints[0].y + calibrationPoints[1].y) / 2

        ctx.font = "14px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText(`${knownDistance} yards`, midX, midY - 10)
      }
    }

    // Draw current cap path
    if (isDrawingCap && capPath.length > 0) {
      drawCapLine(ctx, capPath)
    }

    // Draw location picker preview
    if (activeTool === "locationPicker" && locationPickerPreview) {
      ctx.beginPath()
      ctx.arc(locationPickerPreview.x, locationPickerPreview.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 165, 0, 0.7)" // Orange with transparency
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw crosshair
      ctx.beginPath()
      ctx.moveTo(locationPickerPreview.x - 10, locationPickerPreview.y)
      ctx.lineTo(locationPickerPreview.x + 10, locationPickerPreview.y)
      ctx.moveTo(locationPickerPreview.x, locationPickerPreview.y - 10)
      ctx.lineTo(locationPickerPreview.x, locationPickerPreview.y + 10)
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw "Click to place" text
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText("Click to place", locationPickerPreview.x, locationPickerPreview.y - 15)
    }

    // Draw strategic locations
    if (visibleLayers.includes("locations") && briefingData?.strategicLocations) {
      briefingData.strategicLocations.forEach((location) => {
        // Draw location marker
        ctx.beginPath()
        ctx.arc(location.coordinates.x, location.coordinates.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 165, 0, 0.8)" // More opaque orange
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.stroke()

        // Add a highlight ring
        ctx.beginPath()
        ctx.arc(location.coordinates.x, location.coordinates.y, 12, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw location name
        ctx.font = "12px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.fillText(location.name, location.coordinates.x, location.coordinates.y - 15)
      })
    }

    // Now draw the selected item on top of everything else
    if (selectedItem) {
      if (selectedPlacedIcon && visibleLayers.includes("icons")) {
        const icon = customIcons.find((i) => i.id === selectedPlacedIcon.iconId)
        if (icon) {
          // Create a new image for the selected icon
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = icon.url

          // Only draw if the image is loaded
          if (img.complete) {
            drawSingleIcon(ctx, img, selectedPlacedIcon, icon, true)
          } else {
            // Set up onload handler
            img.onload = () => {
              drawSingleIcon(ctx, img, selectedPlacedIcon, icon, true)
              // Force a redraw when the image loads
              redrawCanvas()
            }
          }
        }
      } else if (selectedMeasurement && visibleLayers.includes("measurements")) {
        drawMeasurement(ctx, selectedMeasurement.start, selectedMeasurement.end, selectedMeasurement.distance, true)
      } else if (selectedRangeCircle && visibleLayers.includes("ranges")) {
        drawRangeCircle(ctx, selectedRangeCircle.center, selectedRangeCircle.radius, true)
      } else if (selectedDrawingPath && visibleLayers.includes("drawings")) {
        drawPath(
          ctx,
          selectedDrawingPath.points,
          selectedDrawingPath.color,
          selectedDrawingPath.thickness,
          selectedDrawingPath.lineStyle,
          selectedDrawingPath.isStraightLine,
          true,
        )
      } else if (selectedArtilleryShot && visibleLayers.includes("artillery")) {
        drawArtilleryShot(ctx, selectedArtilleryShot, true)
      } else if (selectedOutOfBoundsLine && visibleLayers.includes("bounds")) {
        drawOutOfBoundsLine(ctx, selectedOutOfBoundsLine.points, selectedOutOfBoundsLine.side, true)
      } else if (selectedTimeMeasurement && visibleLayers.includes("time")) {
        drawTimeMeasurement(
          ctx,
          selectedTimeMeasurement.start,
          selectedTimeMeasurement.end,
          selectedTimeMeasurement.distance,
          selectedTimeMeasurement.timeSeconds,
          selectedTimeMeasurement.speedMode,
          true,
        )
      } else if (selectedCapLine && visibleLayers.includes("cap")) {
        drawCapLine(ctx, selectedCapLine.points, true)
      } else {
        const selectedTextElement =
          selectedItem?.type === "textElement" ? textElements.find((e) => e.id === selectedItem.id) : null
        if (selectedTextElement && visibleLayers.includes("text")) {
          drawTextElement(ctx, selectedTextElement, true)
        }
      }
    }

    // Draw highlighted points from briefing
    if (visibleLayers.includes("measurements")) {
      highlightedMapPoints.forEach((point) => {
        // Skip expired highlights
        if (point.expiresAt && point.expiresAt < Date.now()) {
          return
        }

        // Draw highlight circle
        ctx.beginPath()
        ctx.arc(point.coordinates.x, point.coordinates.y, point.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${point.color}${Math.floor(point.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Draw center point
        ctx.beginPath()
        ctx.arc(point.coordinates.x, point.coordinates.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = point.color
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Restore the context
    ctx.restore()
  }

  // Redraw the canvas when measurements, range circles, or layers change
  useEffect(() => {
    redrawCanvas()
  }, [
    image,
    measurements,
    rangeCircles,
    drawingPaths,
    artilleryShots,
    visibleLayers,
    activeTool,
    clickPoint,
    tempEndPoint,
    calibrationPoints,
    scale,
    knownDistance,
    zoom,
    pan,
    isDrawing,
    currentPath,
    drawingStartPoint,
    artillerySettings,
    placedIcons,
    customIcons,
    selectedIconId,
    showCalibrationLine, // Add this line to make the canvas redraw when showCalibrationLine changes
    outOfBoundsLines,
    outOfBoundsSettings,
    isDrawingOutOfBounds,
    outOfBoundsPath,
    selectedItem, // Add this line to make the canvas redraw when selection changes
    timeMeasurements,
    timeToolSettings,
    capLines,
    isDrawingCap,
    capPath,
    highlightedMapPoints,
    briefingMode,
    briefingPanelWidth,
    briefingData,
    locationPickerPreview,
    textElements,
    textSettings,
  ])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (screenX - rect.left - pan.x) / zoom
    const y = (screenY - rect.top - pan.y) / zoom

    return { x, y }
  }

  // Check if we're in calibration mode
  const isCalibrationMode = calibrationPoints.length < 2 && knownDistance > 0

  // Handle mouse events
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get canvas coordinates
    const { x, y } = screenToCanvas(e.clientX, e.clientY)

    // Check if we're in calibration mode
    if (isCalibrationMode) {
      console.log("Calibration mode active, adding point", { x, y })
      setCalibrationPoints([...calibrationPoints, { x, y }])

      // If we have two points, calculate the scale
      if (calibrationPoints.length === 1) {
        const point1 = calibrationPoints[0]
        const point2 = { x, y }
        const pixelDistance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))

        // Calculate yards per pixel
        const yardsPerPixel = knownDistance / pixelDistance
        setScale(yardsPerPixel)
      }
      return
    }

    if (activeTool === "locationPicker") {
      // Important: Use the transformed coordinates from screenToCanvas
      const canvasCoords = { x, y }
      console.log("Location picker active, picking at coordinates:", canvasCoords.x, canvasCoords.y)

      // Call the context's completeLocationPicking directly with the transformed coordinates
      completeLocationPicking(canvasCoords.x, canvasCoords.y)

      // Clear the preview
      setLocationPickerPreview(null)
      return
    }

    // Check if we're in select mode
    if (activeTool === "select") {
      const item = findItemAtPoint({ x, y })
      setSelectedItem(item)
      return
    }

    // Check if we're using a tool
    if (activeTool === "measure" || activeTool === "range" || activeTool === "artillery" || activeTool === "time") {
      setClickPoint({ x, y })
      setTempEndPoint({ x, y })
      setIsDragging(true)
      return
    }

    // Check if we're placing an icon
    if (activeTool === "icon" && selectedIconId) {
      // Add the placed icon
      addPlacedIcon({
        id: Date.now().toString(),
        iconId: selectedIconId,
        position: { x, y },
        rotation: 0,
        scale: 1,
        label: "",
      })

      // Keep the icon tool active for placing multiple icons
      return
    }

    // Check if we're placing text
    if (activeTool === "text") {
      // Add the text element
      addTextElement({
        id: Date.now().toString(),
        position: { x, y },
        text: textSettings.text,
        color: textSettings.color,
        fontSize: textSettings.fontSize,
        fontStyle: textSettings.fontStyle,
      })

      // Keep the text tool active for placing multiple text elements
      return
    }

    // Check if we're drawing out of bounds
    if (activeTool === "outOfBounds") {
      setIsDrawingOutOfBounds(true)
      setOutOfBoundsStartPoint({ x, y })
      setOutOfBoundsPath([{ x, y }])
      return
    }

    // Check if we're drawing cap
    if (activeTool === "cap") {
      setIsDrawingCap(true)
      setCapStartPoint({ x, y })
      setCapPath([{ x, y }])
      return
    }

    // Check if we're drawing
    if (activeTool === "draw") {
      setIsDrawing(true)

      if (drawingSettings.isStraightLine) {
        // For straight lines, just set the start point
        setDrawingStartPoint({ x, y })
        setTempEndPoint({ x, y })
        setCurrentPath([{ x, y }])
      } else {
        // For freehand drawing, start a new path
        setCurrentPath([{ x, y }])
      }
      return
    }

    // Otherwise, start panning
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    // Update location picker preview
    if (activeTool === "locationPicker") {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setLocationPickerPreview({ x, y })
    } else {
      // Clear the preview if we're not in location picker mode
      if (locationPickerPreview) {
        setLocationPickerPreview(null)
      }
    }

    if (isDragging && clickPoint) {
      // We're using a tool
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setTempEndPoint({ x, y })
      return
    }

    if (isDrawingOutOfBounds) {
      // We're drawing out of bounds
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setOutOfBoundsPath((prev) => [...prev, { x, y }])
      return
    }

    if (isDrawingCap) {
      // We're drawing cap
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setCapPath((prev) => [...prev, { x, y }])
      return
    }

    if (isDrawing) {
      // We're drawing
      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      if (drawingSettings.isStraightLine) {
        // For straight lines, just update the end point
        setTempEndPoint({ x, y })
      } else {
        // For freehand drawing, add to the current path
        setCurrentPath((prev) => [...prev, { x, y }])
      }
      return
    }

    if (isPanning) {
      // We're panning the map
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y

      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }))

      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    // If we were using a tool
    if (isDragging && clickPoint && tempEndPoint) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      if (activeTool === "measure" && scale) {
        const distance = calculateDistance(clickPoint.x, clickPoint.y, x, y, scale)
        addMeasurement({
          id: Date.now().toString(),
          start: clickPoint,
          end: { x, y },
          distance,
        })
      } else if (activeTool === "range" && scale) {
        // Calculate the distance in pixels
        const pixelDistance = Math.sqrt(Math.pow(x - clickPoint.x, 2) + Math.pow(y - clickPoint.y, 2))

        // Convert to yards using the scale
        const radiusInYards = pixelDistance * scale

        addRangeCircle({
          id: Date.now().toString(),
          center: clickPoint,
          radius: radiusInYards,
        })
      } else if (activeTool === "artillery" && scale) {
        // Calculate the distance in yards
        const distance = calculateDistance(clickPoint.x, clickPoint.y, x, y, scale)

        // Add the artillery shot
        addArtilleryShot({
          id: Date.now().toString(),
          position: clickPoint,
          target: { x, y },
          distance,
          type: artillerySettings.type,
          elevation: artillerySettings.elevation,
          shotType: artillerySettings.shotType,
          fuseType: artillerySettings.fuseType,
          fuseTime: artillerySettings.fuseTime,
          notes: "",
        })
      } else if (activeTool === "time" && scale) {
        // Calculate the distance in yards
        const distance = calculateDistance(clickPoint.x, clickPoint.y, x, y, scale)

        // Calculate the time in seconds based on double quick speed
        // (we'll show both in the UI, but store double quick in the data structure)
        const doubleQuickSpeed = 3.642 // yards per second
        const timeSeconds = distance / doubleQuickSpeed

        // Add the time measurement
        addTimeMeasurement({
          id: Date.now().toString(),
          start: clickPoint,
          end: { x, y },
          distance,
          timeSeconds,
          speedMode: "double", // This doesn't matter anymore but we'll keep it for data structure compatibility
        })
      }

      setIsDragging(false)
      setClickPoint(null)
      setTempEndPoint(null)

      // Only reset certain tools after use
      // Keep measure, range, time, and artillery tools active until explicitly deselected
      if (activeTool !== "measure" && activeTool !== "range" && activeTool !== "time" && activeTool !== "artillery") {
        setActiveTool("none")
      }
    }

    // If we were drawing out of bounds
    if (isDrawingOutOfBounds) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      // Add the final point
      const finalPath = [...outOfBoundsPath, { x, y }]

      // Add the out of bounds line
      if (finalPath.length > 1) {
        addOutOfBoundsLine({
          id: Date.now().toString(),
          points: finalPath,
          side: outOfBoundsSettings.side,
        })
      }

      // Reset out of bounds drawing state
      setIsDrawingOutOfBounds(false)
      setOutOfBoundsPath([])
      setOutOfBoundsStartPoint(null)

      // Keep the out of bounds tool active for continued drawing
    }

    // If we were drawing cap
    if (isDrawingCap) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      // Add the final point
      const finalPath = [...capPath, { x, y }]

      // Add the cap line
      if (finalPath.length > 1) {
        addCapLine({
          id: Date.now().toString(),
          points: finalPath,
        })
      }

      // Reset cap drawing state
      setIsDrawingCap(false)
      setCapPath([])
      setCapStartPoint(null)

      // Keep the cap tool active for continued drawing
    }

    // If we were drawing
    if (isDrawing) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      let finalPath: { x: number; y: number }[] = []

      if (drawingSettings.isStraightLine && drawingStartPoint) {
        // For straight lines, just use start and end points
        finalPath = [drawingStartPoint, { x, y }]
      } else {
        // For freehand drawing, use the current path
        finalPath = currentPath
      }

      // Add the drawing to the saved paths
      if (finalPath.length > 1) {
        addDrawingPath({
          id: Date.now().toString(),
          points: finalPath,
          color: drawingSettings.color,
          thickness: drawingSettings.thickness,
          lineStyle: drawingSettings.lineStyle,
          isStraightLine: drawingSettings.isStraightLine,
        })
      }

      // Reset drawing state
      setIsDrawing(false)
      setCurrentPath([])
      setDrawingStartPoint(null)
      setTempEndPoint(null)

      // Keep the drawing tool active for continued drawing
    }

    // If we were panning
    if (isPanning) {
      setIsPanning(false)
    }
  }

  // Handle mouse wheel for zooming
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    // Get the mouse position relative to the canvas
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate zoom factor (smaller delta for smoother zoom)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = zoom * zoomFactor

    // Limit zoom level
    if (newZoom < 0.1 || newZoom > 10) return

    // Calculate new pan position to zoom toward mouse position
    const newPanX = mouseX - (mouseX - pan.x) * zoomFactor
    const newPanY = mouseY - (mouseY - pan.y) * zoomFactor

    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }

  // Set cursor based on current mode
  let cursorStyle = "grab"
  if (isPanning) cursorStyle = "grabbing"
  if (isCalibrationMode) cursorStyle = "crosshair"
  if (activeTool === "measure" || activeTool === "range") cursorStyle = "crosshair"
  if (activeTool === "draw") cursorStyle = "crosshair"
  if (activeTool === "artillery") cursorStyle = "crosshair"
  if (activeTool === "outOfBounds") cursorStyle = "crosshair"
  if (activeTool === "time") cursorStyle = "crosshair"
  if (activeTool === "cap") cursorStyle = "crosshair"
  if (activeTool === "select") cursorStyle = "pointer"
  if (activeTool === "locationPicker") cursorStyle = "crosshair"

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-black/20">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg">Loading map...</div>
        </div>
      )}

      {loadError ? (
        <MapError
          onRetry={() => {
            setLoadError(false)
            setIsLoading(true)
            // Force reload the image
            const timestampValue = new Date().getTime()
            const urlWithCache = mapUrl.includes("?")
              ? `${mapUrl}&cache=${timestampValue}`
              : `${mapUrl}?cache=${timestampValue}`

            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = urlWithCache

            img.onload = () => {
              const canvas = canvasRef.current
              if (!canvas) return

              const ctx = canvas.getContext("2d")
              if (!ctx) return

              canvas.width = canvas.clientWidth
              canvas.height = canvas.clientHeight
              ctx.drawImage(img, 0, 0)
              setImage(img)
              setIsLoading(false)

              // Fit to screen
              setTimeout(fitToScreen, 100)
            }

            img.onerror = () => {
              setLoadError(true)
              setIsLoading(false)
            }
          }}
          onReset={onReset || (() => {})}
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className={`block h-full w-full cursor-${cursorStyle}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setZoom((prev) => Math.min(prev * 1.2, 10))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.1))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={fitToScreen}
              title="Fit to Screen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
            {Math.round(zoom * 100)}%
          </div>

          {/* Active tool indicator */}
          {activeTool !== "none" && (
            <>
              <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                {activeTool === "measure" && "Measuring Distance"}
                {activeTool === "range" && "Creating Range Circle"}
                {activeTool === "draw" && "Drawing"}
                {activeTool === "icon" && "Placing Icon"}
                {activeTool === "artillery" && "Artillery Shot"}
                {activeTool === "outOfBounds" && "Drawing Out of Bounds"}
                {activeTool === "select" && "Select & Delete Items"}
                {activeTool === "time" && "Measuring Time"}
                {activeTool === "cap" && "Drawing CAP Line"}
                {activeTool === "locationPicker" && "Picking Location"}
                {activeTool === "text" && "Placing Text"}
              </div>
              {activeTool === "locationPicker" && (
                <div
                  className="absolute top-14 left-4 bg-orange-600/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium"
                  data-location-picking="true"
                >
                  Click on the map to place the location
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelLocationPicking}
                    className="ml-2 h-6 text-xs text-white hover:text-white hover:bg-orange-700"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Active tool indicator */}
          {activeTool !== "none" && (
            <>
              <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                {activeTool === "measure" && "Measuring Distance"}
                {activeTool === "range" && "Creating Range Circle"}
                {activeTool === "draw" && "Drawing"}
                {activeTool === "icon" && "Placing Icon"}
                {activeTool === "artillery" && "Artillery Shot"}
                {activeTool === "outOfBounds" && "Drawing Out of Bounds"}
                {activeTool === "select" && "Select & Delete Items"}
                {activeTool === "time" && "Measuring Time"}
                {activeTool === "cap" && "Drawing CAP Line"}
                {activeTool === "locationPicker" && "Picking Location"}
                {activeTool === "text" && "Placing Text"}
              </div>
              {activeTool === "locationPicker" && (
                <div
                  className="absolute top-14 left-4 bg-orange-600/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium"
                  data-location-picking="true"
                >
                  Click on the map to place the location
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelLocationPicking}
                    className="ml-2 h-6 text-xs text-white hover:text-white hover:bg-orange-700"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Selected item indicator */}
          {selectedItem && (
            <div className="absolute top-14 left-4 bg-green-600/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
              Item Selected (Press Delete to Remove)
            </div>
          )}

          {/* Calibration mode indicator */}
          {isCalibrationMode && (
            <div className="absolute top-4 left-4 bg-green-600/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
              {calibrationPoints.length === 0
                ? "Click on first calibration point"
                : "Click on second calibration point"}
            </div>
          )}
        </>
      )}
    </div>
  )
})

MapCanvas.displayName = "MapCanvas"
