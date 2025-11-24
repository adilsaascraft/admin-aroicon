// app/announcements/page.tsx
"use client"
import useSWR from "swr"
import AnnouncementClient, { Announcement } from "@/components/clients/AnnouncementClient"
import { fetcher } from "@/lib/fetcher"

export default function AnnouncementsPage() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Announcement[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  )

  if (error) return <div className="p-4 text-red-500">Failed to load announcements</div>

  const announcements = data?.success ? data.data : []

  return <AnnouncementClient initialAnnouncements={announcements} isLoading={isLoading} />
}
