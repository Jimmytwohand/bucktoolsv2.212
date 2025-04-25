"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ArtilleryPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Artillery Batteries</h3>

      <Tabs defaultValue="union">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="union">Union</TabsTrigger>
          <TabsTrigger value="csa">CSA</TabsTrigger>
        </TabsList>

        <TabsContent value="union" className="space-y-4 pt-4">
          <ArtilleryForm side="Union" number={1} />
          <ArtilleryForm side="Union" number={2} />
          <ArtilleryForm side="Union" number={3} />
          <ArtilleryForm side="Union" number={4} />
        </TabsContent>

        <TabsContent value="csa" className="space-y-4 pt-4">
          <ArtilleryForm side="CSA" number={1} />
          <ArtilleryForm side="CSA" number={2} />
          <ArtilleryForm side="CSA" number={3} />
          <ArtilleryForm side="CSA" number={4} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ArtilleryFormProps {
  side: "Union" | "CSA"
  number: number
}

function ArtilleryForm({ side, number }: ArtilleryFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [details, setDetails] = useState("")

  // Create a display name that shows the battery name or default if not set
  const displayName = name || `${side} Battery ${number}`

  // Create a summary of cannon type for the collapsed view
  const typeSummary = type ? ` - ${type}` : ""

  return (
    <Accordion type="single" collapsible className="border border-white/20 rounded-md bg-black/40 backdrop-blur-sm">
      <AccordionItem value={`artillery-${side}-${number}`}>
        <AccordionTrigger className="px-4 flex items-center hover:bg-white/5">
          <div className="flex items-center gap-2 text-left">
            <span className="font-medium">{displayName}</span>
            <span className="text-sm text-muted-foreground">{typeSummary}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`artillery-name-${side}-${number}`}>Battery Name</Label>
              <Input
                id={`artillery-name-${side}-${number}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${side} Battery ${number}`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`artillery-type-${side}-${number}`}>Cannon Type</Label>
              <Input
                id={`artillery-type-${side}-${number}`}
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., 12-pounder Napoleon"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`artillery-details-${side}-${number}`}>Details</Label>
              <Input
                id={`artillery-details-${side}-${number}`}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details"
              />
            </div>

            <Button size="sm">Save Battery</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
