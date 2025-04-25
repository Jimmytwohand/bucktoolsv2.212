"use client"

import { useState } from "react"
import { useMap } from "@/contexts/map-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Plus } from "lucide-react"
import { IconUploadModal } from "@/components/map/icon-upload-modal"

export function IconSelector() {
  const { customIcons, removeCustomIcon, selectedIconId, setSelectedIconId } = useMap()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Available Icons</h3>
        <Button size="sm" variant="outline" onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Icon
        </Button>
      </div>

      {customIcons.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">No custom icons yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Click "Add Icon" to upload your first custom icon</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
            {customIcons.map((icon) => (
              <div
                key={icon.id}
                className={`relative flex flex-col items-center rounded-md border p-2 transition-colors hover:bg-muted/50 ${
                  selectedIconId === icon.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <button
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomIcon(icon.id)
                  }}
                  title="Remove icon"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <button
                  className="flex h-16 w-full items-center justify-center"
                  onClick={() => setSelectedIconId(icon.id)}
                >
                  <img
                    src={icon.url || "/placeholder.svg"}
                    alt={icon.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
                <div className="mt-1 w-full truncate text-center text-xs">{icon.name}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <IconUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  )
}
