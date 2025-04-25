import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number, scale: number): number {
  const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return pixelDistance * scale
}

// Simple UUID generator for client-side use
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Stamina model based on the PRD
// These values would be replaced with actual data from the table
const staminaModel = {
  double: {
    // Time in seconds -> distance in yards
    30: 109.26,
    60: 218.52,
    90: 327.78,
    120: 437.04,
    150: 546.3,
    180: 655.56,
    // Maximum sustainable time and distance
    maxTime: 180,
    maxDistance: 655.56,
    speed: 3.642, // yards per second
  },
  triple: {
    // Time in seconds -> distance in yards
    30: 151.8,
    60: 303.6,
    90: 455.4,
    // Maximum sustainable time and distance
    maxTime: 90,
    maxDistance: 455.4,
    speed: 5.06, // yards per second
  },
}

export function calculateStamina(
  distance: number,
  speed: "double" | "triple",
): { timeSeconds: number; canComplete: boolean } {
  const model = staminaModel[speed]
  const timeSeconds = distance / model.speed

  return {
    timeSeconds,
    canComplete: distance <= model.maxDistance,
  }
}

export function calculateTimeForDistance(distance: number, speed: "double" | "triple"): number {
  return distance / staminaModel[speed].speed
}

export function calculateDistanceForTime(timeSeconds: number, speed: "double" | "triple"): number {
  return Math.min(timeSeconds * staminaModel[speed].speed, staminaModel[speed].maxDistance)
}

export async function loadImageWithCORS(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Try different methods to load the image
    const methods = [
      // Method 1: Direct with CORS
      () => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = url
        return img
      },
      // Method 2: Through a CORS proxy
      () => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `https://cors-anywhere.herokuapp.com/${url}`
        return img
      },
      // Method 3: Through another CORS proxy
      () => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        return img
      },
    ]

    let currentMethod = 0

    function tryNextMethod() {
      if (currentMethod >= methods.length) {
        reject(new Error("All methods failed to load the image"))
        return
      }

      const img = methods[currentMethod]()

      img.onload = () => resolve(img)
      img.onerror = () => {
        currentMethod++
        tryNextMethod()
      }
    }

    tryNextMethod()
  })
}
