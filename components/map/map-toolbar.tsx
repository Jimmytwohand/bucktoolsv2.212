"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Ruler,
  Circle,
  Pencil,
  MapPin,
  Target,
  Save,
  Trash2,
  Maximize,
  Undo,
  Redo,
  MapPinOff,
  MousePointer,
  Trash,
  Clock,
  Flag,
  FileText,
  Edit,
  Type,
} from "lucide-react"
import { useMap } from "@/contexts/map-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BriefingEditorModal } from "@/components/map/briefing/briefing-editor-modal"
import { SaveMapModal } from "@/components/map/save-map-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MapToolbarProps {
  onCalibrate: () => void
  onFitToScreen?: () => void
  orientation?: "horizontal" | "vertical"
  onHelpClick?: () => void
  canvasRef?: React.RefObject<any>
  onToolActivated?: (tool: string) => void
}

export function MapToolbar({
  onCalibrate,
  onFitToScreen,
  orientation = "horizontal",
  onHelpClick,
  canvasRef,
  onToolActivated,
}: MapToolbarProps) {
  const {
    activeTool,
    setActiveTool,
    visibleLayers,
    toggleLayer,
    clearMeasurements,
    clearRangeCircles,
    clearDrawings,
    clearArtilleryShots,
    clearPlacedIcons,
    scale,
    customIcons,
    selectedIconId,
    setSelectedIconId,
    // History-related values
    canUndo,
    canRedo,
    undo,
    redo,
    // Calibration line visibility
    showCalibrationLine,
    toggleCalibrationLine,
    calibrationPoints,
    // Out of bounds settings
    outOfBoundsSettings,
    clearOutOfBoundsLines,
    // Selection-related values
    selectedItem,
    deleteSelectedItem,
    // Time-related values
    clearTimeMeasurements,
    timeToolSettings,
    // Cap-related values
    clearCapLines,
    // Briefing mode
    briefingMode,
    setBriefingMode,
  } = useMap()

  // State for confirmation dialogs
  const [showClearAllConfirmation, setShowClearAllConfirmation] = useState(false)
  // State for briefing editor modal
  const [showBriefingEditor, setShowBriefingEditor] = useState(false)
  // State for save map modal
  const [showSaveMapModal, setShowSaveMapModal] = useState(false)
  // Track if text tool is active locally
  const [isTextToolActive, setIsTextToolActive] = useState(activeTool === "text")

  // Update local state when activeTool changes
  useEffect(() => {
    setIsTextToolActive(activeTool === "text")
  }, [activeTool])

  const isVertical = orientation === "vertical"

  // Function to handle text tool click
  const handleTextToolClick = () => {
    console.log("Text tool clicked, current activeTool:", activeTool)

    // Always set to text tool, regardless of current state
    setActiveTool("text")
    setIsTextToolActive(true)
    console.log("Text tool activated")

    // Directly notify parent about tool activation for immediate tab switching
    if (onToolActivated) {
      onToolActivated("text")
    }
  }

  // Generic function to handle tool activation with direct tab switching
  const handleToolActivation = (tool: string) => {
    console.log(`Tool ${tool} activated`)

    // Toggle tool state
    if (activeTool === tool) {
      setActiveTool("none")
      if (tool === "text") {
        setIsTextToolActive(false)
      }
    } else {
      setActiveTool(tool)
      if (tool === "text") {
        setIsTextToolActive(true)
      }

      // Directly notify parent about tool activation for immediate tab switching
      if (onToolActivated) {
        onToolActivated(tool)
      }
    }
  }

  const ToolButton = ({
    icon,
    title,
    active,
    onClick,
    disabled = false,
  }: {
    icon: React.ReactNode
    title: string
    active: boolean
    onClick: () => void
    disabled?: boolean
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={active ? "default" : "ghost"}
              size="icon"
              className={`${isVertical ? "w-8 h-8 mx-auto" : ""} ${active ? "bg-blue-400/20" : ""} hover:bg-white/10`}
              onClick={onClick}
              disabled={disabled}
            >
              {icon}
            </Button>
            {active && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={isVertical ? "right" : "bottom"}>
          {title}
          {active ? " (Active)" : ""}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const Divider = () => <div className={isVertical ? "h-px w-6 mx-auto my-1 bg-border" : "h-6 w-px mx-2 bg-border"} />

  // Function to clear all markings except cap, out of bounds, and icons
  const handleClearAll = () => {
    clearMeasurements()
    clearRangeCircles()
    clearDrawings()
    clearArtilleryShots()
    clearTimeMeasurements()
    // Note: We're not clearing cap lines, out of bounds lines, or placed icons
  }

  return (
    <div
      className={`flex ${isVertical ? "flex-col py-2" : "flex-row px-2"} items-center gap-1 bg-black/40 backdrop-blur-sm`}
    >
      <ToolButton
        icon={<MousePointer className="h-4 w-4" />}
        title="Select & Delete Items"
        active={activeTool === "select"}
        onClick={() => handleToolActivation("select")}
      />

      <ToolButton
        icon={<Ruler className="h-4 w-4" />}
        title="Measure Distance"
        active={activeTool === "measure"}
        onClick={() => handleToolActivation("measure")}
        disabled={!scale}
      />

      <ToolButton
        icon={<Clock className="h-4 w-4" />}
        title="Measure Time (Double & Triple Quick)"
        active={activeTool === "time"}
        onClick={() => handleToolActivation("time")}
        disabled={!scale}
      />

      <ToolButton
        icon={<Circle className="h-4 w-4" />}
        title="Draw Range Circles"
        active={activeTool === "range"}
        onClick={() => handleToolActivation("range")}
        disabled={!scale}
      />

      <ToolButton
        icon={<Pencil className="h-4 w-4" />}
        title="Draw Annotations"
        active={activeTool === "draw"}
        onClick={() => handleToolActivation("draw")}
      />

      {/* Text tool with direct implementation */}
      <ToolButton
        icon={<Type className="h-4 w-4" />}
        title="Add Text"
        active={isTextToolActive}
        onClick={handleTextToolClick}
      />

      <ToolButton
        icon={<MapPin className="h-4 w-4" />}
        title="Place Icons"
        active={activeTool === "icon"}
        onClick={() => {
          if (activeTool === "icon") {
            setActiveTool("none")
            setSelectedIconId(null)
          } else {
            setActiveTool("icon")
            if (onToolActivated) {
              onToolActivated("icon")
            }
          }
        }}
      />

      <ToolButton
        icon={<Target className="h-4 w-4" />}
        title="Artillery Shot"
        active={activeTool === "artillery"}
        onClick={() => handleToolActivation("artillery")}
        disabled={!scale}
      />

      <ToolButton
        icon={<MapPinOff className="h-4 w-4" />}
        title={`Out of Bounds (${outOfBoundsSettings.side === "union" ? "Union" : "CSA"})`}
        active={activeTool === "outOfBounds"}
        onClick={() => handleToolActivation("outOfBounds")}
      />

      <ToolButton
        icon={<Flag className="h-4 w-4" />}
        title="Cap"
        active={activeTool === "cap"}
        onClick={() => handleToolActivation("cap")}
      />

      {selectedItem && (
        <ToolButton
          icon={<Trash className="h-4 w-4" />}
          title="Delete Selected Item"
          active={false}
          onClick={deleteSelectedItem}
        />
      )}

      <Divider />

      {/* Undo and Redo buttons */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className={isVertical ? "w-8 h-8 mx-auto" : ""}
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Undo {!canUndo && "(Nothing to undo)"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className={isVertical ? "w-8 h-8 mx-auto" : ""}
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Redo {!canRedo && "(Nothing to redo)"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Divider />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${isVertical ? "w-8 h-8 mx-auto" : ""} ${!scale ? "animate-pulse bg-primary/20" : ""}`}
              onClick={onCalibrate}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 7.49989C10.8632 9.34764 9.34764 10.8632 7.49989 10.8632C5.65214 10.8632 4.13661 9.34764 4.13661 7.49989C4.13661 5.65214 5.65214 4.13661 7.49989 4.13661C9.34764 4.13661 10.8632 5.65214 10.8632 7.49989Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
                <path
                  d="M1.5 2H13.5C13.7761 2 14 2.22386 14 2.5V12.5C14 12.7761 13.7761 13 13.5 13H1.5C1.22386 13 1 12.7761 1 12.5V2.5C1 1.22386 1.22386 2 1.5 2ZM2 3V12H13V3H2Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
                <path
                  d="M2.5 4.5C2.5 4.22386 2.72386 4 3 4H4.5C4.77614 4 5 4.22386 5 4.5C5 4.77614 4.77614 5 4.5 5H3C2.72386 5 2.5 4.77614 2.5 4.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M2.5 6.5C2.5 6.22386 2.72386 6 3 6H4.5C4.77614 6 5 6.22386 5 6.5C5 6.77614 4.77614 7 4.5 7H3C2.72386 7 2.5 6.77614 2.5 6.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M2.5 8.5C2.5 8.22386 2.72386 8 3 8H4.5C4.77614 8 5 8.22386 5 8.5C5 8.77614 4.77614 9 4.5 9H3C2.72386 9 2.5 8.77614 2.5 8.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M2.5 10.5C2.5 10.2239 2.72386 10 3 10H4.5C4.77614 10 5 10.2239 5 10.5C5 10.7761 4.77614 11 4.5 11H3C2.72386 11 2.5 10.7761 2.5 10.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10 4.5C10 4.22386 10.2239 4 10.5 4H12C12.2761 4 12.5 4.22386 12.5 4.5C12.5 4.77614 12.2761 5 12 5H10.5C10.2239 5 10 4.77614 10 4.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10 6.5C10 6.22386 10.2239 6 10.5 6H12C12.2761 6 12.5 6.22386 12.5 6.5C12.5 6.77614 12.2761 7 12 7H10.5C10.2239 7 10 6.77614 10 6.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10 8.5C10 8.22386 10.2239 8 10.5 8H12C12.2761 8 12.5 8.22386 12.5 8.5C12.5 8.77614 12.2761 9 12 9H10.5C10.2239 9 10 8.77614 10 8.5Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10 10.5C10 10.2239 10.2239 10 10.5 10H12C12.2761 10 12.5 10.2239 12.5 10.5C12.5 10.7761 12.2761 11 12 11H10.5C10.2239 11 10 10.7761 10 10.5Z"
                  fill="currentColor"
                ></path>
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>
            {scale ? "Recalibrate Scale" : "Calibrate Scale"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${isVertical ? "w-8 h-8 mx-auto" : ""} ${showCalibrationLine ? "bg-primary/20" : ""}`}
              onClick={toggleCalibrationLine}
              disabled={calibrationPoints.length < 2}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4779 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>
            {calibrationPoints.length < 2
              ? "No calibration markers to show"
              : showCalibrationLine
                ? "Hide Calibration Markers"
                : "Show Calibration Markers"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onFitToScreen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={isVertical ? "w-8 h-8 mx-auto" : ""}
                onClick={onFitToScreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isVertical ? "right" : "bottom"}>Fit to Screen</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Divider />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={isVertical ? "w-8 h-8 mx-auto" : ""}
              onClick={() => setShowClearAllConfirmation(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>
            Clear Measurements, Range Circles, Drawings, Artillery, and Time Measurements
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Confirmation Dialog for Clear All */}
      <AlertDialog open={showClearAllConfirmation} onOpenChange={setShowClearAllConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Markings</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all measurements, range circles, drawings, artillery shots, and time measurements. Cap
              lines, out of bounds lines, and icons will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleClearAll()
                setShowClearAllConfirmation(false)
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isVertical && <div className="flex-1"></div>}

      {/* Briefing Tools */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${isVertical ? "w-8 h-8 mx-auto" : ""} ${briefingMode ? "bg-primary/20" : ""}`}
              onClick={() => setBriefingMode(!briefingMode)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>
            {briefingMode ? "Hide Briefing" : "Show Briefing"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={isVertical ? "w-8 h-8 mx-auto" : ""}
              onClick={() => setShowBriefingEditor(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Edit Map & Views</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Divider />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={isVertical ? "w-8 h-8 mx-auto" : ""}
              onClick={() => setShowSaveMapModal(true)}
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "right" : "bottom"}>Save/Import Map</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Briefing Editor Modal */}
      <BriefingEditorModal isOpen={showBriefingEditor} onClose={() => setShowBriefingEditor(false)} />

      {/* Save Map Modal */}
      {canvasRef && (
        <SaveMapModal isOpen={showSaveMapModal} onClose={() => setShowSaveMapModal(false)} canvasRef={canvasRef} />
      )}
    </div>
  )
}
