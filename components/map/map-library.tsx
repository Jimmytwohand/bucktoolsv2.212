"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapCard } from "@/components/map/map-card"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for maps
const mockMaps = [
  {
    id: "1",
    name: "Gettysburg Battlefield",
    description: "Map of the Gettysburg battlefield with key positions marked",
    imageUrl: "https://i.imgur.com/JVUmFRF.jpg",
    createdAt: new Date("2023-07-01").toISOString(),
    updatedAt: new Date("2023-07-15").toISOString(),
  },
  {
    id: "2",
    name: "Antietam Battlefield",
    description: "Detailed map of the Antietam campaign",
    imageUrl: "https://i.imgur.com/8cTW5lj.jpg",
    createdAt: new Date("2023-06-15").toISOString(),
    updatedAt: new Date("2023-06-20").toISOString(),
  },
  {
    id: "3",
    name: "Bull Run",
    description: "First Battle of Bull Run tactical map",
    imageUrl: "https://i.imgur.com/QZW0Cdt.jpg",
    createdAt: new Date("2023-05-10").toISOString(),
    updatedAt: new Date("2023-05-12").toISOString(),
  },
  {
    id: "4",
    name: "River Crossing Skirmish",
    description: "Tactical map for a river crossing engagement",
    imageUrl:
      "https://sjc.microlink.io/Ia_L6ruI59_DBgoW9YG5kC4Ep79DasNN9ViZNGs6t6Em4ZbXbhIU5RBwh1Cs4CUVQVm6HG1g94DXVzmiWeFbCg.jpeg",
    createdAt: new Date("2023-04-22").toISOString(),
    updatedAt: new Date("2023-04-25").toISOString(),
  },
]

export function MapLibrary() {
  const [maps, setMaps] = useState(mockMaps)
  const router = useRouter()

  const handleDeleteMap = (id: string) => {
    // In the future, this will call the database to delete the map
    setMaps(maps.filter((map) => map.id !== id))
  }

  const handleSelectMap = (id: string) => {
    // In the future, this will set the current map in context
    // For now, just navigate to the map page
    localStorage.setItem("currentMapId", id)
    router.push("/map")
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

      <main className="flex-1 relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smokeyforestbw.png-dKnqc7e87YwCmAyZO3LWTUYlGCG5mE.jpeg"
            alt="Civil War Soldiers in Foggy Forest"
            fill
            className="object-cover brightness-75"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        <div className="relative z-10 container py-12">
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-4">Map Library</h1>
            <p className="text-white/80 text-lg max-w-2xl text-center mb-6">
              Browse your collection of battlefield maps or create a new one to begin planning your strategy
            </p>
            <Button asChild className="bg-blue-400 hover:bg-blue-500 text-black border-none">
              <Link href="/map/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Map
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onSelect={() => handleSelectMap(map.id)}
                onDelete={() => handleDeleteMap(map.id)}
              />
            ))}
          </div>

          {maps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/20 text-center max-w-md">
                <h3 className="text-xl font-semibold text-white mb-2">No Maps Found</h3>
                <p className="text-white/70 mb-6">
                  You haven't created any maps yet. Create your first map to get started.
                </p>
                <Button asChild className="bg-blue-400 hover:bg-blue-500 text-black border-none">
                  <Link href="/map/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Map
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
