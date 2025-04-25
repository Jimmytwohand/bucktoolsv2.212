"use client"

import type { BriefingSection } from "@/contexts/map-context"
import { cn } from "@/lib/utils"

interface TableOfContentsProps {
  sections: BriefingSection[]
  activeSection: string | null
  onSectionSelect: (sectionId: string) => void
}

export function TableOfContents({ sections, activeSection, onSectionSelect }: TableOfContentsProps) {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="p-4 border-b border-white/20">
      <h3 className="text-sm font-medium mb-2">Table of Contents</h3>
      <ul className="space-y-1">
        {sortedSections.map((section) => (
          <li key={section.id}>
            <button
              className={cn(
                "text-sm w-full text-left px-2 py-1 rounded hover:bg-white/10",
                activeSection === section.id && "bg-primary/20 font-medium",
              )}
              onClick={() => onSectionSelect(section.id)}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
