'use client';

import { useState } from "react";
import { Calendar, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/imports";
import { mutate } from "swr";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Announcement } from "@/components/clients/AnnouncementClient";
import { Skeleton } from "@/components/ui/skeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

export default function AnnouncementCard({
  data,
  onEdit,
  loading = false,
}: { data?: Announcement; onEdit?: () => void; loading?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  if (loading) {
    return (
      <Card className="p-4 mb-4 shadow-sm space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/${data._id}`;
  const SWR_KEY = `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`;

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.();
  };

  const handleDelete = async () => {
    setLoadingDelete(true);

    mutate(
      SWR_KEY,
      (cached: any) => ({
        ...cached,
        data: cached?.data?.filter((a: Announcement) => a._id !== data._id) || []
      }),
      false
    );

    try {
      const res = await fetchWithAuth(API_URL, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to delete");

      toast("Announcement has been deleted successfully!", {
      description: getIndianFormattedDate(),
      })
      mutate(SWR_KEY);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
      mutate(SWR_KEY);
    } finally {
      setLoadingDelete(false);
      setMenuOpen(false);
    }
  };

  return (
    <Card className="p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="text-sm flex items-center gap-1 mb-2">
          <Calendar size={16} /> {new Date(data.updatedAt).toLocaleString()}
        </div>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <MoreVertical size={20} className="text-gray-600" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will be permanently deleted from announcement list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setMenuOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={loadingDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loadingDelete ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-base font-semibold">{data.heading}</h3>
      <p className="text-sm">{data.description}</p>
      <div className="flex items-center gap-2 text-sm">
        <Avatar className="h-6 w-6">
          <AvatarFallback>
            {data.postedBy ? data.postedBy[0].toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>
        Posted by {data.postedBy}
      </div>
    </Card>
  );
}
