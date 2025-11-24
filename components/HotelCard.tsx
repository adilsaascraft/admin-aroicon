"use client";
import Image from "next/image";
import clsx from "clsx";
import { JSX, useState } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  ExternalLink,
  Plane,
  Train,
  Bus,
  Check,
  X,
  FileText,
  Map as MapIcon,
  Hotel,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddHotelForm from "@/components/forms/AddHotelForm";
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { mutate } from "swr";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type Hotel = {
  _id: string;
  hotelImage?: string; 
  hotelName: string;
  status: string;
  hotelAddress: string;
  googleMapLink?: string;
  registrationLink?: string;
  hotelCategory?: string;
  distanceFromAirport?: string;
  distanceFromRailwayStation?: string;
  nearestMetroStation?: string;
};

type HotelCardProps = {
  hotel: Hotel;
  onRefresh?: () => void; // 👈 callback to refresh parent list
};

export default function HotelCard({ hotel, onRefresh }: HotelCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hotels/${hotel._id}`,
      { method: "DELETE" }
    );

    if (!res.ok) throw new Error("Failed to delete");

    toast("Hotel has been deleted successfully!", {
      description: getIndianFormattedDate(),
    })

    // ✅ Update SWR cache immediately
    const SWR_KEY = `${process.env.NEXT_PUBLIC_API_URL}/api/hotels`;
    mutate(
      SWR_KEY,
      (cached: any) => ({
        ...cached,
        data: cached.data.filter((h: any) => h._id !== hotel._id),
      }),
      false
    );

    setDeleteOpen(false);
    onRefresh?.();
  } catch (err) {
    toast.error("Failed to delete hotel");
  }
};


  const statusMap: Record<string, { color: string; icon: JSX.Element }> = {
    Active: {
      color: "bg-green-100 text-green-700",
      icon: <Check className="h-5 w-5 mr-1" />,
    },
    Inactive: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <X className="h-5 w-5 mr-1" />,
    },
  };

  const currentStatus = statusMap[hotel.status] || {
    color: "bg-gray-100 text-gray-700",
    icon: <FileText className="h-3.5 w-3.5 mr-1" />,
  };

  return (
    <>
      <Card className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 relative shadow-sm">
        {/* Hotel Image */}
        <div className="w-[150px] h-[200px] relative">
          <Image
            src={hotel.hotelImage || "/fallback-hotel.png"}
            alt={hotel.hotelName}
            fill
            sizes="(max-width: 150px) 100vw, 200px"
            className="object-cover rounded-md"
          />
        </div>

        {/* Content */}
        <CardContent className="flex-1 w-full text-foreground">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-sky-800 dark:text-foreground">
              {hotel.hotelName}
            </h2>
            <span
              className={clsx(
                "inline-flex items-center text-xs font-semibold px-2 py-1 rounded",
                currentStatus.color
              )}
            >
              {currentStatus.icon}
              {hotel.status}
            </span>
          </div>

          {/* Details */}
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-800 dark:text-foreground">
            {hotel.hotelCategory && (
              <div className="flex items-center gap-2">
                <Hotel size={16} />
                <span>{hotel.hotelCategory}</span>
              </div>
            )}

            <div className="flex items-center gap-2 dark:text-foreground">
              <MapPin size={16} />
              <span>{hotel.hotelAddress}</span>
            </div>

            <a
              href={hotel.googleMapLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#1F5C9E] dark:text-foreground hover:underline"
            >
              <MapIcon size={14} />
              Google Map Direction
            </a>

            {hotel.distanceFromAirport && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Plane size={14} className="text-sky-700" />
                <span>
                  <strong>Airport:</strong> {hotel.distanceFromAirport}
                </span>
              </p>
            )}
            {hotel.distanceFromRailwayStation && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Train size={14} className="text-sky-700" />
                <span>
                  <strong>Railway Station:</strong>{" "}
                  {hotel.distanceFromRailwayStation}
                </span>
              </p>
            )}
            {hotel.nearestMetroStation && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-foreground">
                <Bus size={14} className="text-sky-700" />
                <span>
                  <strong>Metro Station:</strong> {hotel.nearestMetroStation}
                </span>
              </p>
            )}
          </div>
        </CardContent>

        {/* Dropdown Menu */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-sky-800 hover:bg-sky-900 text-white px-4 py-2 rounded-lg">
                Manage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={hotel.registrationLink || hotel.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Hotel Website
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[50vw]">
          <AddHotelForm
            mode="edit"
            hotel={hotel}
            onSuccess={() => {
              setEditOpen(false);
              onRefresh?.();
            }}
          />

        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hotel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete{" "}
              <span className="font-semibold">{hotel.hotelName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
