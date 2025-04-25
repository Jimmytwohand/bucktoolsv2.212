"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"

// Add new types for map images
export type MapImage = {
  id: string
  type: "standard" | "satellite" | "terrain" | string
  url: string
  label: string
}

// Update the Tool type to include "locationPicker"
type Tool =
  | "measure"
  | "range"
  | "draw"
  | "icon"
  | "artillery"
  | "none"
  | "outOfBounds"
  | "select"
  | "time"
  | "cap"
  | "locationPicker"
  | "text"
type Point = { x: number; y: number }
type Measurement = { start: Point; end: Point; distance: number; id: string }
type RangeCircle = { center: Point; radius: number; id: string }
// Update the Layer type to include "text"
type Layer =
  | "measurements"
  | "ranges"
  | "icons"
  | "artillery"
  | "bounds"
  | "drawings"
  | "time"
  | "cap"
  | "locations"
  | "text"
type LineStyle = "solid" | "dashed" | "dotted"

// Updated artillery types and shot types
type ArtilleryType = "napoleon" | "parrott" | "ordnance"
type FuseType = "time"
type ShotType = "shell" | "case" | "canister"

// Artillery shot type
type ArtilleryShot = {
  id: string
  position: Point
  target: Point
  distance: number
  type: ArtilleryType
  elevation: number
  shotType: ShotType
  fuseType: FuseType
  fuseTime: number
  notes: string
}

// Artillery settings type
type ArtillerySettings = {
  type: ArtilleryType
  elevation: number
  shotType: ShotType
  fuseType: FuseType
  fuseTime: number
}

// Drawing path type
type DrawingPath = {
  id: string
  points: Point[]
  color: string
  thickness: number
  lineStyle: LineStyle
  isStraightLine: boolean
}

// Drawing settings type
type DrawingSettings = {
  color: string
  thickness: number
  lineStyle: LineStyle
  isStraightLine: boolean
}

// New custom icon type
type CustomIcon = {
  id: string
  url: string
  name: string
  width: number
  height: number
}

// New placed icon type
type PlacedIcon = {
  id: string
  iconId: string
  position: Point
  rotation: number
  scale: number
  label?: string
}

// Add these types after the existing type definitions
type OutOfBoundsSide = "union" | "csa"

type OutOfBoundsLine = {
  id: string
  points: Point[]
  side: OutOfBoundsSide
}

type OutOfBoundsSettings = {
  side: OutOfBoundsSide
}

// Add a new type for time measurements
type TimeMeasurement = {
  start: Point
  end: Point
  distance: number
  timeSeconds: number
  speedMode: "double" | "triple"
  id: string
}

// Add a new type for time tool settings
type TimeToolSettings = {
  speedMode: "double" | "triple"
}

// Selection type
type SelectedItem = {
  type:
    | "measurement"
    | "rangeCircle"
    | "drawingPath"
    | "artilleryShot"
    | "placedIcon"
    | "outOfBoundsLine"
    | "timeMeasurement"
    | "capLine"
    | "textElement"
  id: string
}

// Add a new type for text elements after the DrawingPath type
type TextElement = {
  id: string
  position: Point
  text: string
  color: string
  fontSize: number
  fontStyle: "normal" | "italic" | "bold" | "bold italic"
}

// Define the state type for history tracking
type MapState = {
  measurements: Measurement[]
  rangeCircles: RangeCircle[]
  drawingPaths: DrawingPath[]
  artilleryShots: ArtilleryShot[]
  placedIcons: PlacedIcon[]
  customIcons: CustomIcon[]
  outOfBoundsLines: OutOfBoundsLine[]
  timeMeasurements: TimeMeasurement[]
  capLines: CapLine[]
  textElements: TextElement[]
}

// Define the action type for history tracking
type HistoryAction = {
  type: string
  payload?: any
  description: string
}

// Add a new type for cap lines
type CapLine = {
  id: string
  points: Point[]
}

// Add a new type for confirmation dialogs
type ConfirmationDialog = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  itemId?: string
  itemType?: string
}

// Add new types for briefing functionality
export type MapReference = {
  id: string
  text: string
  coordinates: Point
  radius?: number
  highlightColor?: string
  zoomLevel?: number
}

export type BriefingSection = {
  id: string
  title: string
  content: string
  order: number
  mapReferences?: MapReference[]
}

export type StrategicLocation = {
  id: string
  name: string
  description: string
  imageUrl: string
  coordinates: Point
  highlightRadius?: number
}

export type MapBriefing = {
  id: string
  mapId: string
  title: string
  author: string
  createdAt: string
  updatedAt: string
  sections: BriefingSection[]
  strategicLocations: StrategicLocation[]
}

type HighlightPoint = {
  id: string
  coordinates: Point
  radius: number
  color: string
  opacity: number
  sourceId: string
  temporary: boolean
  expiresAt?: number
}

// Add a new type for location picking
type LocationPickingState = {
  isActive: boolean
  locationId: string | null
  onLocationPicked: ((x: number, y: number) => void) | null
}

// Add a new type for location viewing
type LocationViewingState = {
  isActive: boolean
  locationId: string | null
}

// Add text settings type
type TextSettings = {
  text: string
  color: string
  fontSize: number
  fontStyle: "normal" | "italic" | "bold" | "bold italic"
}

// Add these setter functions to the MapContextType interface
interface MapContextType {
  // Existing properties...
  mapUrl: string
  setMapUrl: (url: string) => void
  mapImages: MapImage[]
  setMapImages: (images: MapImage[]) => void
  activeMapImageId: string | null
  setActiveMapImageId: (id: string | null) => void
  // ... rest of the existing properties

  scale: number | null
  setScale: (scale: number | null) => void
  activeTool: Tool
  setActiveTool: (tool: Tool) => void
  measurements: Measurement[]
  addMeasurement: (measurement: Measurement) => void
  deleteMeasurement: (id: string) => void
  rangeCircles: RangeCircle[]
  addRangeCircle: (circle: RangeCircle) => void
  deleteRangeCircle: (id: string) => void
  visibleLayers: Layer[]
  toggleLayer: (layer: Layer) => void
  calibrationPoints: Point[]
  setCalibrationPoints: (points: Point[]) => void
  knownDistance: number
  setKnownDistance: (distance: number) => void
  clearMeasurements: () => void
  clearRangeCircles: () => void
  // Drawing-related state and functions
  drawingPaths: DrawingPath[]
  addDrawingPath: (path: DrawingPath) => void
  deleteDrawingPath: (id: string) => void
  clearDrawings: () => void
  drawingSettings: DrawingSettings
  updateDrawingSettings: (settings: Partial<DrawingSettings>) => void
  // Artillery-related state and functions
  artilleryShots: ArtilleryShot[]
  addArtilleryShot: (shot: ArtilleryShot) => void
  deleteArtilleryShot: (id: string) => void
  clearArtilleryShots: () => void
  artillerySettings: ArtillerySettings
  updateArtillerySettings: (settings: Partial<ArtillerySettings>) => void
  // Icon-related state and functions
  customIcons: CustomIcon[]
  addCustomIcon: (icon: CustomIcon) => void
  removeCustomIcon: (iconId: string) => void
  placedIcons: PlacedIcon[]
  addPlacedIcon: (icon: PlacedIcon) => void
  removePlacedIcon: (iconId: string) => void
  updatePlacedIcon: (icon: PlacedIcon) => void
  selectedIconId: string | null
  setSelectedIconId: (id: string | null) => void
  clearPlacedIcons: () => void
  // History-related state and functions
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  // Calibration line visibility
  showCalibrationLine: boolean
  toggleCalibrationLine: () => void
  outOfBoundsLines: OutOfBoundsLine[]
  addOutOfBoundsLine: (line: OutOfBoundsLine) => void
  deleteOutOfBoundsLine: (id: string) => void
  clearOutOfBoundsLines: () => void
  outOfBoundsSettings: OutOfBoundsSettings
  updateOutOfBoundsSettings: (settings: Partial<OutOfBoundsSettings>) => void
  // Selection-related state and functions
  selectedItem: SelectedItem | null
  setSelectedItem: (item: SelectedItem | null) => void
  deleteSelectedItem: () => void

  // Time-related state and functions
  timeMeasurements: TimeMeasurement[]
  addTimeMeasurement: (measurement: TimeMeasurement) => void
  deleteTimeMeasurement: (id: string) => void
  clearTimeMeasurements: () => void
  timeToolSettings: TimeToolSettings
  updateTimeToolSettings: (settings: Partial<TimeToolSettings>) => void

  // Cap-related values
  capLines: CapLine[]
  addCapLine: (line: CapLine) => void
  deleteCapLine: (id: string) => void
  clearCapLines: () => void

  // Confirmation dialog
  confirmationDialog: ConfirmationDialog | null
  setConfirmationDialog: (dialog: ConfirmationDialog | null) => void

  // Briefing-related state and functions
  briefingMode: boolean
  setBriefingMode: (mode: boolean) => void
  briefingData: MapBriefing | null
  setBriefingData: (data: MapBriefing | null) => void
  activeBriefingSection: string | null
  setActiveBriefingSection: (sectionId: string | null) => void
  highlightedMapPoints: HighlightPoint[]
  addHighlightPoint: (point: HighlightPoint) => void
  removeHighlightPoint: (id: string) => void
  clearHighlightPoints: () => void
  briefingPanelWidth: number
  setBriefingPanelWidth: (width: number) => void

  // New location picking state and functions
  locationPickingState: LocationPickingState
  startLocationPicking: (locationId: string, callback: (x: number, y: number) => void) => void
  cancelLocationPicking: () => void
  completeLocationPicking: (x: number, y: number) => void

  // Location viewing state and functions
  locationViewingState: LocationViewingState
  viewLocation: (locationId: string) => void
  closeLocationView: () => void

  toggleAllLayers: (show: boolean) => void

  // Text-related state and functions
  textElements: TextElement[]
  addTextElement: (element: TextElement) => void
  deleteTextElement: (id: string) => void
  clearTextElements: () => void
  textSettings: TextSettings
  updateTextSettings: (settings: Partial<TextSettings>) => void

  // Add these setter functions for import functionality
  setMeasurements: (measurements: Measurement[]) => void
  setRangeCircles: (circles: RangeCircle[]) => void
  setDrawingPaths: (paths: DrawingPath[]) => void
  setArtilleryShots: (shots: ArtilleryShot[]) => void
  setPlacedIcons: (icons: PlacedIcon[]) => void
  setCustomIcons: (icons: CustomIcon[]) => void
  setOutOfBoundsLines: (lines: OutOfBoundsLine[]) => void
  setTimeMeasurements: (measurements: TimeMeasurement[]) => void
  setCapLines: (lines: CapLine[]) => void
  setVisibleLayers: (layers: Layer[]) => void
  setTextElements: (elements: TextElement[]) => void

  // Map reset function
  handleResetMap: () => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  // Existing state...
  const [mapUrl, setMapUrl] = useState("")

  // Add new state for map images
  const [mapImages, setMapImages] = useState<MapImage[]>([])
  const [activeMapImageId, setActiveMapImageId] = useState<string | null>(null)

  // ... rest of the existing state variables ...
  const [scale, setScale] = useState<number | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>("none")
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [rangeCircles, setRangeCircles] = useState<RangeCircle[]>([])
  // Update the initial visibleLayers state to include "text"
  const [visibleLayers, setVisibleLayers] = useState<Layer[]>([
    "measurements",
    "ranges",
    "icons",
    "artillery",
    "bounds",
    "drawings",
    "text",
    "time",
    "cap",
    "locations", // Add locations layer by default
  ])
  const [calibrationPoints, setCalibrationPoints] = useState<Point[]>([])
  const [knownDistance, setKnownDistance] = useState<number>(0)

  // Drawing-related state
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([])
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    color: "#ff0000", // Red default
    thickness: 3,
    lineStyle: "solid",
    isStraightLine: false,
  })

  // Artillery-related state
  const [artilleryShots, setArtilleryShots] = useState<ArtilleryShot[]>([])
  const [artillerySettings, setArtillerySettings] = useState<ArtillerySettings>({
    type: "napoleon",
    elevation: 5.0,
    shotType: "shell",
    fuseType: "time",
    fuseTime: 0.0,
  })

  // Icon-related state
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([])
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([])
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)

  // History-related state
  const [history, setHistory] = useState<HistoryAction[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [pastStates, setPastStates] = useState<MapState[]>([])
  const [futureStates, setFutureStates] = useState<MapState[]>([])

  // Add a new state for calibration line visibility
  const [showCalibrationLine, setShowCalibrationLine] = useState(true)

  // Add these state variables in the MapProvider function
  const [outOfBoundsLines, setOutOfBoundsLines] = useState<OutOfBoundsLine[]>([])
  const [outOfBoundsSettings, setOutOfBoundsSettings] = useState<OutOfBoundsSettings>({
    side: "union",
  })

  // Selection state
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)

  // Add these state variables in the MapProvider function
  const [timeMeasurements, setTimeMeasurements] = useState<TimeMeasurement[]>([])
  const [timeToolSettings, setTimeToolSettings] = useState<TimeToolSettings>({
    speedMode: "double",
  })

  // Add these state variables in the MapProvider function
  const [capLines, setCapLines] = useState<CapLine[]>([])

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog | null>(null)

  // Add briefing-related state
  const [briefingMode, setBriefingMode] = useState<boolean>(false)
  const [briefingData, setBriefingData] = useState<MapBriefing | null>(null)
  const [activeBriefingSection, setActiveBriefingSection] = useState<string | null>(null)
  const [highlightedMapPoints, setHighlightedMapPoints] = useState<HighlightPoint[]>([])
  const [briefingPanelWidth, setBriefingPanelWidth] = useState<number>(400) // Default width in pixels

  // Add new state for location picking
  const [locationPickingState, setLocationPickingState] = useState<LocationPickingState>({
    isActive: false,
    locationId: null,
    onLocationPicked: null,
  })

  // Add new state for location viewing
  const [locationViewingState, setLocationViewingState] = useState<LocationViewingState>({
    isActive: false,
    locationId: null,
  })

  // Add these state variables in the MapProvider function
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [textSettings, setTextSettings] = useState<TextSettings>({
    text: "Sample Text",
    color: "#ffffff", // White default
    fontSize: 16,
    fontStyle: "normal",
  })

  // Computed properties for undo/redo availability
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  // Function to save current state to history
  const saveToHistory = (action: HistoryAction) => {
    const currentState: MapState = {
      measurements,
      rangeCircles,
      drawingPaths,
      artilleryShots,
      placedIcons,
      customIcons,
      outOfBoundsLines,
      timeMeasurements,
      capLines,
      textElements,
    }

    // Add current state to past states
    setPastStates((prev) => [...prev, currentState])

    // Clear future states when a new action is performed
    setFutureStates([])

    // Add action to history
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), action])
    setHistoryIndex((prev) => prev + 1)
  }

  // Undo function
  const undo = () => {
    if (!canUndo) return

    // Get the last state from past states
    const previousState = pastStates[pastStates.length - 1]

    // Save current state to future states for redo
    const currentState: MapState = {
      measurements,
      rangeCircles,
      drawingPaths,
      artilleryShots,
      placedIcons,
      customIcons,
      outOfBoundsLines,
      timeMeasurements,
      capLines,
      textElements,
    }
    setFutureStates((prev) => [...prev, currentState])

    // Apply the previous state
    setMeasurements(previousState.measurements)
    setRangeCircles(previousState.rangeCircles)
    setDrawingPaths(previousState.drawingPaths)
    setArtilleryShots(previousState.artilleryShots)
    setPlacedIcons(previousState.placedIcons)
    setCustomIcons(previousState.customIcons)
    setOutOfBoundsLines(previousState.outOfBoundsLines)
    setTimeMeasurements(previousState.timeMeasurements)
    setCapLines(previousState.capLines)
    setTextElements(previousState.textElements || [])

    // Update past states
    setPastStates((prev) => prev.slice(0, prev.length - 1))

    // Update history index
    setHistoryIndex((prev) => prev - 1)

    // Clear selection
    setSelectedItem(null)
  }

  // Redo function
  const redo = () => {
    if (!canRedo) return

    // Get the next state from future states
    const nextState = futureStates[futureStates.length - 1]

    // Save current state to past states
    const currentState: MapState = {
      measurements,
      rangeCircles,
      drawingPaths,
      artilleryShots,
      placedIcons,
      customIcons,
      outOfBoundsLines,
      timeMeasurements,
      capLines,
      textElements,
    }
    setPastStates((prev) => [...prev, currentState])

    // Apply the next state
    setMeasurements(nextState.measurements)
    setRangeCircles(nextState.rangeCircles)
    setDrawingPaths(nextState.drawingPaths)
    setArtilleryShots(nextState.artilleryShots)
    setPlacedIcons(nextState.placedIcons)
    setCustomIcons(nextState.customIcons)
    setOutOfBoundsLines(nextState.outOfBoundsLines)
    setTimeMeasurements(nextState.timeMeasurements)
    setCapLines(nextState.capLines)
    setTextElements(nextState.textElements || [])

    // Update future states
    setFutureStates((prev) => prev.slice(0, prev.length - 1))

    // Update history index
    setHistoryIndex((prev) => prev + 1)

    // Clear selection
    setSelectedItem(null)
  }

  // Function to start location picking
  const startLocationPicking = (locationId: string, callback: (x: number, y: number) => void) => {
    // Save previous tool to restore later
    setLocationPickingState({
      isActive: true,
      locationId,
      onLocationPicked: callback,
    })
    // Set the active tool to location picker
    setActiveTool("locationPicker")
  }

  // Function to cancel location picking
  const cancelLocationPicking = () => {
    setLocationPickingState({
      isActive: false,
      locationId: null,
      onLocationPicked: null,
    })
    // Reset the active tool
    setActiveTool("none")
  }

  // Function to complete location picking
  const completeLocationPicking = (x: number, y: number) => {
    console.log("Context completeLocationPicking called with coordinates:", x, y)

    if (locationPickingState.onLocationPicked) {
      console.log("Calling callback with coordinates:", x, y)
      // Make sure we're passing the exact coordinates to the callback
      locationPickingState.onLocationPicked(x, y)
    } else {
      console.warn("No callback function found in locationPickingState")
    }

    // Reset location picking state
    setLocationPickingState({
      isActive: false,
      locationId: null,
      onLocationPicked: null,
    })

    // Reset the active tool
    setActiveTool("none")
  }

  // Function to view a location
  const viewLocation = (locationId: string) => {
    setLocationViewingState({
      isActive: true,
      locationId,
    })
  }

  // Function to close location view
  const closeLocationView = () => {
    setLocationViewingState({
      isActive: false,
      locationId: null,
    })
  }

  // Also update the toggleAllLayers function to include "text" in the list of layers
  const toggleAllLayers = (show: boolean) => {
    if (show) {
      setVisibleLayers([
        "measurements",
        "ranges",
        "drawings",
        "text",
        "icons",
        "artillery",
        "bounds",
        "time",
        "cap",
        "locations",
      ])
    } else {
      setVisibleLayers([])
    }
  }

  const addMeasurement = (measurement: Measurement) => {
    // Ensure measurement has an ID
    const measurementWithId = {
      ...measurement,
      id: measurement.id || Date.now().toString(),
    }

    setMeasurements((prev) => [...prev, measurementWithId])
    saveToHistory({
      type: "ADD_MEASUREMENT",
      payload: measurementWithId,
      description: "Added distance measurement",
    })
  }

  const deleteMeasurement = (id: string) => {
    const measurementToDelete = measurements.find((m) => m.id === id)
    if (!measurementToDelete) return

    setMeasurements((prev) => prev.filter((m) => m.id !== id))
    saveToHistory({
      type: "DELETE_MEASUREMENT",
      payload: measurementToDelete,
      description: "Deleted distance measurement",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "measurement" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const addRangeCircle = (circle: RangeCircle) => {
    // Ensure circle has an ID
    const circleWithId = {
      ...circle,
      id: circle.id || Date.now().toString(),
    }

    setRangeCircles((prev) => [...prev, circleWithId])
    saveToHistory({
      type: "ADD_RANGE_CIRCLE",
      payload: circleWithId,
      description: "Added range circle",
    })
  }

  const deleteRangeCircle = (id: string) => {
    const circleToDelete = rangeCircles.find((c) => c.id === id)
    if (!circleToDelete) return

    setRangeCircles((prev) => prev.filter((c) => c.id !== id))
    saveToHistory({
      type: "DELETE_RANGE_CIRCLE",
      payload: circleToDelete,
      description: "Deleted range circle",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "rangeCircle" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const toggleLayer = (layerId: Layer) => {
    setVisibleLayers((prev) => (prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]))
  }

  const clearMeasurements = () => {
    if (measurements.length === 0) return
    saveToHistory({
      type: "CLEAR_MEASUREMENTS",
      payload: [...measurements],
      description: "Cleared all measurements",
    })
    setMeasurements([])

    // Clear selection if it was a measurement
    if (selectedItem?.type === "measurement") {
      setSelectedItem(null)
    }
  }

  const clearRangeCircles = () => {
    if (rangeCircles.length === 0) return
    saveToHistory({
      type: "CLEAR_RANGE_CIRCLES",
      payload: [...rangeCircles],
      description: "Cleared all range circles",
    })
    setRangeCircles([])

    // Clear selection if it was a range circle
    if (selectedItem?.type === "rangeCircle") {
      setSelectedItem(null)
    }
  }

  // Drawing-related functions
  const addDrawingPath = (path: DrawingPath) => {
    // Ensure path has an ID
    const pathWithId = {
      ...path,
      id: path.id || Date.now().toString(),
    }

    setDrawingPaths((prev) => [...prev, pathWithId])
    saveToHistory({
      type: "ADD_DRAWING_PATH",
      payload: pathWithId,
      description: "Added drawing",
    })
  }

  const deleteDrawingPath = (id: string) => {
    const pathToDelete = drawingPaths.find((p) => p.id === id)
    if (!pathToDelete) return

    setDrawingPaths((prev) => prev.filter((p) => p.id !== id))
    saveToHistory({
      type: "DELETE_DRAWING_PATH",
      payload: pathToDelete,
      description: "Deleted drawing",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "drawingPath" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const clearDrawings = () => {
    if (drawingPaths.length === 0) return
    saveToHistory({
      type: "CLEAR_DRAWINGS",
      payload: [...drawingPaths],
      description: "Cleared all drawings",
    })
    setDrawingPaths([])

    // Clear selection if it was a drawing
    if (selectedItem?.type === "drawingPath") {
      setSelectedItem(null)
    }
  }

  const updateDrawingSettings = (settings: Partial<DrawingSettings>) => {
    setDrawingSettings((prev) => ({ ...prev, ...settings }))
  }

  // Artillery-related functions
  const addArtilleryShot = (shot: ArtilleryShot) => {
    // Ensure shot has an ID
    const shotWithId = {
      ...shot,
      id: shot.id || Date.now().toString(),
    }

    setArtilleryShots((prev) => [...prev, shotWithId])
    saveToHistory({
      type: "ADD_ARTILLERY_SHOT",
      payload: shotWithId,
      description: "Added artillery shot",
    })
  }

  const deleteArtilleryShot = (id: string) => {
    const shotToDelete = artilleryShots.find((s) => s.id === id)
    if (!shotToDelete) return

    setArtilleryShots((prev) => prev.filter((s) => s.id !== id))
    saveToHistory({
      type: "DELETE_ARTILLERY_SHOT",
      payload: shotToDelete,
      description: "Deleted artillery shot",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "artilleryShot" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const clearArtilleryShots = () => {
    if (artilleryShots.length === 0) return
    saveToHistory({
      type: "CLEAR_ARTILLERY_SHOTS",
      payload: [...artilleryShots],
      description: "Cleared all artillery shots",
    })
    setArtilleryShots([])

    // Clear selection if it was an artillery shot
    if (selectedItem?.type === "artilleryShot") {
      setSelectedItem(null)
    }
  }

  const updateArtillerySettings = (settings: Partial<ArtillerySettings>) => {
    setArtillerySettings((prev) => ({ ...prev, ...settings }))
  }

  // Icon-related functions
  const addCustomIcon = (icon: CustomIcon) => {
    setCustomIcons((prev) => [...prev, icon])
    saveToHistory({
      type: "ADD_CUSTOM_ICON",
      payload: icon,
      description: `Added custom icon: ${icon.name}`,
    })
  }

  const removeCustomIcon = (iconId: string) => {
    const iconToRemove = customIcons.find((icon) => icon.id === iconId)
    if (!iconToRemove) return

    // Also find any placed icons that use this custom icon
    const placedIconsToRemove = placedIcons.filter((icon) => icon.iconId === iconId)

    setCustomIcons((prev) => prev.filter((icon) => icon.id !== iconId))
    // Also remove any placed icons that use this custom icon
    setPlacedIcons((prev) => prev.filter((icon) => icon.iconId !== iconId))

    saveToHistory({
      type: "REMOVE_CUSTOM_ICON",
      payload: { icon: iconToRemove, placedIcons: placedIconsToRemove },
      description: `Removed custom icon: ${iconToRemove.name}`,
    })

    // Clear selection if it was a placed icon using this custom icon
    if (selectedItem?.type === "placedIcon" && placedIconsToRemove.some((i) => i.id === selectedItem.id)) {
      setSelectedItem(null)
    }
  }

  // Update the addPlacedIcon function to ensure it doesn't affect other icons
  const addPlacedIcon = (icon: PlacedIcon) => {
    // Create a new icon with a unique ID to ensure it doesn't conflict with existing icons
    const newIcon = {
      ...icon,
      id: `icon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    setPlacedIcons((prev) => [...prev, newIcon])
    saveToHistory({
      type: "ADD_PLACED_ICON",
      payload: newIcon,
      description: "Placed icon on map",
    })
  }

  const removePlacedIcon = (iconId: string) => {
    const iconToRemove = placedIcons.find((icon) => icon.id === iconId)
    if (!iconToRemove) return

    setPlacedIcons((prev) => prev.filter((icon) => icon.id !== iconId))
    saveToHistory({
      type: "REMOVE_PLACED_ICON",
      payload: iconToRemove,
      description: "Removed placed icon",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "placedIcon" && selectedItem.id === iconId) {
      setSelectedItem(null)
    }
  }

  const updatePlacedIcon = (icon: PlacedIcon) => {
    const oldIcon = placedIcons.find((i) => i.id === icon.id)
    if (!oldIcon) return

    setPlacedIcons((prev) => prev.map((i) => (i.id === icon.id ? icon : i)))
    saveToHistory({
      type: "UPDATE_PLACED_ICON",
      payload: { oldIcon, newIcon: icon },
      description: "Updated placed icon",
    })
  }

  const clearPlacedIcons = () => {
    if (placedIcons.length === 0) return
    saveToHistory({
      type: "CLEAR_PLACED_ICONS",
      payload: [...placedIcons],
      description: "Cleared all placed icons",
    })
    setPlacedIcons([])

    // Clear selection if it was a placed icon
    if (selectedItem?.type === "placedIcon") {
      setSelectedItem(null)
    }
  }

  // Add these functions in the MapProvider function
  const addOutOfBoundsLine = (line: OutOfBoundsLine) => {
    // Ensure line has an ID
    const lineWithId = {
      ...line,
      id: line.id || Date.now().toString(),
    }

    setOutOfBoundsLines((prev) => [...prev, lineWithId])
    saveToHistory({
      type: "ADD_OUT_OF_BOUNDS_LINE",
      payload: lineWithId,
      description: `Added ${line.side} out of bounds line`,
    })
  }

  const deleteOutOfBoundsLine = (id: string) => {
    const lineToDelete = outOfBoundsLines.find((l) => l.id === id)
    if (!lineToDelete) return

    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      title: "Delete Out of Bounds Line",
      message: "Are you sure you want to delete this out of bounds line?",
      onConfirm: () => {
        setOutOfBoundsLines((prev) => prev.filter((l) => l.id !== id))
        saveToHistory({
          type: "DELETE_OUT_OF_BOUNDS_LINE",
          payload: lineToDelete,
          description: `Deleted ${lineToDelete.side} out of bounds line`,
        })

        // Clear selection if this was the selected item
        if (selectedItem?.type === "outOfBoundsLine" && selectedItem.id === id) {
          setSelectedItem(null)
        }

        // Close the dialog
        setConfirmationDialog(null)
      },
    })
  }

  const clearOutOfBoundsLines = () => {
    if (outOfBoundsLines.length === 0) return
    saveToHistory({
      type: "CLEAR_OUT_OF_BOUNDS_LINES",
      payload: [...outOfBoundsLines],
      description: "Cleared all out of bounds lines",
    })
    setOutOfBoundsLines([])

    // Clear selection if it was an out of bounds line
    if (selectedItem?.type === "outOfBoundsLine") {
      setSelectedItem(null)
    }
  }

  const updateOutOfBoundsSettings = (settings: Partial<OutOfBoundsSettings>) => {
    setOutOfBoundsSettings((prev) => ({ ...prev, ...settings }))
  }

  // Add these functions in the MapProvider function
  const addTimeMeasurement = (measurement: TimeMeasurement) => {
    // Ensure measurement has an ID
    const measurementWithId = {
      ...measurement,
      id: measurement.id || Date.now().toString(),
    }

    setTimeMeasurements((prev) => [...prev, measurementWithId])
    saveToHistory({
      type: "ADD_TIME_MEASUREMENT",
      payload: measurementWithId,
      description: "Added time measurement",
    })
  }

  const deleteTimeMeasurement = (id: string) => {
    const measurementToDelete = timeMeasurements.find((m) => m.id === id)
    if (!measurementToDelete) return

    setTimeMeasurements((prev) => prev.filter((m) => m.id !== id))
    saveToHistory({
      type: "DELETE_TIME_MEASUREMENT",
      payload: measurementToDelete,
      description: "Deleted time measurement",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "timeMeasurement" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const clearTimeMeasurements = () => {
    if (timeMeasurements.length === 0) return
    saveToHistory({
      type: "CLEAR_TIME_MEASUREMENTS",
      payload: [...timeMeasurements],
      description: "Cleared all time measurements",
    })
    setTimeMeasurements([])

    // Clear selection if it was a time measurement
    if (selectedItem?.type === "timeMeasurement") {
      setSelectedItem(null)
    }
  }

  const updateTimeToolSettings = (settings: Partial<TimeToolSettings>) => {
    setTimeToolSettings((prev) => ({ ...prev, ...settings }))
  }

  // Add these functions in the MapProvider function
  const addCapLine = (line: CapLine) => {
    // Ensure line has an ID
    const lineWithId = {
      ...line,
      id: line.id || Date.now().toString(),
    }

    setCapLines((prev) => [...prev, lineWithId])
    saveToHistory({
      type: "ADD_CAP_LINE",
      payload: lineWithId,
      description: `Added cap line`,
    })
  }

  const deleteCapLine = (id: string) => {
    const lineToDelete = capLines.find((l) => l.id === id)
    if (!lineToDelete) return

    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      title: "Delete Cap Line",
      message: "Are you sure you want to delete this cap line?",
      onConfirm: () => {
        setCapLines((prev) => prev.filter((l) => l.id !== id))
        saveToHistory({
          type: "DELETE_CAP_LINE",
          payload: lineToDelete,
          description: `Deleted cap line`,
        })
        setSelectedItem(null)
        setConfirmationDialog(null)
      },
    })
  }

  const clearCapLines = () => {
    if (capLines.length === 0) return
    saveToHistory({
      type: "CLEAR_CAP_LINES",
      payload: [...capLines],
      description: "Cleared all cap lines",
    })
    setCapLines([])

    // Clear selection if it was a cap line
    if (selectedItem?.type === "capLine") {
      setSelectedItem(null)
    }
  }

  // Add these functions in the MapProvider function
  const addTextElement = (element: TextElement) => {
    // Ensure element has an ID
    const elementWithId = {
      ...element,
      id: element.id || Date.now().toString(),
    }

    setTextElements((prev) => [...prev, elementWithId])
    saveToHistory({
      type: "ADD_TEXT_ELEMENT",
      payload: elementWithId,
      description: "Added text element",
    })
  }

  const deleteTextElement = (id: string) => {
    const elementToDelete = textElements.find((e) => e.id === id)
    if (!elementToDelete) return

    setTextElements((prev) => prev.filter((e) => e.id !== id))
    saveToHistory({
      type: "DELETE_TEXT_ELEMENT",
      payload: elementToDelete,
      description: "Deleted text element",
    })

    // Clear selection if this was the selected item
    if (selectedItem?.type === "textElement" && selectedItem.id === id) {
      setSelectedItem(null)
    }
  }

  const clearTextElements = () => {
    if (textElements.length === 0) return
    saveToHistory({
      type: "CLEAR_TEXT_ELEMENTS",
      payload: [...textElements],
      description: "Cleared all text elements",
    })
    setTextElements([])

    // Clear selection if it was a text element
    if (selectedItem?.type === "textElement") {
      setSelectedItem(null)
    }
  }

  const updateTextSettings = (settings: Partial<TextSettings>) => {
    setTextSettings((prev) => ({ ...prev, ...settings }))
  }

  // Function to delete the currently selected item
  const deleteSelectedItem = () => {
    if (!selectedItem) return

    switch (selectedItem.type) {
      case "measurement":
        deleteMeasurement(selectedItem.id)
        break
      case "rangeCircle":
        deleteRangeCircle(selectedItem.id)
        break
      case "drawingPath":
        deleteDrawingPath(selectedItem.id)
        break
      case "artilleryShot":
        deleteArtilleryShot(selectedItem.id)
        break
      case "placedIcon":
        removePlacedIcon(selectedItem.id)
        break
      case "outOfBoundsLine":
        // Show confirmation dialog for out of bounds lines
        const outOfBoundsLine = outOfBoundsLines.find((l) => l.id === selectedItem.id)
        if (outOfBoundsLine) {
          setConfirmationDialog({
            isOpen: true,
            title: "Delete Out of Bounds Line",
            message: "Are you sure you want to delete this out of bounds line?",
            onConfirm: () => {
              setOutOfBoundsLines((prev) => prev.filter((l) => l.id !== selectedItem.id))
              saveToHistory({
                type: "DELETE_OUT_OF_BOUNDS_LINE",
                payload: outOfBoundsLine,
                description: `Deleted ${outOfBoundsLine.side} out of bounds line`,
              })
              setSelectedItem(null)
              setConfirmationDialog(null)
            },
          })
        }
        break
      case "timeMeasurement":
        deleteTimeMeasurement(selectedItem.id)
        break
      case "capLine":
        // Show confirmation dialog for cap lines
        const capLine = capLines.find((l) => l.id === selectedItem.id)
        if (capLine) {
          setConfirmationDialog({
            isOpen: true,
            title: "Delete Cap Line",
            message: "Are you sure you want to delete this cap line?",
            onConfirm: () => {
              setCapLines((prev) => prev.filter((l) => l.id !== selectedItem.id))
              saveToHistory({
                type: "DELETE_CAP_LINE",
                payload: capLine,
                description: `Deleted cap line`,
              })
              setSelectedItem(null)
              setConfirmationDialog(null)
            },
          })
        }
        break
      case "textElement":
        deleteTextElement(selectedItem.id)
        break
    }
  }

  // Briefing-related functions
  const addHighlightPoint = (point: HighlightPoint) => {
    const pointWithId = {
      ...point,
      id: point.id || Date.now().toString(),
    }
    setHighlightedMapPoints((prev) => [...prev, pointWithId])
  }

  const removeHighlightPoint = (id: string) => {
    setHighlightedMapPoints((prev) => prev.filter((p) => p.id !== id))
  }

  const clearHighlightPoints = () => {
    setHighlightedMapPoints([])
  }

  const isPointNearLine = (
    point: { x: number; y: number },
    start: { x: number; y: number },
    end: { x: number; y: number },
    threshold = 10,
  ) => {
    const dist =
      Math.abs((end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x) /
      Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2))
    return dist < threshold
  }

  const isPointNearPath = (point: { x: number; y: number }, path: { x: number; y: number }[], threshold = 10) => {
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i]
      const end = path[i + 1]
      if (isPointNearLine(point, start, end, threshold)) {
        return true
      }
    }
    return false
  }

  const findItemAtPoint = useCallback(
    (point: { x: number; y: number }) => {
      if (!scale) return null

      // Check measurements
      if (visibleLayers.includes("measurements")) {
        for (const measurement of measurements) {
          if (isPointNearLine(point, measurement.start, measurement.end)) {
            return { type: "measurement" as const, id: measurement.id }
          }
        }
      }

      // Check range circles
      if (visibleLayers.includes("ranges")) {
        for (const circle of rangeCircles) {
          const distance = Math.sqrt(Math.pow(point.x - circle.center.x, 2) + Math.pow(point.y - circle.center.y, 2))
          if (distance <= circle.radius) {
            return { type: "rangeCircle" as const, id: circle.id }
          }
        }
      }

      // Check drawings
      if (visibleLayers.includes("drawings")) {
        for (const path of drawingPaths) {
          for (let i = 0; i < path.points.length - 1; i++) {
            if (isPointNearLine(point, path.points[i], path.points[i + 1])) {
              return { type: "drawingPath" as const, id: path.id }
            }
          }
        }
      }

      // Check artillery shots
      if (visibleLayers.includes("artillery")) {
        for (const shot of artilleryShots) {
          const distance = Math.sqrt(Math.pow(point.x - shot.position.x, 2) + Math.pow(point.y - shot.position.y, 2))
          if (distance <= 10) {
            // Adjust the distance threshold as needed
            return { type: "artilleryShot" as const, id: shot.id }
          }
        }
      }

      // Check out of bounds lines
      if (visibleLayers.includes("bounds")) {
        for (const line of outOfBoundsLines) {
          for (let i = 0; i < line.points.length - 1; i++) {
            if (isPointNearLine(point, line.points[i], line.points[i + 1])) {
              return { type: "outOfBoundsLine" as const, id: line.id }
            }
          }
        }
      }

      // Check placed icons
      if (visibleLayers.includes("icons")) {
        for (const icon of placedIcons) {
          const iconWidth = customIcons.find((ci) => ci.id === icon.iconId)?.width || 20
          const iconHeight = customIcons.find((ci) => ci.id === icon.iconId)?.height || 20

          const scaledWidth = iconWidth * icon.scale
          const scaledHeight = iconHeight * icon.scale

          if (
            point.x >= icon.position.x - scaledWidth / 2 &&
            point.x <= icon.position.x + scaledWidth / 2 &&
            point.y >= icon.position.y - scaledHeight / 2 &&
            point.y <= icon.position.y + scaledHeight / 2
          ) {
            return { type: "placedIcon" as const, id: icon.id }
          }
        }
      }

      // Check cap lines
      if (visibleLayers.includes("cap")) {
        for (const line of capLines) {
          if (isPointNearPath(point, line.points)) {
            return { type: "capLine" as const, id: line.id }
          }
        }
      }

      // Check time measurements
      if (visibleLayers.includes("time")) {
        for (const measurement of timeMeasurements) {
          if (isPointNearLine(point, measurement.start, measurement.end)) {
            return { type: "timeMeasurement" as const, id: measurement.id }
          }
        }
      }

      // Check text elements
      if (visibleLayers.includes("drawings")) {
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
      timeMeasurements,
      capLines,
      textElements,
      scale,
    ],
  )

  // Add these to the return value of the context provider

  // Map reset function
  const handleResetMap = () => {
    setMeasurements([])
    setRangeCircles([])
    setDrawingPaths([])
    setArtilleryShots([])
    setPlacedIcons([])
    setCustomIcons([])
    setOutOfBoundsLines([])
    setTimeMeasurements([])
    setCapLines([])
    setTextElements([])
    setVisibleLayers([
      "measurements",
      "ranges",
      "icons",
      "artillery",
      "bounds",
      "drawings",
      "time",
      "cap",
      "locations",
      "text",
    ])
    setSelectedItem(null)
  }

  useEffect(() => {
    if (activeMapImageId) {
      const activeImage = mapImages.find((img) => img.id === activeMapImageId)
      if (activeImage) {
        setMapUrl(activeImage.url)
      }
    }
  }, [activeMapImageId, mapImages])

  return (
    <MapContext.Provider
      value={{
        // All existing values...
        mapUrl,
        setMapUrl,

        // Add new map image values
        mapImages,
        setMapImages,
        activeMapImageId,
        setActiveMapImageId,

        // ... rest of the existing values ...
        scale,
        setScale,
        activeTool,
        setActiveTool,
        measurements,
        addMeasurement,
        deleteMeasurement,
        rangeCircles,
        addRangeCircle,
        deleteRangeCircle,
        visibleLayers,
        toggleLayer,
        calibrationPoints,
        setCalibrationPoints,
        knownDistance,
        setKnownDistance,
        clearMeasurements,
        clearRangeCircles,
        // Drawing-related values
        drawingPaths,
        addDrawingPath,
        deleteDrawingPath,
        clearDrawings,
        drawingSettings,
        updateDrawingSettings,
        // Artillery-related values
        artilleryShots,
        addArtilleryShot,
        deleteArtilleryShot,
        clearArtilleryShots,
        artillerySettings,
        updateArtillerySettings,
        // Icon-related values
        customIcons,
        addCustomIcon,
        removeCustomIcon,
        placedIcons,
        addPlacedIcon,
        removePlacedIcon,
        updatePlacedIcon,
        selectedIconId,
        setSelectedIconId,
        clearPlacedIcons,
        // History-related values
        canUndo,
        canRedo,
        undo,
        redo,
        // Calibration line visibility
        showCalibrationLine,
        toggleCalibrationLine: () => setShowCalibrationLine((prev) => !prev),
        outOfBoundsLines,
        addOutOfBoundsLine,
        deleteOutOfBoundsLine,
        clearOutOfBoundsLines,
        outOfBoundsSettings,
        updateOutOfBoundsSettings,
        // Selection-related values
        selectedItem,
        setSelectedItem,
        deleteSelectedItem,
        // Time-related values
        timeMeasurements,
        addTimeMeasurement,
        deleteTimeMeasurement,
        clearTimeMeasurements,
        timeToolSettings,
        updateTimeToolSettings,
        // Cap-related values
        capLines,
        addCapLine,
        deleteCapLine,
        clearCapLines,
        // Confirmation dialog
        confirmationDialog,
        setConfirmationDialog,
        // Briefing-related values
        briefingMode,
        setBriefingMode,
        briefingData,
        setBriefingData,
        activeBriefingSection,
        setActiveBriefingSection,
        highlightedMapPoints,
        addHighlightPoint,
        removeHighlightPoint,
        clearHighlightPoints,
        briefingPanelWidth,
        setBriefingPanelWidth,

        // New location picking values
        locationPickingState,
        startLocationPicking,
        cancelLocationPicking,
        completeLocationPicking,

        // Location viewing values
        locationViewingState,
        viewLocation,
        closeLocationView,

        toggleAllLayers,

        // Text-related values
        textElements,
        addTextElement,
        deleteTextElement,
        clearTextElements,
        textSettings,
        updateTextSettings,

        // Add these setter functions
        setMeasurements,
        setRangeCircles,
        setDrawingPaths,
        setArtilleryShots,
        setPlacedIcons,
        setCustomIcons,
        setOutOfBoundsLines,
        setTimeMeasurements,
        setCapLines,
        setVisibleLayers,
        setTextElements,

        // Map reset function
        handleResetMap,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider")
  }
  return context
}
