"use client"

import { useMap } from "@/contexts/map-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Eye, EyeOff } from "lucide-react"

export function LayerVisibilityPanel() {
  const { visibleLayers, toggleLayer, toggleAllLayers } = useMap()

  // Update the layerOptions array to include text
  const layerOptions = [
    { id: "measurements", label: "Distance Measurements" },
    { id: "ranges", label: "Range Circles" },
    { id: "drawings", label: "Drawings & Annotations" },
    { id: "text", label: "Text Annotations" },
    { id: "icons", label: "Icons" },
    { id: "artillery", label: "Artillery Shots" },
    { id: "bounds", label: "Out of Bounds Lines" },
    { id: "time", label: "Time Measurements" },
    { id: "cap", label: "Cap Lines" },
    { id: "locations", label: "Strategic Locations" },
  ]

  const allLayersVisible = layerOptions.every((layer) => visibleLayers.includes(layer.id))
  const noLayersVisible = layerOptions.every((layer) => !visibleLayers.includes(layer.id))

  const handleToggleAll = () => {
    if (allLayersVisible) {
      // Hide all layers
      layerOptions.forEach((layer) => {
        if (visibleLayers.includes(layer.id)) {
          toggleLayer(layer.id)
        }
      })
    } else {
      // Show all layers
      layerOptions.forEach((layer) => {
        if (!visibleLayers.includes(layer.id)) {
          toggleLayer(layer.id)
        }
      })
    }
  }

  return (
    <Card className="border border-white/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="min-h-[48px]">
            {" "}
            {/* Fixed minimum height to prevent shifts */}
            <CardTitle className="flex items-center gap-2 whitespace-nowrap">
              {" "}
              {/* Prevent wrapping */}
              <Layers className="h-5 w-5" />
              Layer Visibility
            </CardTitle>
            <CardDescription>Toggle map elements on and off</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAll}
            className="border-white/20 text-white hover:bg-white/10 min-w-[100px]"
          >
            {allLayersVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {allLayersVisible ? "Hide All" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {" "}
        {/* Increased top padding */}
        <div className="grid gap-4">
          {layerOptions.map((layer) => (
            <div key={layer.id} className="flex items-center justify-between space-x-2">
              <Label htmlFor={`layer-${layer.id}`} className="flex-1 cursor-pointer">
                {layer.label}
              </Label>
              <Switch
                id={`layer-${layer.id}`}
                checked={visibleLayers.includes(layer.id)}
                onCheckedChange={() => toggleLayer(layer.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
