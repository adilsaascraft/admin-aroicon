// app/hotels/page.tsx
"use client"

import useSWR from "swr"
import HotelPageClient, { Hotel } from "@/components/clients/HotelPageClient"
import { fetcher } from "@/lib/fetcher"

export default function HotelsPage() {
  const { data, error} = useSWR<{ success: boolean; data: Hotel[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hotels`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  )

  if (error) return <div className="p-4 text-red-500">Failed to load hotels ❌</div>

  const hotels = data?.success ? data.data : []

  return <HotelPageClient initialHotels={hotels}/>
}
