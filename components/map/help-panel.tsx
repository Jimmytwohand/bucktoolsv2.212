"use client"

import { useMap } from "@/contexts/map-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Ruler, Circle, Pencil, MapPin, Target, MousePointer, Clock, MapPinOff, Flag } from "lucide-react"

export function HelpPanel() {
  const { activeTool, scale, outOfBoundsSettings } = useMap()

  // Helper function to get the appropriate help content based on the active tool
  const getHelpContent = () => {
    switch (activeTool) {
      case "select":
        return {
          title: "Select & Delete Tool",
          icon: <MousePointer className="h-5 w-5" />,
          description:
            "Click on any item on the map to select it. Once selected, you can delete it or modify its properties.",
          instructions: [
            "Click on any measurement, range circle, drawing, or other item to select it",
            "Press Delete or use the trash button to remove the selected item",
            "Click elsewhere on the map to deselect",
          ],
        }
      case "measure":
        return {
          title: "Distance Measurement Tool",
          icon: <Ruler className="h-5 w-5" />,
          description: "Measure distances on the map. Requires calibration to be accurate.",
          instructions: [
            "Click to place the first point",
            "Click again to place the second point and measure the distance",
            "Continue clicking to add more segments to the measurement",
            "Double-click to end the measurement",
            "Distances are shown in yards based on the map calibration",
          ],
        }
      case "time":
        return {
          title: "Time Measurement Tool",
          icon: <Clock className="h-5 w-5" />,
          description: "Calculate movement times based on distance and march speed (Double or Triple Quick).",
          instructions: [
            "Click to place the first point",
            "Click again to place the second point and calculate the time",
            "Times are calculated based on the selected march speed",
            "Double Quick: 165 yards per minute",
            "Triple Quick: 180 yards per minute",
          ],
        }
      case "range":
        return {
          title: "Range Circle Tool",
          icon: <Circle className="h-5 w-5" />,
          description: "Draw range circles to visualize weapon ranges or movement distances.",
          instructions: [
            "Click on the map to place a range circle",
            "Adjust the radius using the settings panel",
            "Range circles show the distance in yards based on the map calibration",
          ],
        }
      case "draw":
        return {
          title: "Drawing Tool",
          icon: <Pencil className="h-5 w-5" />,
          description: "Draw freehand annotations on the map.",
          instructions: [
            "Click and drag to draw on the map",
            "Use the settings panel to change the color and line width",
            "Release the mouse button to finish drawing",
          ],
        }
      case "icon":
        return {
          title: "Icon Placement Tool",
          icon: <MapPin className="h-5 w-5" />,
          description: "Place custom icons on the map to represent units, landmarks, or other points of interest.",
          instructions: [
            "Select an icon from the icon panel",
            "Click on the map to place the selected icon",
            "Icons can be selected and deleted like other map elements",
          ],
        }
      case "artillery":
        return {
          title: "Artillery Shot Tool",
          icon: <Target className="h-5 w-5" />,
          description: "Simulate artillery shots and visualize their impact areas.",
          instructions: [
            "Click to place the artillery piece",
            "Click again to set the target location",
            "The impact area will be displayed based on the artillery settings",
            "Use the settings panel to adjust the artillery type and parameters",
          ],
        }
      case "outOfBounds":
        return {
          title: `Out of Bounds Tool (${outOfBoundsSettings.side === "union" ? "Union" : "CSA"})`,
          icon: <MapPinOff className="h-5 w-5" />,
          description: "Mark areas that are out of bounds for specific sides.",
          instructions: [
            "Click to place points that define the out of bounds line",
            "Double-click to complete the line",
            "Use the settings panel to switch between Union and CSA sides",
            "Out of bounds lines help visualize restricted areas for each side",
          ],
        }
      case "cap":
        return {
          title: "Cap Tool",
          icon: <Flag className="h-5 w-5" />,
          description: "Mark capture points or objectives on the map.",
          instructions: [
            "Click to place points that define the cap line",
            "Double-click to complete the line",
            "Cap lines help visualize objectives and capture points",
          ],
        }
      case "none":
      default:
        return {
          title: "Bucktools Map Help",
          icon: null,
          description: "Select a tool from the toolbar to see specific instructions.",
          instructions: [
            "The toolbar contains various tools for measuring, drawing, and annotating the map",
            "Most measurement tools require map calibration to be accurate",
            "Use the select tool to modify or delete existing items",
            "The briefing panel provides additional information about the map",
          ],
        }
    }
  }

  const helpContent = getHelpContent()

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            {helpContent.icon && <div className="bg-primary/10 p-2 rounded-md">{helpContent.icon}</div>}
            <div>
              <CardTitle>{helpContent.title}</CardTitle>
              <CardDescription>{helpContent.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-sm font-medium mb-2">Instructions:</h3>
            <ul className="space-y-2">
              {helpContent.instructions.map((instruction, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>

            {!scale && activeTool !== "none" && activeTool !== "draw" && activeTool !== "icon" && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm">
                <strong>Note:</strong> This tool requires map calibration. Use the calibration tool in the toolbar to
                set the scale.
              </div>
            )}

            {activeTool === "none" && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm">
                <strong>Tip:</strong> Click on a tool in the toolbar to activate it and see specific help instructions.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>General Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm">
                <strong>Calibration:</strong> For accurate measurements, calibrate the map by clicking the calibration
                tool and following the instructions.
              </li>
              <li className="text-sm">
                <strong>Undo/Redo:</strong> Use the undo and redo buttons to correct mistakes.
              </li>
              <li className="text-sm">
                <strong>Saving:</strong> Your work is automatically saved to the browser. Use the save button to export
                your map.
              </li>
              <li className="text-sm">
                <strong>Briefing:</strong> Use the briefing panel to add detailed information about the map and
                strategic locations.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
