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

import AddFacultyForm from "@/components/forms/AddFacultyForm";
import { DataTable } from "@/components/DataTable";
import { FacultyValues } from "@/validations/facultySchema";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { fetcher } from "@/lib/fetcher";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

export default function FacultyClient() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] =
    useState<FacultyValues & { _id?: string } | null>(null);

  // Fetch Faculties
  const { data, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/faculty`,
    fetcher
  );

  const facultyList: (FacultyValues & { _id: string })[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  // Add
  const handleAdd = () => {
    setEditingFaculty(null);
    setSheetOpen(true);
  };

  // Edit
  const handleEdit = (faculty: FacultyValues & { _id: string }) => {
    setEditingFaculty(faculty);
    setSheetOpen(true);
  };

  // Save (POST / PUT)
  const handleSave = async (formData: FacultyValues & { _id?: string }) => {
    try {
      const isEdit = Boolean(formData._id);

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty/${formData._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const saved = await res.json();
      if (!res.ok)
        throw new Error(saved.message || `${isEdit ? "Update" : "Create"} failed`);

      toast.success(isEdit ? "Faculty updated" : "Faculty created");
      setSheetOpen(false);
      setEditingFaculty(null);
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty/${id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Delete failed");

      toast.warning("Faculty deleted successfully!", {
        description: getIndianFormattedDate(),
      });

      mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Table Columns
  const columns: ColumnDef<FacultyValues & { _id: string }>[] = [
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
      accessorKey: "email",
      header: sortableHeader("Email"),
    },
    {
      accessorKey: "mobile",
      header: sortableHeader("Mobile"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
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

  if (isLoading) return <EntitySkeleton title="Faculty" />;

  return (
    <div className="bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Faculties</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Faculty
        </Button>
      </div>

      {/* TABLE WITHOUT TABS (FULL RAW LIST) */}
      <DataTable data={facultyList} columns={columns} />

      {/* Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingFaculty ? "Edit Faculty" : "Add Faculty"}
            </h2>
          </div>
          <AddFacultyForm
            defaultValues={editingFaculty || undefined}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

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
