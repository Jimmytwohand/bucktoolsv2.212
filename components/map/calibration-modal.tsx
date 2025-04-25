"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useMap } from "@/contexts/map-context"

interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalibrationModal({ isOpen, onClose }: CalibrationModalProps) {
  const { knownDistance, setKnownDistance, calibrationPoints, setCalibrationPoints, setScale } = useMap()

  const [localDistance, setLocalDistance] = useState("")

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDistance(knownDistance.toString() || "")
    }
  }, [isOpen, knownDistance])

  const handleStartCalibration = () => {
    if (!localDistance || isNaN(Number(localDistance))) {
      return
    }

    // Reset any existing calibration points
    setCalibrationPoints([])

    // Set the known distance
    setKnownDistance(Number(localDistance))

    // Close the modal to allow user to click on the map
    onClose()
  }

  const handleCancel = () => {
    setLocalDistance("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calibrate Map Scale</DialogTitle>
          <DialogDescription>
            Set the scale by providing a known distance and selecting two points on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Calibrating will reset any existing scale. Make sure you want to proceed.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="known-distance">Known Distance (yards)</Label>
            <Input
              id="known-distance"
              type="number"
              min="1"
              placeholder="Enter distance in yards"
              value={localDistance}
              onChange={(e) => setLocalDistance(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleStartCalibration} disabled={!localDistance || isNaN(Number(localDistance))}>
            Start Calibration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
