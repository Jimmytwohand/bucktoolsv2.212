"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMap } from "@/contexts/map-context"
import { ImageIcon, Database, Save, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SaveMapModalProps {
  isOpen: boolean
  onClose: () => void
  canvasRef: React.RefObject<any>
}

type SaveFormat = "image" | "data"

export function SaveMapModal({ isOpen, onClose, canvasRef }: SaveMapModalProps) {
  const {
    mapUrl,
    setMapUrl,
    measurements,
    setMeasurements,
    rangeCircles,
    setRangeCircles,
    drawingPaths,
    setDrawingPaths,
    artilleryShots,
    setArtilleryShots,
    placedIcons,
    setPlacedIcons,
    customIcons,
    setCustomIcons,
    outOfBoundsLines,
    setOutOfBoundsLines,
    timeMeasurements,
    setTimeMeasurements,
    capLines,
    setCapLines,
    visibleLayers,
    setVisibleLayers,
    scale,
    setScale,
    briefingData,
    setBriefingData,
    calibrationPoints,
    setCalibrationPoints,
    knownDistance,
    setKnownDistance,
  } = useMap()

  const [activeTab, setActiveTab] = useState<"save" | "import">("save")
  const [filename, setFilename] = useState("bucktools-map")
  const [saveFormat, setSaveFormat] = useState<SaveFormat>("image")
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!canvasRef.current) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      if (saveFormat === "image") {
        // Get the actual canvas element from the MapCanvas component
        const canvas = canvasRef.current.getCanvasElement?.()

        if (!canvas || !canvas.toDataURL) {
          throw new Error("Canvas element not available")
        }

        // Save as image
        const dataUrl = canvas.toDataURL(`image/${imageFormat}`, 0.9)

        // Create download link
        const link = downloadLinkRef.current
        if (link) {
          link.href = dataUrl
          link.download = `${filename}.${imageFormat}`
          link.click()
        }
      } else {
        // Save as data (JSON)
        const mapData = {
          version: "1.0.0", // Adding version for future compatibility
          timestamp: new Date().toISOString(),
          mapUrl,
          scale,
          calibrationPoints,
          knownDistance,
          visibleLayers,
          measurements: visibleLayers.includes("measurements") ? measurements : [],
          rangeCircles: visibleLayers.includes("ranges") ? rangeCircles : [],
          drawingPaths: visibleLayers.includes("drawings") ? drawingPaths : [],
          artilleryShots: visibleLayers.includes("artillery") ? artilleryShots : [],
          placedIcons: visibleLayers.includes("icons") ? placedIcons : [],
          customIcons,
          outOfBoundsLines: visibleLayers.includes("bounds") ? outOfBoundsLines : [],
          timeMeasurements: visibleLayers.includes("time") ? timeMeasurements : [],
          capLines: visibleLayers.includes("cap") ? capLines : [],
          briefingData,
        }

        // Convert to JSON and create blob
        const jsonString = JSON.stringify(mapData, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const dataUrl = URL.createObjectURL(blob)

        // Create download link
        const link = downloadLinkRef.current
        if (link) {
          link.href = dataUrl
          link.download = `${filename}.json`
          link.click()

          // Clean up the object URL
          setTimeout(() => URL.revokeObjectURL(dataUrl), 100)
        }
      }

      setSuccess(`Map ${saveFormat === "image" ? "image" : "data"} saved successfully!`)

      // Close modal after a delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Error saving map:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      // Read the file
      const fileContent = await readFileAsText(file)

      // Parse JSON
      const mapData = JSON.parse(fileContent)

      // Validate data structure
      if (!validateMapData(mapData)) {
        throw new Error("Invalid map data format")
      }

      // Restore map state
      if (mapData.mapUrl) setMapUrl(mapData.mapUrl)
      if (mapData.scale !== undefined) setScale(mapData.scale)
      if (mapData.calibrationPoints) setCalibrationPoints(mapData.calibrationPoints)
      if (mapData.knownDistance !== undefined) setKnownDistance(mapData.knownDistance)
      if (mapData.visibleLayers) setVisibleLayers(mapData.visibleLayers)

      // Restore all map elements
      if (mapData.measurements) setMeasurements(mapData.measurements)
      if (mapData.rangeCircles) setRangeCircles(mapData.rangeCircles)
      if (mapData.drawingPaths) setDrawingPaths(mapData.drawingPaths)
      if (mapData.artilleryShots) setArtilleryShots(mapData.artilleryShots)

      // Handle custom icons
      if (mapData.customIcons) setCustomIcons(mapData.customIcons)
      if (mapData.placedIcons) setPlacedIcons(mapData.placedIcons)

      // Restore other elements
      if (mapData.outOfBoundsLines) setOutOfBoundsLines(mapData.outOfBoundsLines)
      if (mapData.timeMeasurements) setTimeMeasurements(mapData.timeMeasurements)
      if (mapData.capLines) setCapLines(mapData.capLines)

      // Optionally restore briefing data
      if (mapData.briefingData) setBriefingData(mapData.briefingData)

      setSuccess("Map data imported successfully!")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Error importing map data:", error)
      setError(error instanceof Error ? error.message : "Failed to import map data")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target?.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  // Helper function to validate map data
  const validateMapData = (data: any): boolean => {
    // Basic validation - check if it has at least some of the expected properties
    return (
      data &&
      (data.mapUrl !== undefined ||
        data.measurements !== undefined ||
        data.rangeCircles !== undefined ||
        data.drawingPaths !== undefined ||
        data.customIcons !== undefined)
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Map Operations</DialogTitle>
          <DialogDescription>Save or import map data</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "save" | "import")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">Save Map</TabsTrigger>
            <TabsTrigger value="import">Import Map</TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename"
                />
              </div>

              <div className="grid gap-2">
                <Label>Save Format</Label>
                <RadioGroup value={saveFormat} onValueChange={(value) => setSaveFormat(value as SaveFormat)}>
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="flex flex-1 items-center gap-2 cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Save as Image</p>
                        <p className="text-xs text-muted-foreground">Captures the current view exactly as you see it</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                    <RadioGroupItem value="data" id="data" />
                    <Label htmlFor="data" className="flex flex-1 items-center gap-2 cursor-pointer">
                      <Database className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Save Map Data</p>
                        <p className="text-xs text-muted-foreground">
                          Exports all map data for backup or future editing
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {saveFormat === "image" && (
                <div className="grid gap-2">
                  <Label>Image Format</Label>
                  <RadioGroup
                    value={imageFormat}
                    onValueChange={(value) => setImageFormat(value as "png" | "jpeg")}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="png" id="png" />
                      <Label htmlFor="png" className="cursor-pointer">
                        PNG (Higher Quality)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="jpeg" id="jpeg" />
                      <Label htmlFor="jpeg" className="cursor-pointer">
                        JPEG (Smaller Size)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isProcessing} className="gap-2">
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save {saveFormat === "image" ? "Image" : "Data"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-4">
            <div className="grid gap-4">
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">Click to select a map data file</p>
                <p className="text-xs text-muted-foreground mb-4">Import previously saved .json map data</p>
                <Button onClick={handleImportClick} disabled={isProcessing} className="gap-2">
                  {isProcessing ? "Processing..." : "Select File"}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              </div>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Importing map data will replace your current map configuration. Make sure to save your current work
                  first if needed.
                </AlertDescription>
              </Alert>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mt-4 bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Hidden download link */}
        <a ref={downloadLinkRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
