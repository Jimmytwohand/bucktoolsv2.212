"use client"

import { useState } from "react"
import Image from "next/image"
import { type StrategicLocation, useMap } from "@/contexts/map-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface StrategicLocationsGalleryProps {
  locations: StrategicLocation[]
  linkToMapActive: boolean
}

export function StrategicLocationsGallery({ locations, linkToMapActive }: StrategicLocationsGalleryProps) {
  const { addHighlightPoint, clearHighlightPoints } = useMap()
  const [selectedLocation, setSelectedLocation] = useState<StrategicLocation | null>(null)

  const handleLocationClick = (location: StrategicLocation) => {
    setSelectedLocation(location)

    if (linkToMapActive) {
      clearHighlightPoints()
      addHighlightPoint({
        id: `highlight-${location.id}`,
        coordinates: location.coordinates,
        radius: location.highlightRadius || 30,
        color: "#00ff00",
        opacity: 0.5,
        sourceId: location.id,
        temporary: true,
        expiresAt: Date.now() + 5000, // Highlight for 5 seconds
      })

      // TODO: Center map on these coordinates
    }
  }

  return (
    <>
      <div className="p-4 grid grid-cols-2 gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="border border-white/20 rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleLocationClick(location)}
          >
            <div className="aspect-video relative">
              <Image src={location.imageUrl || "/placeholder.svg"} alt={location.name} fill className="object-cover" />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-sm">{location.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedLocation} onOpenChange={(open) => !open && setSelectedLocation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLocation?.name}</DialogTitle>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-md overflow-hidden">
                <Image
                  src={selectedLocation.imageUrl || "/placeholder.svg"}
                  alt={selectedLocation.name}
                  fill
                  className="object-cover"
                />
              </div>

              <p className="text-sm">{selectedLocation.description}</p>

              <Button
                className="w-full"
                onClick={() => {
                  if (linkToMapActive) {
                    clearHighlightPoints()
                    addHighlightPoint({
                      id: `highlight-${selectedLocation.id}`,
                      coordinates: selectedLocation.coordinates,
                      radius: selectedLocation.highlightRadius || 30,
                      color: "#00ff00",
                      opacity: 0.5,
                      sourceId: selectedLocation.id,
                      temporary: true,
                      expiresAt: Date.now() + 10000, // Highlight for 10 seconds
                    })

                    // TODO: Center map on these coordinates
                    setSelectedLocation(null)
                  }
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Show on Map
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
