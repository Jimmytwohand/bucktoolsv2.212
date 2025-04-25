"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMap } from "@/contexts/map-context"
import { X } from "lucide-react"

export function LocationImageViewer() {
  const { locationViewingState, closeLocationView, briefingData } = useMap()
  const [location, setLocation] = useState<any>(null)

  useEffect(() => {
    if (locationViewingState.isActive && locationViewingState.locationId && briefingData) {
      console.log("Looking for location:", locationViewingState.locationId)
      console.log("Available locations:", briefingData.strategicLocations)

      const foundLocation = briefingData.strategicLocations.find((loc) => loc.id === locationViewingState.locationId)

      console.log("Found location:", foundLocation)
      setLocation(foundLocation || null)
    } else {
      setLocation(null)
    }
  }, [locationViewingState, briefingData])

  if (!locationViewingState.isActive || !location) return null

  return (
    <Dialog open={locationViewingState.isActive} onOpenChange={(open) => !open && closeLocationView()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{location.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {location.imageUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={location.imageUrl || "/placeholder.svg"}
                alt={location.name}
                className="max-w-full max-h-[60vh] object-contain rounded-md"
              />
              {location.description && (
                <div className="mt-4 p-4 bg-muted rounded-md w-full">
                  <p className="text-sm">{location.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[40vh] bg-muted rounded-md">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={closeLocationView} className="gap-1">
            <X className="h-4 w-4" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
