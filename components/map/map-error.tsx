"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useMap } from "@/contexts/map-context"

interface MapErrorProps {
  onRetry: () => void
  onReset: () => void
}

export function MapError({ onRetry, onReset }: MapErrorProps) {
  const { mapUrl } = useMap()

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error Loading Map</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't load the map from the provided URL due to CORS restrictions. This is a common security feature that
        prevents websites from accessing images on other domains.
      </p>

      <div className="bg-muted/30 p-4 rounded-md mb-6 w-full max-w-md overflow-hidden">
        <p className="font-mono text-xs break-all">{mapUrl}</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="outline" onClick={onReset}>
          Load Different Map
        </Button>
      </div>

      <div className="mt-8 text-sm text-muted-foreground max-w-md">
        <p className="mb-2 font-medium">Recommended Solutions:</p>
        <ul className="list-disc pl-5 space-y-1 text-left">
          <li>Upload a local image file from your computer instead</li>
          <li>Use one of the sample maps provided on the load screen</li>
          <li>Host your image on a CORS-friendly service like Imgur or ImgBB</li>
          <li>Save the image to your computer first, then upload it</li>
        </ul>
      </div>
    </div>
  )
}
