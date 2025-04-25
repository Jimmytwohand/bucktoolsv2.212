"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateStamina } from "@/lib/utils"

export function StaminaCalculator() {
  const [distance, setDistance] = useState<string>("")
  const [speed, setSpeed] = useState<"double" | "triple">("double")
  const [result, setResult] = useState<{ timeSeconds: number; canComplete: boolean } | null>(null)

  const handleCalculate = () => {
    if (!distance || isNaN(Number(distance))) return

    const distanceValue = Number(distance)
    const staminaResult = calculateStamina(distanceValue, speed)
    setResult(staminaResult)
  }

  return (
    <Card className="border border-white/20 bg-black/40 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <CardTitle>Stamina Calculator</CardTitle>
        <CardDescription>Calculate how long a player can run and if they can complete the distance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="distance">Distance (yards)</Label>
            <Input
              id="distance"
              type="number"
              min="1"
              placeholder="Enter distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>

          <Tabs defaultValue="double" onValueChange={(value) => setSpeed(value as "double" | "triple")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="double">Double Quick</TabsTrigger>
              <TabsTrigger value="triple">Triple Quick</TabsTrigger>
            </TabsList>
            <TabsContent value="double" className="pt-2">
              <p className="text-sm text-muted-foreground">Double Quick: 3.642 yards/second</p>
            </TabsContent>
            <TabsContent value="triple" className="pt-2">
              <p className="text-sm text-muted-foreground">Triple Quick: 5.06 yards/second</p>
            </TabsContent>
          </Tabs>

          <Button onClick={handleCalculate} disabled={!distance || isNaN(Number(distance))}>
            Calculate
          </Button>

          {result && (
            <div className="mt-4 rounded-md border border-border p-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Time Required:</span>
                  <span className="font-mono">
                    {Math.floor(result.timeSeconds / 60)}m {Math.round(result.timeSeconds % 60)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Can Complete:</span>
                  <span className={result.canComplete ? "text-green-500" : "text-red-500"}>
                    {result.canComplete ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
