"use client"

import { useState, useEffect } from "react"
import { useMap } from "@/contexts/map-context"
import { Button } from "@/components/ui/button"
import { IconSelector } from "@/components/map/icon-selector"

export function IconPanel() {
  const { activeTool, setActiveTool, selectedIconId, setSelectedIconId, customIcons } = useMap()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Ensure we have a valid icon selected
  useEffect(() => {
    if (activeTool === "icon" && (!selectedIconId || !customIcons.find((icon) => icon.id === selectedIconId))) {
      if (customIcons.length > 0) {
        setSelectedIconId(customIcons[0].id)
      } else {
        setActiveTool("none")
      }
    }
  }, [activeTool, selectedIconId, customIcons, setSelectedIconId, setActiveTool])

  return (
    <div className="space-y-6">
      <IconSelector />

      <div className="space-y-2">
        <Button
          className="w-full"
          disabled={!selectedIconId || customIcons.length === 0}
          variant={activeTool === "icon" ? "default" : "outline"}
          onClick={() => {
            if (activeTool === "icon") {
              setActiveTool("none")
            } else {
              // Ensure we have a valid icon selected
              if (!selectedIconId && customIcons.length > 0) {
                setSelectedIconId(customIcons[0].id)
              }
              setActiveTool("icon")
            }
          }}
        >
          {activeTool === "icon" ? "Cancel Placement" : "Place Selected Icon"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {customIcons.length === 0
            ? "Upload icons first to place them on the map"
            : selectedIconId
              ? "Click on the map to place the selected icon"
              : "Select an icon first to place it on the map"}
        </p>
      </div>
    </div>
  )
}
