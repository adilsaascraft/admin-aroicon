"use client"

import Image from "next/image"
import { JSX, useState } from "react"
import {
  MapPin,
  Plane,
  Train,
  Bus,
  Pencil,
  Trash2,
  ExternalLink,
  Map as MapIcon,
  Check,
  X,
  FileText,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import AddVenueForm from "@/components/forms/AddVenueForm"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { Venue } from "@/components/clients/VenuePageClient"
import { getIndianFormattedDate } from "@/lib/formatIndianDate"

type VenueCardProps = {
  venue: Venue
  onRefresh?: () => void
}

/* ------------------ VenueCardSkeleton ------------------ */
export function VenueCardSkeleton() {
  return (
    <Card className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 relative shadow-sm">
      {/* Image skeleton */}
      <div className="w-[150px] h-[200px] bg-gray-200 animate-pulse rounded-md" />

      {/* Content skeleton */}
      <CardContent className="flex-1 w-full p-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-40 h-5 bg-gray-200 animate-pulse rounded" />
          <div className="w-16 h-5 bg-gray-200 animate-pulse rounded" />
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <div className="w-64 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-40 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardContent>

      {/* Manage button skeleton */}
      <div className="absolute top-4 right-4">
        <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    </Card>
  )
}

/* ------------------ VenueCard ------------------ */
export default function VenueCard({ venue, onRefresh }: VenueCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/venues/${venue._id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed to delete venue")
      toast("Venue has been deleted successfully!", {
            description: getIndianFormattedDate(),
          })
      setDeleteOpen(false)
      onRefresh?.()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to delete venue ❌")
    }
  }

  const statusMap: Record<string, { color: string; icon: JSX.Element }> = {
    Active: { color: "bg-green-100 text-green-700", icon: <Check className="h-5 w-5 mr-1" /> },
    Inactive: { color: "bg-yellow-100 text-yellow-700", icon: <X className="h-5 w-5 mr-1" /> },
  }

  const currentStatus = statusMap[venue.status] || {
    color: "bg-gray-100 text-gray-700",
    icon: <FileText className="h-3.5 w-3.5 mr-1" />,
  }

  return (
    <>
      <Card className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 relative shadow-sm">
        {/* Venue Image */}
        <div className="w-[150px] h-[200px] relative">
          <Image
            src={venue.venueImage || "/fallback-venue.png"}
            alt={venue.venueName}
            fill
            sizes="(max-width: 150px) 100vw, 200px"
            className="object-cover rounded-md"
          />
        </div>

        {/* Content */}
        <CardContent className="flex-1 w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-sky-800 dark:text-foreground">{venue.venueName}</h2>
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded ${currentStatus.color}`}
            >
              {currentStatus.icon}
              {venue.status}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-800 dark:text-foreground">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {venue.venueAddress}
            </div>
            {venue.googleMapLink && (
              <a
                href={venue.googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#1F5C9E] dark:text-foreground hover:underline"
              >
                <MapIcon size={14} /> Google Map Direction
              </a>
            )}
            {venue.distanceFromAirport && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Plane size={14} className="text-sky-700" /> <strong>Airport:</strong>{" "}
                {venue.distanceFromAirport}
              </p>
            )}
            {venue.distanceFromRailwayStation && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Train size={14} className="text-sky-700" /> <strong>Railway:</strong>{" "}
                {venue.distanceFromRailwayStation}
              </p>
            )}
            {venue.nearestMetroStation && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Bus size={14} className="text-sky-700" /> <strong>Metro:</strong>{" "}
                {venue.nearestMetroStation}
              </p>
            )}
          </div>
        </CardContent>

        {/* Dropdown */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-sky-800 hover:bg-sky-900 text-white px-4 py-2 rounded-lg">
                Manage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={venue.website || venue.googleMapLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Website
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[50vw]">
          <AddVenueForm
            mode="edit"
            venue={venue}
            onSuccess={() => {
              setEditOpen(false)
              onRefresh?.()
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete{" "}
              <strong>{venue.venueName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
