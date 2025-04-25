"use client"

import { useEffect, useRef } from "react"
import { type BriefingSection, useMap } from "@/contexts/map-context"
import { cn } from "@/lib/utils"

interface BriefingContentProps {
  sections: BriefingSection[]
  activeSection: string | null
  linkToMapActive: boolean
}

export function BriefingContent({ sections, activeSection, linkToMapActive }: BriefingContentProps) {
  const { addHighlightPoint, clearHighlightPoints } = useMap()
  const contentRef = useRef<HTMLDivElement>(null)

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Scroll to active section
  useEffect(() => {
    if (activeSection && contentRef.current) {
      const sectionElement = document.getElementById(`section-${activeSection}`)
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [activeSection])

  // Process content to find and handle map references
  const processContent = (content: string) => {
    // Replace map references with interactive spans
    // Format: [location: x,y, radius]
    const regex = /\[location: (\d+),(\d+)(?:, (\d+))?\](.*?)\[\/location\]/g

    return content.replace(regex, (match, x, y, radius, text) => {
      const coordinates = { x: Number.parseInt(x), y: Number.parseInt(y) }
      const highlightRadius = radius ? Number.parseInt(radius) : 20

      const handleClick = () => {
        if (linkToMapActive) {
          clearHighlightPoints()
          addHighlightPoint({
            id: `highlight-${Date.now()}`,
            coordinates,
            radius: highlightRadius,
            color: "#00ff00",
            opacity: 0.5,
            sourceId: "briefing-reference",
            temporary: true,
            expiresAt: Date.now() + 5000, // Highlight for 5 seconds
          })

          // TODO: Center map on these coordinates
        }
      }

      return `<span class="text-primary underline cursor-pointer" data-x="${x}" data-y="${y}" data-radius="${highlightRadius || 20}" onclick="handleMapReference(this)">${text}</span>`
    })
  }

  // Add global handler for map references
  useEffect(() => {
    // @ts-ignore
    window.handleMapReference = (element) => {
      if (!linkToMapActive) return

      const x = Number.parseInt(element.dataset.x)
      const y = Number.parseInt(element.dataset.y)
      const radius = Number.parseInt(element.dataset.radius)

      clearHighlightPoints()
      addHighlightPoint({
        id: `highlight-${Date.now()}`,
        coordinates: { x, y },
        radius,
        color: "#00ff00",
        opacity: 0.5,
        sourceId: "briefing-reference",
        temporary: true,
        expiresAt: Date.now() + 5000, // Highlight for 5 seconds
      })

      // TODO: Center map on these coordinates
    }

    return () => {
      // @ts-ignore
      window.handleMapReference = undefined
    }
  }, [addHighlightPoint, clearHighlightPoints, linkToMapActive])

  return (
    <div ref={contentRef} className="p-4">
      {sortedSections.map((section) => (
        <div
          key={section.id}
          id={`section-${section.id}`}
          className={cn(
            "mb-6 pb-4 border-b border-white/10 last:border-0",
            activeSection === section.id && "bg-primary/5 -mx-4 px-4",
          )}
        >
          <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: processContent(section.content) }}
          />
        </div>
      ))}
    </div>
  )
}
