"use client"
import { useEffect, useState } from "react"

const colors = [
  "border-sky-400",
  "border-sky-500",
  "border-sky-600",
  "border-sky-700",
  "border-sky-800",
  "border-sky-900",
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
        <span className="text-sky-800 font-bold text-center text-lg z-10">
          AIG Academics
        </span>
      </div>
    </div>
  )
}