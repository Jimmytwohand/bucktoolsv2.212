"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Map {
  id: string
  name: string
  description?: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

interface MapCardProps {
  map: Map
  onSelect: () => void
  onDelete: () => void
}

export function MapCard({ map, onSelect, onDelete }: MapCardProps) {
  return (
    <div className="border border-white/20 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm shadow-xl transition-transform hover:scale-[1.02] hover:shadow-2xl">
      <div className="aspect-video relative">
        <Image src={map.imageUrl || "/placeholder.svg"} alt={map.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-xl text-white drop-shadow-md">{map.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-300 line-clamp-2 h-10">{map.description}</p>
        <p className="text-xs text-gray-400 mt-2">Updated {formatDistanceToNow(new Date(map.updatedAt))} ago</p>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-blue-400 hover:bg-blue-500 text-black" onClick={onSelect}>
            Open Map
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white text-white hover:bg-white/10" asChild>
            <Link href={`/map/edit/${map.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="border-red-400 text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
