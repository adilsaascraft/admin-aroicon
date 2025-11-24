'use client';

import { useState } from 'react';
import useSWR from 'swr';
import AnnouncementCard from '@/components/AnnouncementCard';
import AddAnnouncementForm from '@/components/forms/AddAnnouncementForm';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export type Announcement = {
  _id: string;
  updatedAt: string;
  heading: string;
  description: string;
  postedBy: string;
};

type Props = {
  initialAnnouncements: Announcement[];
  isLoading?: boolean;
};

const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function AnnouncementClient({ initialAnnouncements, isLoading }: Props) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`;

  const { data, error, mutate } = useSWR<{ success: boolean; data: Announcement[] }>(
    API_URL,
    fetcher,
    {
      fallbackData: { success: true, data: initialAnnouncements },
      revalidateOnFocus: false,
    }
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);

  const announcements: Announcement[] = data?.data || [];

  const openEditSheet = (announcement: Announcement) => {
    setEditAnnouncement(announcement);
    setSheetOpen(true);
  };

  const refreshAnnouncements = async () => {
    await mutate();
  };

  return (
    <div className="p-4 bg-background text-foreground">
      {/* ✅ Header Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Announcements</h1>
        <Sheet
          open={sheetOpen}
          onOpenChange={(v) => {
            setSheetOpen(v);
            if (!v) setEditAnnouncement(null);
          }}
        >
          <SheetTrigger asChild>
            <Button
              className="bg-sky-800 hover:bg-sky-900 text-white cursor-pointer"
              onClick={() => setSheetOpen(true)}
            >
              + Add Announcement
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[500px] sm:w-[600px]">
            <AddAnnouncementForm
              onSuccess={() => {
                setSheetOpen(false);
                refreshAnnouncements();
              }}
              mode={editAnnouncement ? 'edit' : 'add'}
              announcement={editAnnouncement || undefined}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* ✅ Skeleton or Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AnnouncementCard key={i} loading />
          ))}
        </div>
      ) : error ? (
        <p className="p-4 text-red-500">Failed to load announcements.</p>
      ) : announcements.length === 0 ? (
        <p className="p-4 text-gray-500">No announcements found.</p>
      ) : (
        announcements.map((a) => (
          <AnnouncementCard key={a._id} data={a} onEdit={() => openEditSheet(a)} />
        ))
      )}
    </div>
  );
}
