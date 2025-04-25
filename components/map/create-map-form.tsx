"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft } from "lucide-react"

export function CreateMapForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [mapUrl, setMapUrl] = useState("")
  const [mapFile, setMapFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMapFile(file)
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In the future, this will save to the database
      // For now, just simulate a delay and redirect
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a mock ID
      const newMapId = Date.now().toString()

      // Store in localStorage for demo purposes
      localStorage.setItem("currentMapId", newMapId)

      // Redirect to the map page
      router.push("/map")
    } catch (error) {
      console.error("Error creating map:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://i.ibb.co/vC0KrW2Z/42nd-Patch-copy-6-2.png"
                alt="Bucktools Logo"
                width={40}
                height={40}
                className="rounded-sm"
              />
              <span className="text-xl font-black uppercase tracking-tighter text-white">Bucktools</span>
              <span className="text-xs align-top text-white">™</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-blue-300 transition-colors text-xl">
              Home
            </Link>
            <Link href="/maps" className="text-white hover:text-blue-300 transition-colors text-xl">
              Maps
            </Link>
            <Link href="/map" className="text-white hover:text-blue-300 transition-colors text-xl">
              Tools
            </Link>
            <Link href="/collaboration" className="text-white hover:text-blue-300 transition-colors text-xl">
              Collaboration
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-2 text-white hover:bg-white/10" asChild>
              <Link href="/maps">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Map Library
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Create New Map</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Map Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your map"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for your map"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Map Image</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="map-url">From URL</Label>
                  <Input
                    id="map-url"
                    type="url"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder="https://example.com/map.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map-file">Or Upload File</Label>
                  <div className="flex gap-2">
                    <Input id="map-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => document.getElementById("map-file")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {(previewUrl || mapUrl) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md p-2 aspect-video relative">
                  <Image src={previewUrl || mapUrl} alt="Map Preview" fill className="object-contain" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/maps">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading || (!mapUrl && !mapFile) || !name}>
                {isLoading ? "Creating..." : "Create Map"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
