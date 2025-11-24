// app/venues/page.tsx
"use client"

import useSWR from "swr"
import VenuePageClient, { Venue } from "@/components/clients/VenuePageClient"
import { fetcher } from "@/lib/fetcher"

export default function VenuePage() {
  const { data, error} = useSWR<{ success: boolean; data: Venue[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/venues`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  )

  if (error) return <div className="p-4 text-red-500">Failed to load venues ❌</div>

  const venues = data?.success ? data.data : []

  return <VenuePageClient initialVenues={venues}/>
}
