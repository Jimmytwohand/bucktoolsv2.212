"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"

export function RegimentPanel() {
  return (
    <div className="space-y-4 text-white">
      <h3 className="text-xl font-medium text-white drop-shadow-md mb-2">Regiments</h3>

      <Tabs defaultValue="union">
        <TabsList className="grid w-full grid-cols-2 bg-black/70 border border-white/10 p-0.5">
          <TabsTrigger value="union" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-white">
            Union
          </TabsTrigger>
          <TabsTrigger value="csa" className="data-[state=active]:bg-red-500/30 data-[state=active]:text-white">
            CSA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="union" className="space-y-4 pt-4">
          <RegimentForm side="Union" number={1} />
          <RegimentForm side="Union" number={2} />
        </TabsContent>

        <TabsContent value="csa" className="space-y-4 pt-4">
          <RegimentForm side="CSA" number={1} />
          <RegimentForm side="CSA" number={2} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RegimentFormProps {
  side: "Union" | "CSA"
  number: number
}

function RegimentForm({ side, number }: RegimentFormProps) {
  const [name, setName] = useState("")
  const [weapons, setWeapons] = useState("")
  const [details, setDetails] = useState("")
  const [buckAndBall, setBuckAndBall] = useState(false)
  const [cavalry, setCavalry] = useState(false)

  // Create a display name that shows the regiment name or default if not set
  const displayName = name || `${side} Regiment ${number}`

  // Create a summary of weapons for the collapsed view
  const weaponsSummary = weapons ? ` - ${weapons}` : ""

  return (
    <Accordion
      type="single"
      collapsible
      className="border border-white/20 rounded-md bg-black/60 backdrop-blur-md shadow-md"
    >
      <AccordionItem value={`regiment-${side}-${number}`}>
        <AccordionTrigger className="px-4 flex items-center hover:bg-white/10 data-[state=open]:bg-blue-500/10 transition-colors">
          <div className="flex items-center gap-2 text-left">
            {buckAndBall && (
              <div className="relative flex items-center justify-center w-5 h-4">
                {/* Main bullet */}
                <div className="absolute w-2.5 h-2.5 bg-gray-300 rounded-full border border-gray-500"></div>
                {/* Smaller buckshot pellets */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="absolute top-0 right-0 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            )}
            {cavalry && (
              <div className="relative flex items-center justify-center w-5 h-4">
                {/* Horseshoe - main U shape */}
                <div
                  className="w-4 h-3.5 border-2 border-gray-400 rounded-b-full"
                  style={{
                    borderTop: "none",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0",
                  }}
                ></div>

                {/* Nail holes */}
                <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute top-2 left-0.5 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute top-2 right-0.5 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute bottom-0.5 left-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute bottom-0.5 right-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
            )}
            <span className="font-medium text-white drop-shadow-sm">{displayName}</span>
            <span className="text-sm text-blue-200/70">{weaponsSummary}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 bg-black/40">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`regiment-name-${side}-${number}`}>Regiment Name</Label>
              <Input
                id={`regiment-name-${side}-${number}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${side} Regiment ${number}`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`regiment-weapons-${side}-${number}`}>Weapons</Label>
              <Input
                id={`regiment-weapons-${side}-${number}`}
                value={weapons}
                onChange={(e) => setWeapons(e.target.value)}
                placeholder="e.g., Springfield Model 1861"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id={`buck-and-ball-${side}-${number}`} checked={buckAndBall} onCheckedChange={setBuckAndBall} />
              <Label htmlFor={`buck-and-ball-${side}-${number}`} className="cursor-pointer">
                Buck and Ball Ammunition
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id={`cavalry-${side}-${number}`} checked={cavalry} onCheckedChange={setCavalry} />
              <Label htmlFor={`cavalry-${side}-${number}`} className="cursor-pointer">
                Cavalry Unit
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`regiment-details-${side}-${number}`}>Details</Label>
              <Input
                id={`regiment-details-${side}-${number}`}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details"
              />
            </div>

            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              Save Regiment
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
