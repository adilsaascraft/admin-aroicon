"use client";

import React, { useState, useEffect } from "react";
import { AssignFormSchema, AssignFormValues } from "@/validations/assignSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Button, items } from "@/lib/imports"; // adjust if you have custom import path

type AddAssignFormProps = {
  defaultValues?: {
    _id: string;
    eventId?: string;
    eventAdminId?: string;
    eventIds?: { _id: string; eventName: string }[];
    team?: { _id: string; name: string };
    items: string[];
  };
  onSave: (savedAssign: any) => void;
};

export default function AddAssignForm({
  defaultValues,
  onSave,
}: AddAssignFormProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(AssignFormSchema),
    defaultValues: {
      eventId: "",
      eventAdminId: "",
      items: [],
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [eventRes, teamRes] = await Promise.all([
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/events`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`),
        ]);

        if (!eventRes.ok || !teamRes.ok)
          throw new Error("Failed to load dropdown data");

        const [eventJson, teamJson] = await Promise.all([
          eventRes.json(),
          teamRes.json(),
        ]);

        setEvents(eventJson.data || []);
        setTeams(teamJson.data || []);

        // ✅ Reset after fetching, ensure dropdown shows correct labels
        if (defaultValues) {
          form.reset({
            eventId:
              defaultValues.eventId ||
              defaultValues?.eventIds?.[0]?._id ||
              "",
            eventAdminId:
              defaultValues.eventAdminId || defaultValues?.team?._id || "",
            items: defaultValues.items || [],
          });
        }
      } catch (error) {
        console.error("Dropdown fetch error:", error);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, [defaultValues, form]);

  async function onSubmit(data: AssignFormValues) {
    try {
      setLoading(true);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign`;
      let method: "POST" | "PUT" = "POST";
      let body: any = {};

      if (defaultValues?._id) {
        // PUT request for edit
        method = "PUT";
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign/${defaultValues._id}`;
        body = {
          oldEventId:
            defaultValues.eventId ||
            defaultValues?.eventIds?.[0]?._id ||
            "",
          oldEventAdminId: defaultValues.eventAdminId || "",
          newEventId: data.eventId,
          newEventAdminId: data.eventAdminId,
          items: data.items,
        };
      } else {
        // POST request for new assignment
        body = {
          eventId: data.eventId,
          eventAdminId: data.eventAdminId,
          items: data.items,
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
          ? "Assigned event updated successfully!"
          : "Event assigned successfully!",
        { description: getIndianFormattedDate() }
      );

      onSave(result.data);
      form.reset({ eventId: "", eventAdminId: "", items: [] });
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white rounded-md">
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
                      (selected?.eventName || "");
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

            {/* Team Dropdown */}
            <FormField
              control={form.control}
              name="eventAdminId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Select Team Member *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select team">
                        {teams.find((t) => t._id === field.value)?.name ||
                          "Select team"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team._id} value={team._id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Checkboxes */}
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">All Modules *</FormLabel>
                    <FormDescription>
                      Select the module(s) you want to give access to{" "} <span className="text-sky-800 hover:text-sky-900 font-bold">Event Manager</span>{" "}.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="items"
                        render={({ field }) => (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-2 border border-gray-200 p-2 rounded-md hover:bg-gray-50 transition"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (v) => v !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* ✅ Fully fixed footer at bottom */}
      <div className="mt-auto sticky bottom-0 left-0 right-0 border-t bg-white px-6 py-4 flex justify-between">
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
