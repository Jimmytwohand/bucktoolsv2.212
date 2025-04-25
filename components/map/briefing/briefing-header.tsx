"use client"

import type { MapBriefing } from "@/contexts/map-context"
import { formatDistanceToNow } from "date-fns"

interface BriefingHeaderProps {
  briefing: MapBriefing
}

export function BriefingHeader({ briefing }: BriefingHeaderProps) {
  return (
    <div className="p-4 border-b border-white/20">
      <h1 className="text-xl font-bold mb-1">{briefing.title}</h1>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>By {briefing.author}</span>
        <span>Updated {formatDistanceToNow(new Date(briefing.updatedAt))} ago</span>
      </div>
    </div>
  )
}
