"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import EntitySkeleton from "../EntitySkeleton";
import AddPaymentGatewayForm from "@/components/forms/AddPaymentGatewayForm";
import { toast } from "sonner";

// ✅ Mock payment gateway names
const mockPaymentGateways = [
  "Razorpay",
  "Instamojo",
  "Cashfree",
  "PayU",
  "Paytm",
  "PhonePe",
];

type PaymentGatewayRow = {
  eventName: string;
  eventType: string;
  paymentGateway: string;
};

const fetcher = (url: string) =>
  fetchWithAuth(url, { cache: "no-store" }).then((res) => res.json());

export default function PaymentGatewayClient() {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
    fetcher
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  // ✅ Build mock data combining events + gateways
  const paymentGateways: PaymentGatewayRow[] =
    data?.data
      ?.flatMap((event: any) =>
        mockPaymentGateways.map((gateway) => ({
          eventName: event.eventName,
          eventType: event.eventType,
          paymentGateway: gateway,
        }))
      ) || [];

  // ✅ Table columns
  const columns: ColumnDef<PaymentGatewayRow>[] = [
    { accessorKey: "eventName", header: "Event Name" },
    { accessorKey: "eventType", header: "Event Type" },
    { accessorKey: "paymentGateway", header: "Payment Gateway" },
  ];

  const handleAdd = () => {
    setSheetOpen(true);
  };

  const handleSave = () => {
    setSheetOpen(false);
    toast.success("Payment Gateway added successfully!");
  };

  if (isLoading) return <EntitySkeleton title="Your Payment Gateway" />;
  if (error)
    return (
      <p className="text-red-500 p-4">
        Failed to load events for payment gateway list.
      </p>
    );

  return (
    <div className="bg-background text-foreground">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Event Payment Gateway</h1>
        <Button
          onClick={handleAdd}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          + Add Payment Gateway
        </Button>
      </div>

      {/* ✅ DataTable */}
      <DataTable data={paymentGateways} columns={columns} />

      {/* ✅ Add/Edit Form in Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Add Payment Gateway</h2>
          </div>

          <AddPaymentGatewayForm onSave={handleSave} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
