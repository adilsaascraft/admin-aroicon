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

import AddArrivalForm from "@/components/forms/AddArrivalForm";
import { DataTable } from "@/components/DataTable";
import { ArrivalValues } from "@/validations/arrivalSchema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

export default function ArrivalClient() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingArrival, setEditingArrival] =
    useState<ArrivalValues & { _id?: string } | null>(null);

  // Fetch arrivals
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/checkin-details`,
    fetcher
  );

  const arrivals: (ArrivalValues & { _id: string })[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  // Add
  const handleAdd = () => {
    setEditingArrival(null);
    setSheetOpen(true);
  };

  // Edit
  const handleEdit = (arrival: ArrivalValues & { _id: string }) => {
    setEditingArrival(arrival);
    setSheetOpen(true);
  };

  // Save (create/update)
  const handleSave = async (formData: ArrivalValues & { _id?: string }) => {
    try {
      const base = `${process.env.NEXT_PUBLIC_API_URL}/api/checkin-details`;
      if (formData._id) {
        await apiRequest(`${base}/${formData._id}`, "PUT", formData);
      } else {
        await apiRequest(base, "POST", formData);
      }

      await mutate();
      setSheetOpen(false);
      setEditingArrival(null);
      toast.success(formData._id ? "Arrival updated" : "Arrival created", {
        description: getIndianFormattedDate(),
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      const base = `${process.env.NEXT_PUBLIC_API_URL}/api/checkin-details`;
      await apiRequest(`${base}/${id}`, "DELETE");

      toast.warning("Arrival deleted successfully!", {
        description: getIndianFormattedDate(),
      });

      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Table Columns
  const columns: ColumnDef<ArrivalValues & { _id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "facultyName",
      header: sortableHeader("Faculty"),
    },
    {
      accessorKey: "arrivalDate",
      header: sortableHeader("Arrival Date"),
    },
    {
      accessorKey: "arrivalTime",
      header: sortableHeader("Arrival Time"),
    },
    {
      accessorKey: "arrivalFlightDetail",
      header: sortableHeader("Flight Number"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>

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
                  This will permanently delete{" "}
                  <span className="font-semibold">{row.original.facultyName}</span>
                  's arrival entry.
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
  if (isLoading) return <EntitySkeleton title="Arrivals" />;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Arrivals</h1>

        <Button onClick={handleAdd} className="bg-orange-500 text-white hover:bg-orange-600">
          + Add Arrival
        </Button>
      </div>

      {/* Table */}
      <DataTable data={arrivals} columns={columns} />

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingArrival ? "Edit Arrival" : "Add Arrival"}
            </h2>
          </div>

          <AddArrivalForm
            defaultValues={editingArrival || undefined}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// helper to DRY sortable column headers
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
