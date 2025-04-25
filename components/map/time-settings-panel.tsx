"use client"

import { useMap } from "@/contexts/map-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Constants for the speed modes
const SPEEDS = {
  double: 3.642, // yards per second
  triple: 5.06, // yards per second
}

export function TimeSettingsPanel() {
  const { timeToolSettings, updateTimeToolSettings } = useMap()

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Speed Mode</Label>
        <RadioGroup
          value={timeToolSettings.speedMode}
          onValueChange={(value) => updateTimeToolSettings({ speedMode: value as "double" | "triple" })}
          className="flex"
        >
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="double" id="double" />
            <Label htmlFor="double" className="cursor-pointer flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600" />
              Double Quick
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="triple" id="triple" />
            <Label htmlFor="triple" className="cursor-pointer flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              Triple Quick
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Double Quick: 3.642 yards/second</p>
        <p>Triple Quick: 5.06 yards/second</p>
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        <p className="font-medium">Stamina Limits:</p>
        <p>
          Double Quick: Time unlimited - after 2 minutes you will be at the 40 second undepletable buffer which will
          only deplete during triple quick.
        </p>
        <p>Triple Quick: Maximum 100 seconds (506 yards)</p>
        <p>Triple Quick Melee: Maximum 80 seconds (404.8 yards)</p>
      </div>
    </div>
  )
}
