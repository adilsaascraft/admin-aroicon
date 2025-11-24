"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import AddHotelForm from "@/components/forms/AddHotelForm";
import { DataTable } from "@/components/DataTable";
import { HotelValues } from "@/validations/hotelSchema";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

export default function HotelClient() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingHotel, setEditingHotel] =
    useState<HotelValues & { _id?: string } | null>(null);

  // 🔥 Fetch Hotels
  const { data, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-details`,
    fetcher
  );

  const hotelList: (HotelValues & { _id: string })[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  // ➕ Add
  const handleAdd = () => {
    setEditingHotel(null);
    setSheetOpen(true);
  };

  // ✏ Edit
  const handleEdit = (hotel: HotelValues & { _id: string }) => {
    setEditingHotel(hotel);
    setSheetOpen(true);
  };

  // 💾 Save
  const handleSave = async (formData: HotelValues & { _id?: string }) => {
    try {
      if (formData._id) {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-details/${formData._id}`,
          "PUT",
          formData
        );
      } else {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-details`,
          "POST",
          formData
        );
      }

      await mutate();
      setSheetOpen(false);
      setEditingHotel(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-details/${id}`,
        "DELETE"
      );

      toast.success("Hotel record deleted successfully!", {
        description: getIndianFormattedDate(),
      });

      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 📄 Table Columns (match HotelSchema)
  const columns: ColumnDef<HotelValues & { _id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
    },

    {
      accessorKey: "facultyName",
      header: sortableHeader("Faculty Name"),
    },
    {
      accessorKey: "hotelName",
      header: sortableHeader("Hotel Name"),
    },
    {
      accessorKey: "checkInDate",
      header: sortableHeader("Check-in Date"),
    },
    {
      accessorKey: "checkOutDate",
      header: sortableHeader("Check-out Date"),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-sky-800 hover:bg-sky-900" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete hotel entry of{" "}
                  <span className="font-semibold">
                    {row.original.facultyName}
                  </span>.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(row.original._id)}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  if (isLoading) return <EntitySkeleton title="Hotels" />;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hotel Stay</h1>

        <Button
          onClick={handleAdd}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          + Add Hotel Stay
        </Button>
      </div>

      {/* Table */}
      <DataTable data={hotelList} columns={columns} />

      {/* Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingHotel ? "Edit Hotel Stay" : "Add Hotel Stay"}
            </h2>
          </div>

          <AddHotelForm
            defaultValues={editingHotel || undefined}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Sortable header helper
function sortableHeader(label: string) {
  const HeaderComponent = ({ column }: any) => {
    const sorted = column.getIsSorted();
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        {label}
        {sorted === "asc" && <ArrowUp className="h-4 w-4 ml-2" />}
        {sorted === "desc" && <ArrowDown className="h-4 w-4 ml-2" />}
        {!sorted && <ArrowUpDown className="h-4 w-4 ml-2" />}
      </Button>
    );
  };

  HeaderComponent.displayName = `SortableHeader(${label})`;
  return HeaderComponent;
}
