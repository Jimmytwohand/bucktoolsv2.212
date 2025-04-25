"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Map, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for maps
const mockMaps = [
  {
    id: "1",
    name: "Gettysburg Battlefield",
  },
  {
    id: "2",
    name: "Antietam Battlefield",
  },
  {
    id: "3",
    name: "Bull Run",
  },
  {
    id: "4",
    name: "River Crossing Skirmish",
  },
]

export function MapSwitcher() {
  const router = useRouter()
  const [currentMap, setCurrentMap] = useState(() => {
    // Get the current map ID from localStorage
    const currentMapId = typeof window !== "undefined" ? localStorage.getItem("currentMapId") : null
    return mockMaps.find((map) => map.id === currentMapId) || mockMaps[0]
  })

  // Reference to the hidden file input for alternative map images
  const alternativeMapFileRef = useRef<HTMLInputElement>(null)

  const handleSelectMap = (id: string, name: string) => {
    localStorage.setItem("currentMapId", id)
    setCurrentMap({ id, name })
    router.push("/map")
  }

  const handleAddAlternativeMap = () => {
    // Trigger the hidden file input
    if (alternativeMapFileRef.current) {
      alternativeMapFileRef.current.click()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 text-xs text-white border-white hover:bg-white/10">
            <Map className="mr-1 h-3 w-3" />
            {currentMap.name}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-black/90 border-gray-700">
          <DropdownMenuLabel className="text-white">Switch Map</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          {mockMaps.map((map) => (
            <DropdownMenuItem
              key={map.id}
              onClick={() => handleSelectMap(map.id, map.name)}
              className={`text-white hover:bg-white/10 ${currentMap.id === map.id ? "bg-white/20" : ""}`}
            >
              {map.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={handleAddAlternativeMap} className="text-white hover:bg-white/10">
            <Upload className="mr-2 h-4 w-4" />
            Add Alternative View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input for alternative map images */}
      <input
        ref={alternativeMapFileRef}
        type="file"
        id="alternative-map-file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          // Get the file
          const file = e.target.files?.[0]
          if (!file) return

          // Create a FileReader to read the file
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string

            // Get the map context
            const mapContext = document.getElementById("alternative-map-file")
            if (mapContext) {
              // Create a custom event to pass the data URL to the MapInterface component
              const customEvent = new CustomEvent("alternativeMapUploaded", {
                detail: { dataUrl },
              })
              mapContext.dispatchEvent(customEvent)
            }
          }
          reader.readAsDataURL(file)
        }}
      />
    </>
  )
}
