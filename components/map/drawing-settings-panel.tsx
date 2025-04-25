"use client"

import { useMap } from "@/contexts/map-context"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function DrawingSettingsPanel() {
  const { drawingSettings, updateDrawingSettings } = useMap()

  const colorOptions = [
    { value: "#ff0000", label: "Red" },
    { value: "#00ff00", label: "Green" },
    { value: "#0000ff", label: "Blue" },
    { value: "#ffff00", label: "Yellow" },
    { value: "#ff00ff", label: "Magenta" },
    { value: "#00ffff", label: "Cyan" },
    { value: "#ffffff", label: "White" },
    { value: "#000000", label: "Black" },
  ]

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Line Color</h4>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={cn(
                "w-full h-8 rounded-md border border-border flex items-center justify-center",
                drawingSettings.color === color.value && "ring-2 ring-primary",
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => updateDrawingSettings({ color: color.value })}
              title={color.label}
            >
              {drawingSettings.color === color.value && (
                <span
                  className={cn(
                    "text-xs font-bold",
                    ["#ffffff", "#ffff00", "#00ffff"].includes(color.value) ? "text-black" : "text-white",
                  )}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="thickness">Line Thickness: {drawingSettings.thickness}px</Label>
        </div>
        <Slider
          id="thickness"
          min={1}
          max={10}
          step={1}
          value={[drawingSettings.thickness]}
          onValueChange={(value) => updateDrawingSettings({ thickness: value[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label>Line Style</Label>
        <RadioGroup
          value={drawingSettings.lineStyle}
          onValueChange={(value) => updateDrawingSettings({ lineStyle: value as "solid" | "dashed" | "dotted" })}
          className="flex"
        >
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="solid" id="solid" />
            <Label htmlFor="solid" className="cursor-pointer">
              Solid
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="dashed" id="dashed" />
            <Label htmlFor="dashed" className="cursor-pointer">
              Dashed
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="dotted" id="dotted" />
            <Label htmlFor="dotted" className="cursor-pointer">
              Dotted
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="straight-line"
          checked={drawingSettings.isStraightLine}
          onCheckedChange={(checked) => updateDrawingSettings({ isStraightLine: checked })}
        />
        <Label htmlFor="straight-line">Straight Line Mode</Label>
      </div>
    </div>
  )
}
