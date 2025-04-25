import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with dark background */}
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

      {/* Hero section with background image and diagonal overlay */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grayscaleaim.jpg-dTUCTGoBpKvjVw6xrtXMkweW0kIVT3.jpeg"
            alt="Civil War Soldiers Aiming Rifles"
            fill
            className="object-cover brightness-75"
            priority
          />

          {/* Diagonal pale blue overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-300/40 clip-diagonal"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 flex flex-col items-start justify-center h-full py-24 px-4 sm:px-8">
          <div className="max-w-4xl">
            <div className="mb-4 tracking-widest text-white/80">BATTLEFIELD TOOLS</div>
            <h1 className="text-6xl sm:text-7xl md:text-[8rem] font-black tracking-tight text-white leading-none drop-shadow-lg">
              <span className="block uppercase tracking-tighter">42nd PA</span>
            </h1>
            <p className="mt-6 max-w-[700px] text-white/80 text-xl">
              Battlemap tools for the Bucktail accuracy guarantee
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-400 hover:bg-blue-500 text-black border-none">
                <Link href="/maps">Browse Maps</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/map/new">Create New Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
