"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent} from "@/components/ui/sheet";
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
import AddSupplierForm from "@/components/forms/AddSupplierForm";
import { DataTable } from "@/components/DataTable";
import { SupplierFormValues } from "@/validations/supplierSchema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "@/components/EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

const tabs = ["Active", "Inactive", "All", "Trash"] as const;
type Tab = typeof tabs[number];

export default function SupplierClient() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<(SupplierFormValues & { _id?: string }) | null>(null);

  // 🔑 Fetch all suppliers with SWR
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers`,
    fetcher
  );

  //Wrap suppliers in useMemo
  const suppliers: (SupplierFormValues & { _id: string })[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  // Handlers
  const handleAdd = () => {
    setEditingSupplier(null);
    setSheetOpen(true);
  };

  const handleEdit = (supplier: SupplierFormValues & { _id: string }) => {
    setEditingSupplier(supplier);
    setSheetOpen(true);
  };

  const handleSave = async (formData: SupplierFormValues & { _id?: string }) => {
    try {
      if (formData._id) {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/suppliers/${formData._id}`,
          "PUT",
          formData
        );
      } else {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/suppliers`,
          "POST",
          formData
        );
      }
      await mutate();
      setSheetOpen(false);
      setEditingSupplier(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/suppliers/${id}`,
        "DELETE"
      );
      toast("Supplier has been deleted successfully!", {
              description: getIndianFormattedDate(),
            })
      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Columns
  const columns: ColumnDef<SupplierFormValues & { _id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "supplierName",
      header: sortableHeader("Supplier Name"),
     },
   { accessorKey: "services",
      header: sortableHeader("Services"),
     },
   { accessorKey: "contactPersonName",
      header: sortableHeader("Contact Person Name"),
     },
    { accessorKey: "contactPersonEmail",
      header: sortableHeader("Email"),
     },
    { accessorKey: "contactPersonMobile", header: "Mobile" },
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
                  Permanently delete{" "}
                  <span className="font-semibold">{row.original.supplierName}</span>?
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
  ];

  const filteredSuppliers = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return suppliers.filter((o) => o.status === "Active");
      case "Inactive":
        return suppliers.filter((o) => o.status === "Inactive");
      case "Trash":
        return suppliers.filter((o) => o.status === "Trash");
      default:
        return suppliers;
    }
  }, [activeTab, suppliers]);

  // UI
  // ✅ Replaced plain "Loading suppliers..." with EntitySkeleton
  if (isLoading) return <EntitySkeleton title="Your Suppliers" />;

  if (error) return <div className="p-4 text-red-600">Failed to load suppliers</div>;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Suppliers</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Supplier
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 transition-colors ${
              tab === activeTab
                ? "border-[#035D8A] text-[#035D8A] font-semibold"
                : "border-transparent dark:hover:text-foreground hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable data={filteredSuppliers} columns={columns} />

      {/* Drawer / Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
          {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </h2>
          </div>

          <AddSupplierForm
            defaultValues={editingSupplier || undefined}
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
