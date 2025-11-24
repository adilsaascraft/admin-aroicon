"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/components/ui/alert-dialog"
import AddRoomCategoryForm from "@/components/forms/AddRoomCategoryForm"
import { DataTable } from "@/components/DataTable"
import { RoomCategoryFormValues } from "@/validations/roomCategorySchema"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "../EntitySkeleton"
import { getIndianFormattedDate } from "@/lib/formatIndianDate"

const tabs = ["Active", "Inactive", "All", "Trash"] as const;
type Tab = typeof tabs[number];

export default function RoomCategoryClient() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRoomCategory, setEditingRoomCategory] =
  useState<RoomCategoryFormValues & { _id?: string } | null>(null)

  // 🔑 Fetch all suppliers with SWR
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/room-categories`,
    fetcher
  );
  // ✅ Wrap room categories in useMemo so eslint doesn't complain
    const roomCategories: (RoomCategoryFormValues & { _id: string })[] = useMemo(
      () => data?.data ?? [],
      [data]
    ); // <-- change here
  
  
 

  const handleAdd = () => {
    setEditingRoomCategory(null)
    setSheetOpen(true)
  }

  const handleEdit = (category: RoomCategoryFormValues & { _id: string }) => {
    setEditingRoomCategory(category)
    setSheetOpen(true)
  }

  const handleSave = async (formData: RoomCategoryFormValues & { _id?: string }) => {
    try {
      if (formData._id) {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/room-categories/${formData._id}`,
          "PUT",
          formData
        );
      } else {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/room-categories`,
          "POST",
          formData
        );
      }
      await mutate();
      setSheetOpen(false);
      setEditingRoomCategory(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/room-categories/${id}`,
        "DELETE"
      );
      toast("Room Category has been deleted successfully!", {
              description: getIndianFormattedDate(),
            })
      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: ColumnDef<RoomCategoryFormValues & { _id: string }>[] = [
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
      accessorKey: "hotel.hotelName",
      header: ({ column }) => {
        const sorted = column.getIsSorted()
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(sorted === "asc")}>
            Hotel Name
            {sorted === "asc" && <ArrowUp className="h-4 w-4 ml-2" />}
            {sorted === "desc" && <ArrowDown className="h-4 w-4 ml-2" />}
            {!sorted && <ArrowUpDown className="h-4 w-4 ml-2" />}
          </Button>
        )
      },
    },
    { accessorKey: "roomCategory", header: "Room Category" },
    { accessorKey: "roomType", header: "Room Type" },
    { accessorKey: "status", header: "Status" },
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
                  <span className="font-semibold">{row.original.roomCategory}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(row.original._id)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  const filteredRoomCategories = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return roomCategories.filter((o: RoomCategoryFormValues & { _id?: string }) => o.status === "Active")
      case "Inactive":
        return roomCategories.filter((o: RoomCategoryFormValues & { _id?: string }) => o.status === "Inactive")
      case "Trash":
        return roomCategories.filter((o: RoomCategoryFormValues & { _id?: string }) => o.status === "Trash")
      case "All":
      default:
        return roomCategories
    }
  }, [activeTab, roomCategories])

  // UI
  // ✅ Replaced plain "Loading suppliers..." with EntitySkeleton
  const isLoading = !data && !error;
  if (isLoading) return <EntitySkeleton title="Your Suppliers" />;

  if (error) return <div className="text-red-600">Failed to load room categories.</div>

  return (
    <div className="bg-background text-foreground">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room Categories</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Room Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`pb-2 border-b-2 transition-colors duration-200 cursor-pointer ${
              tab === activeTab
                ? "border-[#035D8A] text-[#035D8A] font-semibold"
                : "border-transparent dark:hover:text-foreground hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable data={filteredRoomCategories} columns={columns} />

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
           <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
          {editingRoomCategory ? "Edit Room Category" : "Add Room Category"}
          </h2>
          </div>

          <AddRoomCategoryForm defaultValues={editingRoomCategory || undefined} onSave={handleSave} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
