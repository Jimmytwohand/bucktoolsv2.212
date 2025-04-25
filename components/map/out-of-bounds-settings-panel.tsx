"use client"

import { useMap } from "@/contexts/map-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function OutOfBoundsSettingsPanel() {
  const { outOfBoundsSettings, updateOutOfBoundsSettings } = useMap()

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Side</Label>
        <RadioGroup
          value={outOfBoundsSettings.side}
          onValueChange={(value) => updateOutOfBoundsSettings({ side: value as "union" | "csa" })}
          className="flex"
        >
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="union" id="union" />
            <Label htmlFor="union" className="cursor-pointer flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              Union
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="csa" id="csa" />
            <Label htmlFor="csa" className="cursor-pointer flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              CSA
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="text-sm text-muted-foreground">
        Out of bounds lines will be drawn as dashed lines with the selected side's color.
      </div>
    </div>
  )
}
