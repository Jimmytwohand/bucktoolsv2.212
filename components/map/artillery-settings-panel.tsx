"use client"

import { useState } from "react"
import { useMap } from "@/contexts/map-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Artillery types
const artilleryTypes = [
  { value: "napoleon", label: "12-pounder Napoleon" },
  { value: "parrott", label: "10-pounder Parrott Rifle" },
  { value: "ordnance", label: "3-inch Ordnance Rifle" },
]

// Shot types
const shotTypes = [
  { value: "shell", label: "Explosive Shell" },
  { value: "case", label: "Case Shot" },
  { value: "canister", label: "Canister" },
]

export function ArtillerySettingsPanel() {
  const { artillerySettings, updateArtillerySettings } = useMap()
  const [elevationInput, setElevationInput] = useState(artillerySettings.elevation.toFixed(2))
  const [fuseTimeInput, setFuseTimeInput] = useState(artillerySettings.fuseTime.toFixed(2))

  const handleElevationChange = (value: string) => {
    setElevationInput(value)
    const parsed = Number.parseFloat(value)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 45) {
      updateArtillerySettings({ elevation: parsed })
    }
  }

  const handleElevationBlur = () => {
    // Format to 2 decimal places on blur
    const parsed = Number.parseFloat(elevationInput)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 45) {
      const formatted = parsed.toFixed(2)
      setElevationInput(formatted)
      updateArtillerySettings({ elevation: Number.parseFloat(formatted) })
    } else {
      // Reset to current valid setting if invalid input
      setElevationInput(artillerySettings.elevation.toFixed(2))
    }
  }

  const handleFuseTimeChange = (value: string) => {
    setFuseTimeInput(value)
    const parsed = Number.parseFloat(value)
    if (!isNaN(parsed) && parsed >= 0) {
      updateArtillerySettings({ fuseTime: parsed })
    }
  }

  const handleFuseTimeBlur = () => {
    // Format to 2 decimal places on blur
    const parsed = Number.parseFloat(fuseTimeInput)
    if (!isNaN(parsed) && parsed >= 0) {
      const formatted = parsed.toFixed(2)
      setFuseTimeInput(formatted)
      updateArtillerySettings({ fuseTime: Number.parseFloat(formatted) })
    } else {
      // Reset to current valid setting if invalid input
      setFuseTimeInput(artillerySettings.fuseTime.toFixed(2))
    }
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="artillery-type">Artillery Type</Label>
        <Select
          value={artillerySettings.type}
          onValueChange={(value) => updateArtillerySettings({ type: value as any })}
        >
          <SelectTrigger id="artillery-type">
            <SelectValue placeholder="Select artillery type" />
          </SelectTrigger>
          <SelectContent>
            {artilleryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="elevation">Elevation (°)</Label>
        <Input
          id="elevation"
          type="number"
          step="0.01"
          min="0"
          max="45"
          value={elevationInput}
          onChange={(e) => handleElevationChange(e.target.value)}
          onBlur={handleElevationBlur}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: 0° (Direct Fire)</span>
          <span>Max: 45° (High Arc)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuse-time">Fuse Time (seconds)</Label>
        <Input
          id="fuse-time"
          type="number"
          step="0.01"
          min="0"
          value={fuseTimeInput}
          onChange={(e) => handleFuseTimeChange(e.target.value)}
          onBlur={handleFuseTimeBlur}
        />
        <div className="text-xs text-muted-foreground">
          <span>Set actual fuse time (predicted time will be calculated based on distance)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Shot Type</Label>
        <RadioGroup
          value={artillerySettings.shotType}
          onValueChange={(value) => updateArtillerySettings({ shotType: value as any })}
          className="grid grid-cols-1 gap-2"
        >
          {shotTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={`shot-${type.value}`} />
              <Label htmlFor={`shot-${type.value}`} className="cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
