"use client"
import { useEffect, useState } from "react"

// Orange shades from 100 → 900
const colors = [
  "border-orange-100",
  "border-orange-200",
  "border-orange-300",
  "border-orange-400",
  "border-orange-500",
  "border-orange-600",
  "border-orange-700",
  "border-orange-800",
  "border-orange-900",
]

export default function Loading() {
  const [colorIndex, setColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 1000) // change color every 1 second

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full">
        {/* Spinning Loader Circle */}
        <div
          className={`absolute w-full h-full rounded-full border-4 border-t-4 border-t-transparent animate-spin ${colors[colorIndex]}`}
        ></div>

        {/* Fixed Center Text */}
        <span className="text-orange-600 font-bold text-center text-lg z-10">
          AROICON 2025 KOLKATA
        </span>
      </div>
    </div>
  )
}
