"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CollaborationInterface() {
  const [sessionId, setSessionId] = useState("")
  const [username, setUsername] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleCreateSession = () => {
    // In a real implementation, this would create a new collaboration session
    // For now, we'll just simulate it
    const newSessionId = Math.random().toString(36).substring(2, 10)
    setSessionId(newSessionId)
    setIsJoining(true)
  }

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would join an existing session
    setIsJoining(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="https://i.ibb.co/vC0KrW2Z/42nd-Patch-copy-6-2.png"
              alt="Bucktools Logo"
              width={40}
              height={40}
              className="rounded-sm"
            />
            <span className="text-xl font-black uppercase tracking-tighter text-white">Bucktools</span>
            <span className="text-xs align-top text-white">™</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-8 mr-6">
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
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10" asChild>
              <Link href="/map">Back to Map</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/art2bw-EBG5EhgCzwzQ23bc8ZpXLBHNhhAwBJ.png"
            alt="Civil War Battlefield with Cannon in Fog"
            fill
            className="object-cover brightness-75"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        {!isJoining ? (
          <div className="relative z-10 container flex flex-col items-center justify-center gap-8 py-24">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Real-time Collaboration</h1>
            <p className="max-w-md text-center text-white/80">
              Work together with others in real-time on the same map. Create a new session or join an existing one.
            </p>

            <div className="flex w-full max-w-md flex-col gap-8 sm:flex-row">
              <div className="flex-1 rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">Create New Session</h2>
                <Button
                  onClick={handleCreateSession}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-black border-none"
                >
                  Create Session
                </Button>
              </div>

              <div className="flex-1 rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">Join Existing Session</h2>
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-id" className="text-white">
                      Session ID
                    </Label>
                    <Input
                      id="session-id"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      placeholder="Enter session ID"
                      required
                      className="bg-black/50 border-white/30 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-black border-none">
                    Join Session
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 container flex flex-col items-center justify-center gap-6 py-24">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Join Collaboration Session</h1>
            <p className="text-white/80">
              Session ID: <span className="font-mono">{sessionId}</span>
            </p>

            <form className="w-full max-w-md space-y-4 rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-6 shadow-xl">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-white">
                  Your Display Name
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="bg-black/50 border-white/30 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-black border-none">
                Join Collaboration
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
