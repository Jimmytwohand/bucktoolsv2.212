"use client"

import { useMap } from "@/contexts/map-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Layers } from "lucide-react"

export function MapImageSwitcher() {
  const { mapImages, activeMapImageId, setActiveMapImageId } = useMap()

  // If there are no alternative images, don't render anything
  if (mapImages.length <= 1) {
    return null
  }

  // If there are only two image types, use a simple toggle button
  if (mapImages.length === 2) {
    const otherImage = mapImages.find((img) => img.id !== activeMapImageId)

    if (!otherImage) return null

    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 text-xs text-white border-white hover:bg-white/10"
        onClick={() => setActiveMapImageId(otherImage.id)}
      >
        Switch to {otherImage.label}
      </Button>
    )
  }

  // For multiple image types, use a dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 text-xs text-white border-white hover:bg-white/10">
          <Layers className="mr-1 h-3 w-3" />
          {mapImages.find((img) => img.id === activeMapImageId)?.label || "Map Type"}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-gray-700">
        {mapImages.map((image) => (
          <DropdownMenuItem
            key={image.id}
            onClick={() => setActiveMapImageId(image.id)}
            className={`text-white hover:bg-white/10 ${activeMapImageId === image.id ? "bg-white/20" : ""}`}
          >
            {image.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
