"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapCanvas } from "@/components/map/map-canvas"
import { CalibrationModal } from "@/components/map/calibration-modal"
import { MapToolbar } from "@/components/map/map-toolbar"
import { RegimentPanel } from "@/components/map/regiment-panel"
import { ArtilleryPanel } from "@/components/map/artillery-panel"
import { IconPanel } from "@/components/map/icon-panel"
import { MapProvider, useMap } from "@/contexts/map-context"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"
import { MapSwitcher } from "@/components/map/map-switcher"
import { MapImageSwitcher } from "@/components/map/map-image-switcher"
import { ConfirmationDialog } from "@/components/map/confirmation-dialog"
import { BriefingPanel } from "@/components/map/briefing/briefing-panel"
import { LocationImageViewer } from "@/components/map/briefing/location-image-viewer"
import { sampleBriefingData } from "@/components/map/sample-briefing-data"
import { LayerVisibilityPanel } from "@/components/map/layer-visibility-panel"
import { HelpPanel } from "@/components/map/help-panel"
import { ToolSettingsPanel } from "@/components/map/tool-settings-panel"

// Define the MapImage type
interface MapImage {
  id: string
  type: string
  url: string
  label: string
}

// Define a mapping of tools to their corresponding tabs
const TOOL_TO_TAB_MAPPING = {
  draw: "settings",
  artillery: "settings",
  outOfBounds: "settings",
  time: "settings",
  text: "settings", // Add text tool to settings tab
  icon: "icons",
  help: "help",
}

export function MapInterface() {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false)

  return (
    <MapProvider>
      <MapInterfaceContent
        isMapLoaded={isMapLoaded}
        setIsMapLoaded={setIsMapLoaded}
        isCalibrationModalOpen={isCalibrationModalOpen}
        setIsCalibrationModalOpen={setIsCalibrationModalOpen}
      />
    </MapProvider>
  )
}

interface MapInterfaceContentProps {
  isMapLoaded: boolean
  setIsMapLoaded: (loaded: boolean) => void
  isCalibrationModalOpen: boolean
  setIsCalibrationModalOpen: (open: boolean) => void
}

function MapInterfaceContent({
  isMapLoaded,
  setIsMapLoaded,
  isCalibrationModalOpen,
  setIsCalibrationModalOpen,
}: MapInterfaceContentProps) {
  const {
    mapUrl,
    setMapUrl,
    mapImages,
    setMapImages,
    activeMapImageId,
    setActiveMapImageId,
    scale,
    calibrationPoints,
    confirmationDialog,
    setBriefingData,
    briefingMode,
    briefingPanelWidth,
    activeTool,
    handleResetMap,
  } = useMap()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapCanvasRef = useRef<any>(null)
  const [activeTab, setActiveTab] = useState("regiments")
  const [lastActiveTool, setLastActiveTool] = useState<string | null>(null)

  const handleMapLoad = (e: React.FormEvent) => {
    e.preventDefault()
    if (mapUrl) {
      // Create initial map images array with the standard map
      const initialImages: MapImage[] = [
        {
          id: "standard",
          type: "standard",
          url: mapUrl,
          label: "Standard Map",
        },
      ]

      setMapImages(initialImages)
      setActiveMapImageId("standard")
      setIsMapLoaded(true)
    }
  }

  const handleFitToScreen = () => {
    if (mapCanvasRef.current?.fitToScreen) {
      mapCanvasRef.current.fitToScreen()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string

      // Create initial map images array with the standard map
      const initialImages: MapImage[] = [
        {
          id: "standard",
          type: "standard",
          url: dataUrl,
          label: "Standard Map",
        },
      ]

      setMapImages(initialImages)
      setActiveMapImageId("standard")
      setMapUrl(dataUrl)
      setIsMapLoaded(true)
    }
    reader.readAsDataURL(file)
  }

  // Add a function to add an alternative map image
  const handleAddAlternativeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string

      // Add the new image to the existing images
      const newImage: MapImage = {
        id: `image_${Date.now()}`,
        type: "satellite", // Default to satellite, can be changed later
        url: dataUrl,
        label: "Satellite View", // Default label, can be changed later
      }

      setMapImages((prev) => [...prev, newImage])

      // Optionally switch to the new image
      setActiveMapImageId(newImage.id)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (isMapLoaded && mapUrl) {
      // Check if the current map is Gettysburg (map ID 1)
      const currentMapId = localStorage.getItem("currentMapId")

      // Try to load briefing from localStorage first
      const storedBriefings = localStorage.getItem("mapBriefings")
      if (storedBriefings) {
        try {
          const briefings = JSON.parse(storedBriefings)
          const existingBriefing = briefings.find((b: any) => b.mapId === currentMapId)

          if (existingBriefing) {
            setBriefingData(existingBriefing)
            return
          }
        } catch (error) {
          console.error("Failed to parse stored briefings:", error)
        }
      }

      // Fall back to sample data for Gettysburg
      if (currentMapId === "1") {
        setBriefingData(sampleBriefingData)
      } else {
        setBriefingData(null)
      }
    }
  }, [isMapLoaded, mapUrl, setBriefingData])

  // Improved tab switching logic
  useEffect(() => {
    console.log("MapInterface: activeTool changed to", activeTool, "from", lastActiveTool)

    // Check if the tool has a corresponding tab in our mapping
    if (activeTool && TOOL_TO_TAB_MAPPING[activeTool as keyof typeof TOOL_TO_TAB_MAPPING]) {
      const targetTab = TOOL_TO_TAB_MAPPING[activeTool as keyof typeof TOOL_TO_TAB_MAPPING]
      console.log(`Switching to ${targetTab} tab for ${activeTool} tool`)
      setActiveTab(targetTab)
    }

    // Update the last active tool
    setLastActiveTool(activeTool)
  }, [activeTool])

  // Add this useEffect to listen for the custom event
  useEffect(() => {
    const handleAlternativeMapUploaded = (event: any) => {
      const { dataUrl } = event.detail

      // Add the new image to the existing images
      const newImage: MapImage = {
        id: `image_${Date.now()}`,
        type: "satellite", // Default to satellite, can be changed later
        url: dataUrl,
        label: "Satellite View", // Default label, can be changed later
      }

      setMapImages((prev) => [...prev, newImage])

      // Optionally switch to the new image
      setActiveMapImageId(newImage.id)
    }

    const alternativeMapFile = document.getElementById("alternative-map-file")
    if (alternativeMapFile) {
      alternativeMapFile.addEventListener("alternativeMapUploaded", handleAlternativeMapUploaded)
    }

    return () => {
      if (alternativeMapFile) {
        alternativeMapFile.removeEventListener("alternativeMapUploaded", handleAlternativeMapUploaded)
      }
    }
  }, [setMapImages, setActiveMapImageId])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Compact header */}
      <header className="border-b border-gray-800 bg-[#121920]">
        <div className="container h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="https://i.ibb.co/vC0KrW2Z/42nd-Patch-copy-6-2.png"
                alt="Bucktools Logo"
                width={40}
                height={40}
                className="rounded-sm"
              />
              <span className="text-xl font-black uppercase tracking-tighter text-white">Bucktools</span>
              <span className="text-xs align-top text-white">™</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {scale && (
              <Badge variant="outline" className="font-mono text-xs h-6">
                1px = {(1 / scale).toFixed(2)} yards
              </Badge>
            )}
            <MapImageSwitcher />
            <MapSwitcher />
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2 text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/maps">All Maps</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!isMapLoaded ? (
          <div className="relative min-h-[calc(100vh-2.5rem)] flex flex-col items-center justify-center">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skirmbw-YKFO3fj1b1RvFS2NVHrakMyprHGtbO.png"
                alt="Civil War Battlefield"
                fill
                className="object-cover brightness-75"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
            </div>

            <div className="relative z-10 container flex flex-col items-center justify-center gap-6 py-24">
              <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">Load a Map</h1>
              <p className="text-white/80 text-lg max-w-md text-center mb-6">
                Upload a map image or enter a URL to begin planning your battlefield strategy
              </p>

              <div className="flex w-full max-w-3xl flex-col md:flex-row gap-6">
                {/* URL Input Form */}
                <div className="flex-1 rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-6 shadow-xl">
                  <h2 className="text-xl font-semibold mb-4 text-white">Load from URL</h2>
                  <form onSubmit={handleMapLoad} className="flex flex-col gap-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="map-url" className="text-white">
                        Map URL
                      </Label>
                      <Input
                        id="map-url"
                        type="url"
                        placeholder="https://example.com/map.jpg"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                        required
                        className="bg-black/50 border-white/30 text-white"
                      />
                      <p className="text-xs text-white/60 mt-1">Enter a direct URL to an image file (JPG, PNG, etc.)</p>
                    </div>
                    <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-black border-none mt-2">
                      Load Map
                    </Button>
                  </form>
                </div>

                {/* File Upload */}
                <div className="flex-1 rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-6 shadow-xl">
                  <h2 className="text-xl font-semibold mb-4 text-white">Upload Local Image</h2>
                  <div className="flex flex-col gap-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="map-file" className="text-white">
                        Map File
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          ref={fileInputRef}
                          id="map-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button
                          variant="outline"
                          className="w-full justify-center border-white text-white hover:bg-white/10"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Image
                        </Button>
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        Upload a local image file from your device (JPG, PNG, etc.)
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-400 hover:bg-blue-500 text-black border-none mt-2"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="lg" asChild className="mt-8 border-white text-white hover:bg-white/10">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Left sidebar for tools */}
            <div className="hidden md:block w-12 border-r border-white/20 bg-black/40 backdrop-blur-sm overflow-y-auto flex flex-col h-[calc(100vh-4rem)]">
              <MapToolbar
                onCalibrate={() => setIsCalibrationModalOpen(true)}
                onFitToScreen={handleFitToScreen}
                orientation="vertical"
                onHelpClick={() => setActiveTab("help")}
                canvasRef={mapCanvasRef}
                onToolActivated={(tool) => {
                  // Direct tab switching when a tool is activated
                  if (tool && TOOL_TO_TAB_MAPPING[tool as keyof typeof TOOL_TO_TAB_MAPPING]) {
                    const targetTab = TOOL_TO_TAB_MAPPING[tool as keyof typeof TOOL_TO_TAB_MAPPING]
                    console.log(`Direct tab switch to ${targetTab} for ${tool} tool`)
                    setActiveTab(targetTab)
                  }
                }}
              />
            </div>

            {/* Mobile toolbar (only visible on small screens) */}
            <div className="md:hidden w-full border-b border-white/20 bg-black/40 backdrop-blur-sm">
              <MapToolbar
                onCalibrate={() => setIsCalibrationModalOpen(true)}
                onFitToScreen={handleFitToScreen}
                orientation="horizontal"
                onHelpClick={() => setActiveTab("help")}
                canvasRef={mapCanvasRef}
                onToolActivated={(tool) => {
                  // Direct tab switching when a tool is activated
                  if (tool && TOOL_TO_TAB_MAPPING[tool as keyof typeof TOOL_TO_TAB_MAPPING]) {
                    const targetTab = TOOL_TO_TAB_MAPPING[tool as keyof typeof TOOL_TO_TAB_MAPPING]
                    console.log(`Direct tab switch to ${targetTab} for ${tool} tool`)
                    setActiveTab(targetTab)
                  }
                }}
              />
            </div>

            {/* Main content area with map, briefing panel, and right sidebar */}
            <div className="flex flex-1 overflow-hidden">
              {/* Briefing panel */}
              {briefingMode && <BriefingPanel />}

              {/* Map container - adjust width based on briefing panel */}
              <div
                className="flex flex-1 flex-col md:flex-row overflow-hidden"
                style={{
                  width: briefingMode ? `calc(100% - ${briefingPanelWidth}px)` : "100%",
                  transition: "width 0.3s ease",
                }}
              >
                <div className="flex-1 overflow-hidden">
                  <MapCanvas mapUrl={mapUrl} onReset={handleResetMap} ref={mapCanvasRef} />

                  {calibrationPoints.length > 0 && calibrationPoints.length < 2 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-md">
                      Click on the map to place the second calibration point
                    </div>
                  )}
                </div>

                <div className="h-64 md:h-auto md:w-96 border-t md:border-t-0 md:border-l border-white/20 bg-black/60 backdrop-blur-md">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6 bg-black/60">
                      <TabsTrigger
                        value="regiments"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Regiments
                      </TabsTrigger>
                      <TabsTrigger
                        value="artillery"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Artillery
                      </TabsTrigger>
                      <TabsTrigger
                        value="icons"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Icons
                      </TabsTrigger>
                      <TabsTrigger
                        value="overlay"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Overlay
                      </TabsTrigger>
                      <TabsTrigger
                        value="settings"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Settings
                      </TabsTrigger>
                      <TabsTrigger
                        value="help"
                        className="data-[state=active]:bg-blue-400/20 data-[state=active]:text-white"
                      >
                        Help
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="regiments" className="p-4 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <RegimentPanel />
                    </TabsContent>
                    <TabsContent value="artillery" className="p-4 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <ArtilleryPanel />
                    </TabsContent>
                    <TabsContent value="icons" className="p-4 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <IconPanel />
                    </TabsContent>
                    <TabsContent value="overlay" className="p-4 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <LayerVisibilityPanel />
                    </TabsContent>
                    <TabsContent value="help" className="p-4 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <HelpPanel />
                    </TabsContent>
                    <TabsContent value="settings" className="p-0 overflow-auto max-h-[calc(100vh-2.5rem-2.5rem)]">
                      <ToolSettingsPanel />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CalibrationModal isOpen={isCalibrationModalOpen} onClose={() => setIsCalibrationModalOpen(false)} />
      <ConfirmationDialog />
      <LocationImageViewer />
      {/* Add a hidden input for uploading alternative map images */}
      <input
        type="file"
        id="alternative-map-file"
        accept="image/*"
        className="hidden"
        onChange={handleAddAlternativeImage}
      />
    </div>
  )
}
