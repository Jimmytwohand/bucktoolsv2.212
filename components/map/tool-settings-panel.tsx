"use client"

import { useEffect, useState } from "react"
import { useMap } from "@/contexts/map-context"
import { DrawingSettingsPanel } from "@/components/map/drawing-settings-panel"
import { ArtillerySettingsPanel } from "@/components/map/artillery-settings-panel"
import { OutOfBoundsSettingsPanel } from "@/components/map/out-of-bounds-settings-panel"
import { TimeSettingsPanel } from "@/components/map/time-settings-panel"
import { TextSettingsPanel } from "@/components/map/text-settings-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ToolSettingsPanel() {
  const { activeTool } = useMap()

  // Force the component to re-render when activeTool changes
  const [, forceUpdate] = useState({})
  const [currentTool, setCurrentTool] = useState(activeTool)

  useEffect(() => {
    // Force a re-render when activeTool changes
    forceUpdate({})
    console.log("ToolSettingsPanel: activeTool changed to", activeTool, "from", currentTool)
    setCurrentTool(activeTool)
  }, [activeTool, currentTool])

  // Explicitly check for text tool
  const isTextTool = activeTool === "text"
  console.log("Is text tool active?", isTextTool)

  // Determine if we should show settings for the current tool
  const showSettings = ["draw", "artillery", "outOfBounds", "time"].includes(activeTool) || isTextTool

  if (!showSettings) {
    return (
      <Card className="border border-white/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle>Tool Settings</CardTitle>
          <CardDescription>Select a tool to view its settings</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No tool with configurable settings is currently active</p>
        </CardContent>
      </Card>
    )
  }

  // Special case for text tool
  if (isTextTool) {
    console.log("Rendering text settings panel")
    return (
      <Card className="border border-white/20 bg-black/40 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle>Text Options</CardTitle>
          <CardDescription>Configure text appearance and content</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <TextSettingsPanel />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-white/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <CardTitle>
          {activeTool === "draw" && "Drawing Options"}
          {activeTool === "artillery" && "Artillery Options"}
          {activeTool === "outOfBounds" && "Out of Bounds Settings"}
          {activeTool === "time" && "Movement Speed Settings"}
        </CardTitle>
        <CardDescription>
          {activeTool === "draw" && "Customize line appearance and behavior"}
          {activeTool === "artillery" && "Configure artillery type and parameters"}
          {activeTool === "outOfBounds" && "Set side for out of bounds lines"}
          {activeTool === "time" && "Set movement speed for time calculations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {activeTool === "draw" && <DrawingSettingsPanel />}
        {activeTool === "artillery" && <ArtillerySettingsPanel />}
        {activeTool === "outOfBounds" && <OutOfBoundsSettingsPanel />}
        {activeTool === "time" && <TimeSettingsPanel />}
      </CardContent>
    </Card>
  )
}
