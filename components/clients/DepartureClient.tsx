"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

import AddDepartureForm from "@/components/forms/AddDepartureForm";
import { DataTable } from "@/components/DataTable";
import { DepartureValues } from "@/validations/departureSchema";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

export default function DepartureClient() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDeparture, setEditingDeparture] =
    useState<DepartureValues & { _id?: string } | null>(null);

  // 🔥 Fetch departure list
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/departure-details`,
    fetcher
  );

  const departures: (DepartureValues & { _id: string })[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  // ➕ Add
  const handleAdd = () => {
    setEditingDeparture(null);
    setSheetOpen(true);
  };

  // ✏ Edit
  const handleEdit = (departure: DepartureValues & { _id: string }) => {
    setEditingDeparture(departure);
    setSheetOpen(true);
  };

  // 💾 Save (POST / PUT)
  const handleSave = async (formData: DepartureValues & { _id?: string }) => {
    try {
      const base = `${process.env.NEXT_PUBLIC_API_URL}/api/departure-details`;

      if (formData._id) {
        await apiRequest(`${base}/${formData._id}`, "PUT", formData);
      } else {
        await apiRequest(base, "POST", formData);
      }

      await mutate();
      setSheetOpen(false);
      setEditingDeparture(null);

      toast.success(formData._id ? "Departure updated" : "Departure created", {
        description: getIndianFormattedDate(),
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    try {
      const base = `${process.env.NEXT_PUBLIC_API_URL}/api/departure-details`;
      await apiRequest(`${base}/${id}`, "DELETE");

      toast.warning("Departure deleted successfully!", {
        description: getIndianFormattedDate(),
      });

      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 📄 Table Columns (MATCHING DepartureSchema)
  const columns: ColumnDef<DepartureValues & { _id: string }>[] = [
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
      header: sortableHeader("Faculty"),
    },
    {
      accessorKey: "departureDate",
      header: sortableHeader("Departure Date"),
    },
    {
      accessorKey: "departureTime",
      header: sortableHeader("Departure Time"),
    },
    {
      accessorKey: "departureFlightDetail",
      header: sortableHeader("Flight No."),
    },

    // 🔧 Actions
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
                  This will permanently delete departure entry of{" "}
                  <span className="font-semibold">{row.original.facultyName}</span>.
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

  const isLoading = !data && !error;
  if (isLoading) return <EntitySkeleton title="Departures" />;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Departures</h1>

        <Button onClick={handleAdd} className="bg-orange-500 text-white hover:bg-orange-600">
          + Add Departure
        </Button>
      </div>

      {/* Table - no tabs */}
      <DataTable data={departures} columns={columns} />

      {/* Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingDeparture ? "Edit Departure" : "Add Departure"}
            </h2>
          </div>

          <AddDepartureForm
            defaultValues={editingDeparture || undefined}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Sortable Header Helper
function sortableHeader(label: string) {
  const HeaderComponent = ({ column }: any) => {
    const sorted = column.getIsSorted();
    return (
      <Button variant="ghost" onClick={() => column.toggleSorting(sorted === "asc")}>
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
