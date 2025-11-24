"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function VenueCardSkeleton() {
  return (
    <Card className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 relative shadow-sm animate-pulse">
      {/* Venue Image Placeholder */}
      <div className="w-[150px] h-[200px] bg-gray-200 rounded-md" />

      {/* Content */}
      <CardContent className="flex-1 w-full p-0 space-y-3">
        {/* Title + Status */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
        </div>

        {/* Address */}
        <div className="h-4 w-60 bg-gray-200 rounded" />

        {/* Map link */}
        <div className="h-4 w-40 bg-gray-200 rounded" />

        {/* Distances */}
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </CardContent>

      {/* Manage Button Placeholder */}
      <div className="absolute top-4 right-4">
        <div className="h-9 w-20 bg-gray-200 rounded" />
      </div>
    </Card>
  )
}
