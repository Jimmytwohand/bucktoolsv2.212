"use client"

import { useState, useRef, useEffect } from "react"
import { useMap } from "@/contexts/map-context"
import { Button } from "@/components/ui/button"
import { X, LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { BriefingHeader } from "./briefing-header"
import { BriefingContent } from "./briefing-content"
import { TableOfContents } from "./table-of-contents"
import { StrategicLocationsGallery } from "./strategic-locations-gallery"

interface BriefingPanelProps {
  className?: string
}

export function BriefingPanel({ className }: BriefingPanelProps) {
  const {
    briefingMode,
    setBriefingMode,
    briefingData,
    activeBriefingSection,
    setActiveBriefingSection,
    briefingPanelWidth,
    setBriefingPanelWidth,
  } = useMap()

  const [isResizing, setIsResizing] = useState(false)
  const [isLinkToMapActive, setIsLinkToMapActive] = useState(true)
  const [activeTab, setActiveTab] = useState<"content" | "locations">("content")
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const newWidth = e.clientX
      // Set min and max width constraints
      const constrainedWidth = Math.max(300, Math.min(800, newWidth))
      setBriefingPanelWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, setBriefingPanelWidth])

  if (!briefingMode) return null

  return (
    <div
      ref={panelRef}
      className={cn(
        "h-full border-r border-white/20 bg-black/60 backdrop-blur-md flex flex-col flex-shrink-0 absolute left-0 z-10",
        className,
      )}
      style={{
        width: `${briefingPanelWidth}px`,
        height: "100%",
      }}
    >
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <h2 className="text-lg font-semibold">Map Briefing</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", isLinkToMapActive && "bg-primary/20")}
            title={isLinkToMapActive ? "Disable map highlighting" : "Enable map highlighting"}
            onClick={() => setIsLinkToMapActive(!isLinkToMapActive)}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setBriefingMode(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {briefingData ? (
        <>
          <BriefingHeader briefing={briefingData} />

          <div className="flex border-b border-white/20">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 border-transparent",
                activeTab === "content" && "border-primary",
              )}
              onClick={() => setActiveTab("content")}
            >
              Content
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 border-transparent",
                activeTab === "locations" && "border-primary",
              )}
              onClick={() => setActiveTab("locations")}
            >
              Locations
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === "content" ? (
              <>
                <TableOfContents
                  sections={briefingData.sections}
                  activeSection={activeBriefingSection}
                  onSectionSelect={setActiveBriefingSection}
                />
                <BriefingContent
                  sections={briefingData.sections}
                  activeSection={activeBriefingSection}
                  linkToMapActive={isLinkToMapActive}
                />
              </>
            ) : (
              <StrategicLocationsGallery
                locations={briefingData.strategicLocations}
                linkToMapActive={isLinkToMapActive}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg mb-2">No briefing available for this map</p>
            <p className="text-sm text-muted-foreground">
              Create a briefing to add context and strategic information to your map.
            </p>
          </div>
        </div>
      )}

      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-white/10 hover:bg-primary/50"
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  )
}
