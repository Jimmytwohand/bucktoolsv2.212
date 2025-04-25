"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useMap } from "@/contexts/map-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, AlertTriangle } from "lucide-react"

interface IconUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IconUploadModal({ isOpen, onClose }: IconUploadModalProps) {
  const { addCustomIcon } = useMap()
  const [iconUrl, setIconUrl] = useState("")
  const [iconName, setIconName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [iconDimensions, setIconDimensions] = useState({ width: 32, height: 32 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setIconUrl("")
    setIconName("")
    setPreviewUrl(null)
    setError(null)
    setIsLoading(false)
    setIconDimensions({ width: 32, height: 32 })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const loadIconFromUrl = async () => {
    if (!iconUrl) {
      setError("Please enter a URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create a new image to test loading
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Set up promise to handle image loading
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setPreviewUrl(iconUrl)
          setIconDimensions({ width: img.width, height: img.height })
          resolve()
        }
        img.onerror = () => {
          reject(new Error("Failed to load image from URL"))
        }
      })

      img.src = iconUrl
      await loadPromise
    } catch (err) {
      setError("Failed to load image. Please check the URL and try again.")
      setPreviewUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string

      // Create image to get dimensions
      const img = new Image()
      img.onload = () => {
        setPreviewUrl(dataUrl)
        setIconDimensions({ width: img.width, height: img.height })
        setIconName(file.name.split(".")[0] || "Custom Icon")
        setIsLoading(false)
      }
      img.onerror = () => {
        setError("Invalid image file")
        setPreviewUrl(null)
        setIsLoading(false)
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      setError("Failed to read file")
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAddIcon = () => {
    if (!previewUrl) {
      setError("Please upload or provide a URL for an icon")
      return
    }

    if (!iconName) {
      setError("Please provide a name for the icon")
      return
    }

    addCustomIcon({
      id: Date.now().toString(),
      url: previewUrl,
      name: iconName,
      width: iconDimensions.width,
      height: iconDimensions.height,
    })

    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Icon</DialogTitle>
          <DialogDescription>
            Upload a custom icon to place on the map. Supported formats: PNG, JPG, SVG.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="icon-url">Icon URL</Label>
              <div className="flex gap-2">
                <Input
                  id="icon-url"
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={loadIconFromUrl} disabled={isLoading || !iconUrl}>
                  Load
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Enter a direct URL to an image file (PNG, JPG, SVG)</p>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="icon-file">Icon File</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="icon-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a local image file from your device (PNG, JPG, SVG)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {previewUrl && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="icon-name">Icon Name</Label>
              <Input
                id="icon-name"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="Enter a name for this icon"
              />
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-2 text-sm font-medium">Preview:</div>
              <div className="flex items-center justify-center rounded-md bg-muted/50 p-4">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Icon Preview"
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {iconDimensions.width} × {iconDimensions.height} pixels
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAddIcon} disabled={isLoading || !previewUrl || !iconName}>
            Add Icon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
