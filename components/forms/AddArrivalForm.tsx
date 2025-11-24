"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ArrivalSchema,
  ArrivalValues,
} from "@/validations/arrivalSchema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { CustomDatePicker, CustomTimePicker, toast } from "@/lib/imports";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { SheetClose } from "@/components/ui/sheet";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

interface AddArrivalFormProps {
  defaultValues?: ArrivalValues & { _id?: string };
  onSave: (data: ArrivalValues & { _id?: string }) => Promise<void>;
}

export default function AddArrivalForm({
  defaultValues,
  onSave
}: AddArrivalFormProps) {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ArrivalValues>({
    resolver: zodResolver(ArrivalSchema),
    defaultValues: defaultValues || {
      facultyName: "",
      arrivalDate: "",
      arrivalTime: "",
      arrivalFlightDetail: ""
    }
  });

  // -------------------------------
  // 🔥 Fetch Faculty from /faculty
  // -------------------------------
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/faculty`
        );
        const data = await res.json();

        if (data?.success) {
          setFacultyList(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch faculty", err);
      }
    };

    fetchFaculty();
  }, []);

  // -------------------------------
  // 🔥 Submit Handler
  // -------------------------------
  async function onSubmit(data: ArrivalValues & { _id?: string }) {
    try {
      setLoading(true);

      const url = data?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/checkin-details/${data._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/checkin-details`;

      const method = data?._id ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save arrival");

      toast.success(
        data?._id ? "Arrival updated successfully!" : "Arrival added successfully!",
        { description: getIndianFormattedDate() }
      );

      await onSave(result.data);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // 🔥 UI
  // -------------------------------
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll px-3">
        <Form {...form}>
          <form
            id="add-arrival-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* 1) Faculty Dropdown */}
            <FormField
              control={form.control}
              name="facultyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty *</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>

                    <SelectContent>
                      {facultyList.map((faculty) => (
                        <SelectItem key={faculty._id} value={faculty._id}>
                          {faculty.facultyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2) ARRIVAL DATE (Custom Picker) */}
            <CustomDatePicker name="arrivalDate" label="Arrival Date *" />

            {/* 3) ARRIVAL TIME (Custom Time Picker) */}
            <CustomTimePicker name="arrivalTime" label="Arrival Time *" />

            {/* 4) Flight Number */}
            <FormField
              control={form.control}
              name="arrivalFlightDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Number *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter flight number"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t flex justify-between bg-background">
        <SheetClose asChild>
          <Button variant="outline" disabled={loading}>
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="add-arrival-form"
          disabled={loading}
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          {loading
            ? defaultValues?._id
              ? "Updating..."
              : "Creating..."
            : defaultValues?._id
              ? "Update"
              : "Create"}
        </Button>
      </div>
    </div>
  );
}
