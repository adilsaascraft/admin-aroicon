"use client";

import React, { useState, useEffect } from "react";
import { AssignFormSchema, AssignFormValues } from "@/validations/assignSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetClose } from "@/components/ui/sheet";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";
import { Button} from "@/lib/imports";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  DollarSign,
  Building,
} from "lucide-react";

type AddAssignFormProps = {
  defaultValues?: {
    _id: string;
    eventId?: string;
    eventIds?: { _id: string; eventName: string }[];
    items: string[];
  };
  onSave: (savedAssign: any) => void;
};

export default function AddAssignForm({
  defaultValues,
  onSave,
}: AddAssignFormProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState<string>("");
  const [razorOption, setRazorOption] = useState<string>("");

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(AssignFormSchema),
    defaultValues: {
      eventId: "",
      items: [],
    },
  });

  // Map gateways to icons
  const gatewayIcons: Record<string, React.ReactNode> = {
    razorpay: <CreditCard className="w-5 h-5 text-sky-600" />,
    instamojo: <Wallet className="w-5 h-5 text-pink-600" />,
    cashfree: <Banknote className="w-5 h-5 text-green-600" />,
    payu: <Building className="w-5 h-5 text-yellow-600" />,
    paytm: <Smartphone className="w-5 h-5 text-blue-600" />,
    phonepe: <DollarSign className="w-5 h-5 text-purple-600" />,
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventRes = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events`
        );

        if (!eventRes.ok) throw new Error("Failed to load events");
        const eventJson = await eventRes.json();

        setEvents(eventJson.data || []);

        // ✅ Pre-fill when editing
        if (defaultValues) {
          const selectedEventId =
            defaultValues.eventId || defaultValues?.eventIds?.[0]?._id || "";
          const selectedEvent =
            eventJson.data.find((e: any) => e._id === selectedEventId) || null;

          form.reset({
            eventId: selectedEventId,
            items: defaultValues.items || [],
          });

          if (selectedEvent) setEventName(selectedEvent.eventName);
        }
      } catch (error) {
        console.error("Dropdown fetch error:", error);
        toast.error("Failed to load event list");
      }
    };

    fetchEvents();
  }, [defaultValues, form]);

  async function onSubmit(data: AssignFormValues) {
    try {
      setLoading(true);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign`;
      let method: "POST" | "PUT" = "POST";
      let body: any = {};

      const selectedPayment =
        data.items[0] === "razorpay" && razorOption
          ? `${data.items[0]}-${razorOption}`
          : data.items[0];

      if (defaultValues?._id) {
        method = "PUT";
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign/${defaultValues._id}`;
        body = {
          oldEventId:
            defaultValues.eventId ||
            defaultValues?.eventIds?.[0]?._id ||
            "",
          newEventId: data.eventId,
          items: [selectedPayment],
        };
      } else {
        body = {
          eventId: data.eventId,
          items: [selectedPayment],
        };
      }

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || result.message || "Save failed");

      toast.success(
        defaultValues?._id
          ? "Payment Gateway updated successfully!"
          : "Payment Gateway added successfully!",
        { description: getIndianFormattedDate() }
      );

      onSave(result.data);
      form.reset({ eventId: "", items: [] });
      setRazorOption("");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const selectedEventName =
    events.find((e) => e._id === form.watch("eventId"))?.eventName ||
    eventName ||
    "selected event";

  const selectedPayment = form.watch("items")[0];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background rounded-md">
      {/* ✅ Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scroll">
        <Form {...form}>
          <form className="space-y-4">
            {/* Event Dropdown */}
        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Select Event *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const selected = events.find((e) => e._id === value);
                  setEventName(selected?.eventName || "");
                }}
                value={field.value}
              >
                <SelectTrigger className="w-full p-3">
                  <SelectValue placeholder="Select event">
                    <span className="block truncate max-w-[300px]">
                      {events.find((e) => e._id === field.value)?.eventName ||
                        "Select event"}
                    </span>
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {/* Truncate inside dropdown */}
                      <span className="block truncate max-w-[300px]">
                        {event.eventName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


            {/* Payment Gateway Radio Buttons */}
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Payment Gateway *</FormLabel>
                    <FormDescription>
                      Select the payment gateway for{" "}
                      <span className="text-sky-800 font-bold">
                        {selectedEventName}
                      </span>.
                    </FormDescription>
                  </div>

                  <FormControl>
                    <RadioGroup
                      value={field.value[0] || ""}
                      onValueChange={(value) => field.onChange([value])}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {[
                        { id: "razorpay", label: "Razorpay" },
                        { id: "instamojo", label: "Instamojo" },
                        { id: "cashfree", label: "Cashfree" },
                        { id: "payu", label: "PayU" },
                        { id: "paytm", label: "Paytm" },
                        { id: "phonepe", label: "PhonePe" },
                      ].map((item) => {
                        const isSelected = field.value.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            htmlFor={item.id}
                            className={cn(
                              "flex items-center justify-between rounded-lg border p-4 cursor-pointer transition select-none",
                              isSelected
                                ? "border-sky-600 bg-sky-50 shadow-sm"
                                : "border-gray-300 hover:border-sky-400"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {gatewayIcons[item.id]}
                              <span className="font-medium text-gray-800">
                                {item.label}
                              </span>
                            </div>
                            <RadioGroupItem id={item.id} value={item.id} />
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>

                  {/* ✅ Conditional Razorpay MMID Dropdown */}
                  {selectedPayment === "razorpay" && (
                    <div className="mt-3">
                      <FormLabel className="mb-3">Select Razor Pay MMID *</FormLabel>
                      <Select
                        onValueChange={(value) => setRazorOption(value)}
                        value={razorOption}
                      >
                        <SelectTrigger className="w-full p-3">
                          <SelectValue  placeholder="Select Razorpay MMID" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mmid1">
                            Razor Pay with MMID 1
                          </SelectItem>
                          <SelectItem value="mmid2">
                            Razor Pay with MMID 2
                          </SelectItem>
                          <SelectItem value="mmid3">
                            Razor Pay with MMID 3
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* ✅ Fixed footer */}
      <div className="mt-auto sticky bottom-0 left-0 right-0 border-t bg-background px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="border border-gray-400"
          >
            Close
          </Button>
        </SheetClose>
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading ? "Saving..." : defaultValues ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
