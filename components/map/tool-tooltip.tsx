"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useMap } from "@/contexts/map-context"
import { cn } from "@/lib/utils"

export function ToolTooltip({ showHelp = false }: { showHelp?: boolean }) {
  const {
    activeTool,
    drawingSettings,
    artillerySettings,
    customIcons,
    selectedIconId,
    outOfBoundsSettings,
    timeToolSettings,
  } = useMap()
  const [visible, setVisible] = useState(false)

  // Show tooltip when a tool is selected and hide after a delay
  useEffect(() => {
    if (activeTool !== "none" || showHelp) {
      setVisible(true)

      // Only auto-hide if not in help mode
      if (!showHelp) {
        const timer = setTimeout(() => {
          setVisible(false)
        }, 5000) // Hide after 5 seconds
        return () => clearTimeout(timer)
      }
    } else {
      setVisible(false)
    }
  }, [activeTool, showHelp])

  if (!visible || (activeTool === "none" && !showHelp)) return null

  const tooltips = {
    select: {
      title: "Select & Delete Tool",
      description: "Click on any item on the map to select it, then delete it using the delete button or Delete key.",
      steps: [
        "Click on a measurement, range circle, drawing, artillery shot, or out of bounds line to select it",
        "Press the Delete key or click the delete button in the toolbar to remove the selected item",
        "Click elsewhere on the map to deselect",
      ],
    },
    measure: {
      title: "Distance Measurement Tool",
      description:
        "Click and drag to measure the distance between two points. The measurement will be displayed in yards based on the map scale.",
      steps: ["Click on your starting point", "Drag to your end point", "Release to complete the measurement"],
    },
    time: {
      title: "Movement Time Calculator",
      description: "Measure how long it would take to move between two points at both Double and Triple Quick speeds.",
      steps: [
        "Click on your starting point",
        "Drag to your end point",
        "Release to see the time required to cover the distance at both speeds",
      ],
      settings: {
        doubleQuickSpeed: "3.642 yds/s (max 180 seconds, 655.56 yards)",
        tripleQuickSpeed: "5.06 yds/s (max 90 seconds, 455.4 yards)",
      },
    },
    range: {
      title: "Range Circle Tool",
      description:
        "Create range circles to visualize distances from a central point. Useful for artillery range or movement planning.",
      steps: [
        "Click where you want the center of the circle",
        "Drag outward to set the radius",
        "Release to create the range circle",
      ],
    },
    draw: {
      title: "Drawing Tool",
      description: "Draw freehand annotations on the map to highlight areas or create custom markings.",
      steps: [
        drawingSettings.isStraightLine
          ? "Click on the starting point and drag to the end point"
          : "Click and drag to draw freehand",
        "Release to complete the drawing",
        "Use the Drawing Options button to change color, thickness, and line style",
      ],
      settings: {
        color: drawingSettings.color,
        thickness: `${drawingSettings.thickness}px`,
        lineStyle: drawingSettings.lineStyle,
        mode: drawingSettings.isStraightLine ? "Straight Line" : "Freehand",
      },
    },
    icon: {
      title: "Icon Placement Tool",
      description: "Place custom icons on the map to represent units, landmarks, or other points of interest.",
      steps: [
        "Select an icon from the Icons panel",
        "Click on the map to place the selected icon",
        "Continue clicking to place multiple copies of the icon",
      ],
      settings: {
        selectedIcon: selectedIconId ? customIcons.find((i) => i.id === selectedIconId)?.name || "None" : "None",
        availableIcons: `${customIcons.length} custom icon(s)`,
      },
    },
    artillery: {
      title: "Artillery Shot Tool",
      description: "Mark artillery shot locations and calculate impact areas based on the type of artillery.",
      steps: [
        "Click to place the artillery position",
        "Drag to set the target location",
        "Release to complete the shot",
        "Use the Artillery Options button to change artillery type, elevation, and ammunition",
      ],
      settings: {
        type: (() => {
          switch (artillerySettings.type) {
            case "napoleon":
              return "12-pounder Napoleon"
            case "parrott":
              return "10-pounder Parrott Rifle"
            case "ordnance":
              return "3-inch Ordnance Rifle"
            default:
              return artillerySettings.type
          }
        })(),
        elevation: `${artillerySettings.elevation.toFixed(2)}°`,
        shotType: (() => {
          switch (artillerySettings.shotType) {
            case "shell":
              return "Explosive Shell"
            case "case":
              return "Case Shot"
            case "canister":
              return "Canister"
            default:
              return artillerySettings.shotType
          }
        })(),
        fuseTime: `${artillerySettings.fuseTime.toFixed(2)}s`,
        velocity: `${artillerySettings.type === "napoleon" ? "405" : "300"} yards/s`,
      },
    },
    outOfBounds: {
      title: "Out of Bounds Tool",
      description: "Draw out of bounds lines to mark areas that are off-limits for a specific side.",
      steps: [
        "Click to start drawing the out of bounds line",
        "Continue clicking to add points to the line",
        "Release to complete the line",
        "Use the Out of Bounds Settings to switch between Union and CSA",
      ],
      settings: {
        side: outOfBoundsSettings.side === "union" ? "Union (Blue)" : "CSA (Red)",
      },
    },
    cap: {
      title: "Cap Tool",
      description: "Draw cap lines to mark areas on the map in green.",
      steps: [
        "Click to start drawing the cap line",
        "Continue clicking to add points to the line",
        "Release to complete the line",
      ],
    },
  }
  showHelp && activeTool === "none" && (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-100 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-4 max-w-md transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Bucktools Map Tools</h3>
        <p className="text-sm text-muted-foreground">
          Select a tool from the toolbar to get started. Each tool has specific functions for measuring, planning, and
          annotating your battlefield map.
        </p>

        <div className="mt-2 space-y-2">
          <h4 className="font-medium text-sm">Available Tools:</h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Select & Delete - Select and remove individual items</li>
            <li>Measure Distance - Calculate distances between points</li>
            <li>Movement Time - Calculate travel time at different speeds</li>
            <li>Range Circles - Create circles to visualize weapon ranges</li>
            <li>Drawing Tool - Add freehand annotations</li>
            <li>Icon Placement - Add unit markers and other icons</li>
            <li>Artillery Shot - Plan and log artillery fire</li>
            <li>Out of Bounds - Mark areas that are off-limits for a specific side</li>
            <li>Cap - Draw green cap lines on the map</li>
          </ul>
        </div>

        <div className="mt-2 space-y-2">
          <h4 className="font-medium text-sm">Undo & Redo:</h4>
          <p className="text-sm text-muted-foreground">
            Use the undo and redo buttons in the toolbar to reverse or reapply your recent actions. This works for all
            map annotations including measurements, drawings, and placed icons.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Undo (↩) - Reverses your most recent action</li>
            <li>Redo (↪) - Reapplies an action that was undone</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground mt-2">Click the help button again to hide this tooltip</div>
      </div>
    </div>
  )

  const currentTooltip = tooltips[activeTool as keyof typeof tooltips]
  if (!currentTooltip) return null

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-100 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-4 max-w-md transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">{currentTooltip.title}</h3>
        <p className="text-sm text-muted-foreground">{currentTooltip.description}</p>

        {currentTooltip.steps && (
          <div className="mt-2">
            <h4 className="font-medium text-sm mb-1">How to use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
              {currentTooltip.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {currentTooltip.settings && (
          <div className="mt-2 p-2 bg-black/50 rounded-md border border-white/10">
            <h4 className="font-medium text-sm mb-1">Current Settings:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(currentTooltip.settings).map(([key, value]) => (
                <React.Fragment key={key}>
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="flex items-center">
                    {key === "color" && (
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-1"
                        style={{ backgroundColor: value as string }}
                      ></span>
                    )}
                    {value}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 italic">This tooltip will disappear in a few seconds</div>
      </div>
    </div>
  )
}
