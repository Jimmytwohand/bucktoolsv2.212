"use client"

import { useMap } from "@/contexts/map-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"

export function TextSettingsPanel() {
  const { textSettings, updateTextSettings } = useMap()
  const [localText, setLocalText] = useState(textSettings.text)

  // Sync local state with context when textSettings changes
  useEffect(() => {
    setLocalText(textSettings.text)
  }, [textSettings.text])

  // Update text in context when user stops typing
  const handleTextBlur = () => {
    updateTextSettings({ text: localText })
  }

  // Color options
  const colorOptions = [
    { value: "#ffffff", label: "White", className: "bg-white" },
    { value: "#ff0000", label: "Red", className: "bg-red-500" },
    { value: "#00ff00", label: "Green", className: "bg-green-500" },
    { value: "#0000ff", label: "Blue", className: "bg-blue-500" },
    { value: "#ffff00", label: "Yellow", className: "bg-yellow-500" },
    { value: "#000000", label: "Black", className: "bg-black" },
  ]

  // Font style options
  const fontStyleOptions = [
    { value: "normal", label: "Normal" },
    { value: "italic", label: "Italic" },
    { value: "bold", label: "Bold" },
    { value: "bold italic", label: "Bold Italic" },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text Content</Label>
        <Input
          id="text-input"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleTextBlur}
          placeholder="Enter text to add to map"
        />
      </div>

      <div className="space-y-2">
        <Label>Text Color</Label>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`h-8 rounded-md border-2 ${
                textSettings.color === color.value ? "border-primary" : "border-transparent"
              } ${color.className}`}
              onClick={() => updateTextSettings({ color: color.value })}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="font-size">Font Size: {textSettings.fontSize}px</Label>
        </div>
        <Slider
          id="font-size"
          min={8}
          max={48}
          step={1}
          value={[textSettings.fontSize]}
          onValueChange={(value) => updateTextSettings({ fontSize: value[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Style</Label>
        <RadioGroup
          value={textSettings.fontStyle}
          onValueChange={(value) =>
            updateTextSettings({ fontStyle: value as "normal" | "italic" | "bold" | "bold italic" })
          }
          className="grid grid-cols-2 gap-2"
        >
          {fontStyleOptions.map((style) => (
            <div key={style.value} className="flex items-center space-x-2">
              <RadioGroupItem value={style.value} id={`style-${style.value}`} />
              <Label
                htmlFor={`style-${style.value}`}
                className={`
                ${style.value.includes("italic") ? "italic" : ""}
                ${style.value.includes("bold") ? "font-bold" : ""}
              `}
              >
                {style.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="mt-4 p-3 bg-black/20 rounded-md text-sm text-muted-foreground">
        <p>Click on the map to place text with these settings. Text will be added to the drawings layer.</p>
      </div>
    </div>
  )
}
