"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HotelCardSkeleton() {
  return (
    <Card className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 relative shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="w-[150px] h-[200px] rounded-md" />

      {/* Content */}
      <CardContent className="flex-1 w-full p-0">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-6 w-40" /> {/* Hotel Name */}
          <Skeleton className="h-5 w-16 rounded-full" /> {/* Status Badge */}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-32" /> {/* Category */}
          <Skeleton className="h-4 w-60" /> {/* Address */}
          <Skeleton className="h-4 w-40" /> {/* Google Map */}
          <Skeleton className="h-4 w-52" /> {/* Airport */}
          <Skeleton className="h-4 w-52" /> {/* Railway */}
          <Skeleton className="h-4 w-52" /> {/* Metro */}
        </div>
      </CardContent>

      {/* Manage button placeholder */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </Card>
  )
}
