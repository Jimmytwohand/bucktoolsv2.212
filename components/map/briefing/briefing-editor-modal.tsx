"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  useMap,
  type MapBriefing,
  type BriefingSection,
  type StrategicLocation,
  type MapImage,
} from "@/contexts/map-context"
import { Plus, Trash, ChevronUp, ChevronDown, Save, X, MapPin, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import {
  Dialog as LocationPickerDialog,
  DialogContent as LocationPickerDialogContent,
  DialogHeader as LocationPickerDialogHeader,
  DialogTitle as LocationPickerDialogTitle,
  DialogFooter as LocationPickerDialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

export function BriefingEditorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    briefingData,
    setBriefingData,
    startLocationPicking,
    mapImages,
    setMapImages,
    activeMapImageId,
    setActiveMapImageId,
  } = useMap()
  const [editedBriefing, setEditedBriefing] = useState<MapBriefing | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const originalOnCloseRef = useRef(onClose)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  // State for managing map images
  const [newImageName, setNewImageName] = useState("")
  const [newImageType, setNewImageType] = useState("satellite")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize edited briefing when the modal opens
  useEffect(() => {
    if (isOpen) {
      const currentMapId = localStorage.getItem("currentMapId") || "unknown"

      if (briefingData) {
        setEditedBriefing({ ...briefingData })
      } else {
        // Create a new briefing if none exists
        setEditedBriefing({
          id: uuidv4(),
          mapId: currentMapId,
          title: "New Briefing",
          author: "Anonymous",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: [],
          strategicLocations: [],
        })
      }

      // Store the original onClose function
      originalOnCloseRef.current = onClose
    }
  }, [isOpen, briefingData])

  // Effect to reopen the modal after location picking
  useEffect(() => {
    if (isPickingLocation) {
      // If we were picking a location but now we're not, reopen the modal
      const checkPickingState = () => {
        if (!isPickingLocation) return

        // Check if we're still in location picking mode
        const locationPickingElement = document.querySelector('[data-location-picking="true"]')
        if (!locationPickingElement) {
          setIsPickingLocation(false)
        } else {
          // Check again in a moment
          setTimeout(checkPickingState, 100)
        }
      }

      checkPickingState()
    }
  }, [isPickingLocation])

  // Listen for the reopen event
  useEffect(() => {
    const handleReopenEvent = (e: any) => {
      if (e.detail?.briefing) {
        setEditedBriefing(e.detail.briefing)
        // Use a new function to avoid the original onClose being called
        originalOnCloseRef.current(false) // Force reopen
      }
    }

    document.addEventListener("reopenBriefingEditor", handleReopenEvent)
    return () => {
      document.removeEventListener("reopenBriefingEditor", handleReopenEvent)
    }
  }, [])

  const handleSave = () => {
    if (!editedBriefing) return

    // Update the timestamp
    const updatedBriefing = {
      ...editedBriefing,
      updatedAt: new Date().toISOString(),
    }

    // Save to context
    setBriefingData(updatedBriefing)

    // Save to localStorage
    try {
      const storedBriefings = localStorage.getItem("mapBriefings")
      const briefings = storedBriefings ? JSON.parse(storedBriefings) : []

      // Find and replace existing briefing or add new one
      const existingIndex = briefings.findIndex((b: MapBriefing) => b.mapId === updatedBriefing.mapId)
      if (existingIndex >= 0) {
        briefings[existingIndex] = updatedBriefing
      } else {
        briefings.push(updatedBriefing)
      }

      localStorage.setItem("mapBriefings", JSON.stringify(briefings))
    } catch (error) {
      console.error("Failed to save briefing to localStorage:", error)
    }

    originalOnCloseRef.current()
  }

  const addSection = () => {
    if (!editedBriefing) return

    const newSection: BriefingSection = {
      id: uuidv4(),
      title: "New Section",
      content: "",
      order: editedBriefing.sections.length,
      mapReferences: [],
    }

    setEditedBriefing({
      ...editedBriefing,
      sections: [...editedBriefing.sections, newSection],
    })
  }

  const updateSection = (sectionId: string, updates: Partial<BriefingSection>) => {
    if (!editedBriefing) return

    setEditedBriefing({
      ...editedBriefing,
      sections: editedBriefing.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    })
  }

  const deleteSection = (sectionId: string) => {
    if (!editedBriefing) return

    setEditedBriefing({
      ...editedBriefing,
      sections: editedBriefing.sections.filter((section) => section.id !== sectionId),
    })
  }

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    if (!editedBriefing) return

    const sections = [...editedBriefing.sections]
    const index = sections.findIndex((section) => section.id === sectionId)

    if (index === -1) return

    if (direction === "up" && index > 0) {
      // Swap with previous section
      ;[sections[index - 1], sections[index]] = [sections[index], sections[index - 1]]
    } else if (direction === "down" && index < sections.length - 1) {
      // Swap with next section
      ;[sections[index], sections[index + 1]] = [sections[index + 1], sections[index]]
    }

    // Update order property
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      order: idx,
    }))

    setEditedBriefing({
      ...editedBriefing,
      sections: updatedSections,
    })
  }

  const addLocation = () => {
    if (!editedBriefing) return

    const newLocation: StrategicLocation = {
      id: uuidv4(),
      name: "New Location",
      description: "",
      imageUrl: "",
      coordinates: { x: 0, y: 0 },
      highlightRadius: 50,
    }

    setEditedBriefing({
      ...editedBriefing,
      strategicLocations: [...editedBriefing.strategicLocations, newLocation],
    })
  }

  const updateLocation = (locationId: string, updates: Partial<StrategicLocation>) => {
    if (!editedBriefing) return

    setEditedBriefing({
      ...editedBriefing,
      strategicLocations: editedBriefing.strategicLocations.map((location) =>
        location.id === locationId ? { ...location, ...updates } : location,
      ),
    })
  }

  const deleteLocation = (locationId: string) => {
    if (!editedBriefing) return

    setEditedBriefing({
      ...editedBriefing,
      strategicLocations: editedBriefing.strategicLocations.filter((location) => location.id !== locationId),
    })
  }

  const handlePickLocation = (locationId: string) => {
    if (!editedBriefing) return

    // Store the current active tab so we can return to it
    const currentTab = activeTab

    // Mark that we're picking a location
    setIsPickingLocation(true)

    // Close the modal temporarily
    originalOnCloseRef.current()

    // Start location picking mode
    startLocationPicking(locationId, (x, y) => {
      // This callback will be called when a location is picked
      console.log("Location picked at coordinates:", x, y)

      // Find the location to update
      const locationToUpdate = editedBriefing.strategicLocations.find((location) => location.id === locationId)

      if (locationToUpdate) {
        console.log("Updating location:", locationToUpdate.name)
        console.log("Old coordinates:", locationToUpdate.coordinates)
        console.log("New coordinates:", { x, y })

        // Update the location coordinates in our local state
        const updatedLocations = editedBriefing.strategicLocations.map((location) =>
          location.id === locationId
            ? {
                ...location,
                coordinates: { x, y },
              }
            : location,
        )

        // Update our local state
        const updatedBriefing = {
          ...editedBriefing,
          strategicLocations: updatedLocations,
        }

        // Update the edited briefing state
        setEditedBriefing(updatedBriefing)

        // Also update the context immediately to see the change on the map
        setBriefingData(updatedBriefing)

        // Save to localStorage immediately
        try {
          const storedBriefings = localStorage.getItem("mapBriefings")
          const briefings = storedBriefings ? JSON.parse(storedBriefings) : []
          const existingIndex = briefings.findIndex((b: MapBriefing) => b.mapId === updatedBriefing.mapId)

          if (existingIndex >= 0) {
            briefings[existingIndex] = updatedBriefing
          } else {
            briefings.push(updatedBriefing)
          }

          localStorage.setItem("mapBriefings", JSON.stringify(briefings))
        } catch (error) {
          console.error("Failed to save briefing to localStorage:", error)
        }
      } else {
        console.error("Could not find location with ID:", locationId)
      }

      // We're done picking
      setIsPickingLocation(false)

      // Reopen the modal after a short delay
      setTimeout(() => {
        // Force the modal to reopen
        if (isOpen === false) {
          onClose(true)
        }

        // Set the active tab back to locations
        setActiveTab(currentTab)
      }, 100)
    })
  }

  const handleOpenLocationPicker = (sectionId: string, textareaElement: HTMLTextAreaElement) => {
    setCurrentSectionId(sectionId)
    setTextareaRef(textareaElement)
    setIsLocationPickerOpen(true)
  }

  const handleInsertLocationReference = (location: StrategicLocation) => {
    if (!textareaRef || !currentSectionId) return

    // Create the location reference tag
    const locationTag = `[location: ${location.coordinates.x},${location.coordinates.y}, ${location.highlightRadius || 30}]${location.name}[/location]`

    // Get the current cursor position
    const cursorPosition = textareaRef.selectionStart

    // Get the current content
    const currentContent = textareaRef.value

    // Insert the location tag at the cursor position
    const newContent =
      currentContent.substring(0, cursorPosition) + locationTag + currentContent.substring(cursorPosition)

    // Update the section content
    if (editedBriefing) {
      updateSection(currentSectionId, { content: newContent })
    }

    // Close the location picker
    setIsLocationPickerOpen(false)

    // Focus back on the textarea and set cursor position after the inserted tag
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus()
        textareaRef.setSelectionRange(cursorPosition + locationTag.length, cursorPosition + locationTag.length)
      }
    }, 100)
  }

  // Function to handle file upload for alternative map views
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string

      // Create a new map image
      const newImage: MapImage = {
        id: `image_${Date.now()}`,
        type: newImageType,
        url: dataUrl,
        label: newImageName || `${newImageType.charAt(0).toUpperCase() + newImageType.slice(1)} View`,
      }

      // Add to map images
      setMapImages([...mapImages, newImage])

      // Reset form
      setNewImageName("")
      setNewImageType("satellite")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    reader.readAsDataURL(file)
  }

  // Function to delete a map image
  const handleDeleteMapImage = (imageId: string) => {
    // Don't allow deleting the last image
    if (mapImages.length <= 1) return

    // Update active image if needed
    if (activeMapImageId === imageId) {
      // Find another image to set as active
      const newActiveImage = mapImages.find((img) => img.id !== imageId)
      if (newActiveImage) {
        setActiveMapImageId(newActiveImage.id)
      }
    }

    // Remove the image
    setMapImages(mapImages.filter((img) => img.id !== imageId))
  }

  // Function to update a map image
  const handleUpdateMapImage = (imageId: string, updates: Partial<MapImage>) => {
    setMapImages(mapImages.map((img) => (img.id === imageId ? { ...img, ...updates } : img)))
  }

  if (!editedBriefing) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && originalOnCloseRef.current()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Map</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4 flex-shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="locations">Strategic Locations</TabsTrigger>
            <TabsTrigger value="mapImages">Map Views</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <TabsContent value="general" className="flex-1 overflow-auto p-2 data-[state=inactive]:hidden">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedBriefing.title}
                    onChange={(e) => setEditedBriefing({ ...editedBriefing, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={editedBriefing.author}
                    onChange={(e) => setEditedBriefing({ ...editedBriefing, author: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Map ID</Label>
                  <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
                    {editedBriefing.mapId}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Created</Label>
                  <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
                    {new Date(editedBriefing.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted">
                    {new Date(editedBriefing.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
              <div className="flex justify-between items-center p-2 flex-shrink-0">
                <h3 className="text-lg font-medium">Briefing Sections</h3>
                <Button onClick={addSection} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Section
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-6 pb-6">
                  {editedBriefing.sections.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">
                      No sections yet. Add a section to get started.
                    </div>
                  ) : (
                    editedBriefing.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div key={section.id} className="border rounded-md p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <Input
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              className="font-medium"
                              placeholder="Section Title"
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveSection(section.id, "up")}
                                disabled={section.order === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveSection(section.id, "down")}
                                disabled={section.order === editedBriefing.sections.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSection(section.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="relative">
                            <Textarea
                              value={section.content}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              placeholder="Section content..."
                              className="min-h-[100px]"
                              ref={(el) => {
                                // This creates a ref to the textarea for the current section
                                if (el && section.id === currentSectionId) {
                                  setTextareaRef(el)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="absolute bottom-2 right-2 h-7 px-2 text-xs"
                              onClick={(e) => {
                                // Get the textarea element
                                const textarea = e.currentTarget.parentElement?.querySelector("textarea")
                                if (textarea) {
                                  handleOpenLocationPicker(section.id, textarea)
                                }
                              }}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              Insert Location
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
              <div className="flex justify-between items-center p-2 flex-shrink-0">
                <h3 className="text-lg font-medium">Strategic Locations</h3>
                <Button onClick={addLocation} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Location
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-6 pb-6">
                  {editedBriefing.strategicLocations.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">
                      No strategic locations yet. Add a location to get started.
                    </div>
                  ) : (
                    editedBriefing.strategicLocations.map((location) => (
                      <div key={location.id} className="border rounded-md p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Input
                            value={location.name}
                            onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                            className="font-medium"
                            placeholder="Location Name"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLocation(location.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`location-image-${location.id}`}>Image URL</Label>
                          <Input
                            id={`location-image-${location.id}`}
                            value={location.imageUrl}
                            onChange={(e) => updateLocation(location.id, { imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`location-description-${location.id}`}>Description</Label>
                          <Textarea
                            id={`location-description-${location.id}`}
                            value={location.description}
                            onChange={(e) => updateLocation(location.id, { description: e.target.value })}
                            placeholder="Location description..."
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`location-x-${location.id}`}>X Coordinate</Label>
                            <Input
                              id={`location-x-${location.id}`}
                              type="number"
                              value={location.coordinates.x}
                              onChange={(e) =>
                                updateLocation(location.id, {
                                  coordinates: {
                                    ...location.coordinates,
                                    x: Number.parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`location-y-${location.id}`}>Y Coordinate</Label>
                            <Input
                              id={`location-y-${location.id}`}
                              type="number"
                              value={location.coordinates.y}
                              onChange={(e) =>
                                updateLocation(location.id, {
                                  coordinates: {
                                    ...location.coordinates,
                                    y: Number.parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2"
                              onClick={() => handlePickLocation(location.id)}
                            >
                              <MapPin className="h-4 w-4" /> Pick Location on Map
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`location-radius-${location.id}`}>Highlight Radius</Label>
                          <Input
                            id={`location-radius-${location.id}`}
                            type="number"
                            value={location.highlightRadius || 50}
                            onChange={(e) =>
                              updateLocation(location.id, {
                                highlightRadius: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mapImages" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
              <div className="flex justify-between items-center p-2 flex-shrink-0">
                <h3 className="text-lg font-medium">Alternative Map Views</h3>
                <Button size="sm" className="flex items-center gap-1" onClick={() => fileInputRef.current?.click()}>
                  <Plus className="h-4 w-4" /> Add Map View
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="p-4 border rounded-md mb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-image-name">View Name</Label>
                    <Input
                      id="new-image-name"
                      value={newImageName}
                      onChange={(e) => setNewImageName(e.target.value)}
                      placeholder="e.g., Satellite View"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-image-type">View Type</Label>
                    <select
                      id="new-image-type"
                      value={newImageType}
                      onChange={(e) => setNewImageType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="satellite">Satellite</option>
                      <option value="terrain">Terrain</option>
                      <option value="tactical">Tactical</option>
                      <option value="historical">Historical</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image File
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 p-2">
                  {mapImages.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">
                      No map views available. Add a view to get started.
                    </div>
                  ) : (
                    mapImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="relative aspect-video">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.label}
                            className="object-cover w-full h-full"
                          />
                          {activeMapImageId === image.id && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                              Active
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="font-medium">{image.label}</h3>
                              <p className="text-xs text-muted-foreground">{image.type}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveMapImageId(image.id)}
                                disabled={activeMapImageId === image.id}
                              >
                                Set Active
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMapImage(image.id)}
                                disabled={mapImages.length <= 1}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <Label htmlFor={`image-label-${image.id}`}>Label</Label>
                            <Input
                              id={`image-label-${image.id}`}
                              value={image.label}
                              onChange={(e) => handleUpdateMapImage(image.id, { label: e.target.value })}
                              placeholder="Map view label"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={originalOnCloseRef.current} className="gap-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* Location Picker Modal */}
      <LocationPickerDialog open={isLocationPickerOpen} onOpenChange={setIsLocationPickerOpen}>
        <LocationPickerDialogContent className="sm:max-w-[500px] max-h-[80vh]">
          <LocationPickerDialogHeader>
            <LocationPickerDialogTitle>Select a Strategic Location</LocationPickerDialogTitle>
          </LocationPickerDialogHeader>

          <ScrollArea className="max-h-[50vh] mt-4">
            <div className="grid gap-4 p-1">
              {editedBriefing?.strategicLocations.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No strategic locations available. Add locations in the Strategic Locations tab first.
                </div>
              ) : (
                editedBriefing?.strategicLocations.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleInsertLocationReference(location)}
                  >
                    <div className="flex items-start gap-3">
                      {location.imageUrl && (
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={location.imageUrl || "/placeholder.svg"}
                            alt={location.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{location.name}</h4>
                        {location.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Coordinates: {location.coordinates.x}, {location.coordinates.y}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <LocationPickerDialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsLocationPickerOpen(false)}>
              Cancel
            </Button>
          </LocationPickerDialogFooter>
        </LocationPickerDialogContent>
      </LocationPickerDialog>
    </Dialog>
  )
}
