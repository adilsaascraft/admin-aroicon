"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Share2, Mail, MessageSquare, FileDown, AlertTriangle } from "lucide-react";
import AddAssignForm from "@/components/forms/AddAssignForm";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type AssignRow = {
  _id: string; // eventAdminId
  eventId: string;
  eventName: string;
  eventType: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  plainPassword: string;
  updatedAt: string;
};

const fetcher = (url: string) =>
  fetchWithAuth(url, { cache: "no-store" }).then((res) => res.json());

export default function AssignClient() {
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assignments`,
    fetcher
  );

  // Flatten API response
  const flattenAssigns = (assignments: any[]): AssignRow[] =>
    (assignments || []).flatMap((a: any) =>
      (a.assignedEvents || []).map((ev: any) => ({
        _id: a._id, // eventAdminId
        eventId: ev._id,
        eventName: ev.eventName,
        eventType: ev.eventType,
        name: a.name,
        email: a.email,
        mobile: a.mobile,
        password: a.password,
        plainPassword: a.plainPassword,
        updatedAt: a.updatedAt,
      }))
    );

  const assigns: AssignRow[] = flattenAssigns(data?.data || []);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState<any | null>(null);
  const [showPassDialog, setShowPassDialog] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<AssignRow | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    setEditingAssign(null);
    setSheetOpen(true);
  };

  // ✅ Correct edit handler
  const handleEdit = (row: AssignRow) => {
    setEditingAssign({
      _id: row._id, // admin id
      eventId: row.eventId,
      eventAdminId: row._id,
      eventName: row.eventName, // for dropdown display
      name: row.name, // for dropdown display
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    setSheetOpen(false);
    setEditingAssign(null);
    await mutate(); // ✅ refresh SWR cache
  };

  const handleDelete = async (row: AssignRow) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign/${row._id}/${row.eventId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete assignment");

      await mutate();
      toast.success("Assigned event has deleted successfully!", {
              description: getIndianFormattedDate(),
            });
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete ❌");
    }
  };

  const buildShareText = (assign: AssignRow) =>
    `📌 Event: ${assign.eventName}\n👤 Event Assigned Persone Name: ${assign.name}\n📧 Email: ${assign.email}\n🔑 Password: ${assign.plainPassword}`;

  const handleDownloadCard = async () => {
    if (!qrRef.current || !selectedAssign) return;
    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${selectedAssign.eventName}-credentials.png`;
      link.click();
      toast.success("Card downloaded as PNG ✅");
    } catch (err) {
      console.error("❌ Error exporting card:", err);
      toast.error("Failed to export card ❌");
    }
  };

  const columns: ColumnDef<AssignRow>[] = [
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
    },
    { accessorKey: "eventName", header: "Event Name" },
    { accessorKey: "eventType", header: "Event Type" },
    { accessorKey: "name", header: "Contact Person Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "mobile", header: "Mobile" },
    {
      id: "password",
      header: "Password",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAssign(row.original);
            setShowPassDialog(true);
          }}
        >
          <Eye className="h-4 w-4 cursor-pointer" />
        </Button>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Assigned Date",
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>Edit</Button>
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
                  This will permanently delete <b>{row.original.eventName}</b>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(row.original)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  if (isLoading) return <EntitySkeleton title="Your Assignments" />;
  if (error) return <div className="text-red-600">Failed to assigned event data.</div>

  return (
    <div className="bg-background text-foreground">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assigned Events</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Assign
        </Button>
      </div>

      <DataTable data={assigns} columns={columns} />

      {/* Edit / Add Form */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
          {editingAssign ? "Edit Assignment" : "Add Assignment"}
          </h2>
          </div>

          <AddAssignForm
            defaultValues={editingAssign || undefined}
            onSave={handleSave}
          />
        </SheetContent>
      </Sheet>

      {/* Password / QR Dialog */}
      <Dialog open={showPassDialog} onOpenChange={setShowPassDialog}>
        <DialogContent className="sm:max-w-md">
          <div
            ref={qrRef}
            className="mt-4 space-y-4 border rounded-lg p-6 bg-background text-foreground shadow-md text-center"
          >
            <h1 className="text-lg font-semibold text-center">
              Here is Event Manager Login Credential
            </h1>
            <Image
              src="/aig-logo.png"
              alt="AIG Logo"
              width={120}
              height={60}
              className="h-[60px] mx-auto w-auto"
            />
            <p className="font-medium ">{selectedAssign?.eventName}</p>
            {selectedAssign && (
              <div className="flex justify-center mt-2">
                <div className="p-2 border-2 border-gray-200 rounded-lg shadow-lg bg-white">
                  <QRCodeCanvas
                    value={`Email: ${selectedAssign.email} | Password: ${selectedAssign.plainPassword}`}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Keep this credential secure. Do not share publicly.
            </p>
          </div>
          {selectedAssign && (
            <div className="flex justify-center mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(buildShareText(selectedAssign))}`,
                        "_blank"
                      )
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedAssign.email}&su=Event Manager Credentials&body=${encodeURIComponent(
                          buildShareText(selectedAssign)
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    <Mail className="h-4 w-4 mr-2" /> Gmail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadCard}>
                    <FileDown className="h-4 w-4 mr-2" /> Download as PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

