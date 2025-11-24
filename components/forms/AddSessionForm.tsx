"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SessionSchema, SessionValues } from "@/validations/sessionSchema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

import { CustomDatePicker, CustomTimePicker, toast } from "@/lib/imports";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type AddSessionFormProps = {
  defaultValues?: SessionValues & { _id?: string };
  onSave: (formData: SessionValues & { _id?: string }) => Promise<void>;
};

export default function AddSessionForm({ defaultValues, onSave }: AddSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const form = useForm<SessionValues>({
    resolver: zodResolver(SessionSchema),
    defaultValues: defaultValues || {
      facultyName: "",
      sessionTopicName: "",
      sessionDate: "",
      sessionStartTime: "",
      sessionEndTime: "",
    },
  });

  // Load faculty dropdown
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty`);
        const data = await res.json();
        setFacultyList(data.data ?? []);
      } catch (error) {
        console.error("Failed to load session", error);
      }
    };
    loadFaculty();
  }, []);

  // Submit Handler
  async function onSubmit(data: SessionValues & { _id?: string }) {
    try {
      setLoading(true);
      await onSave(data);

      toast.success(
        defaultValues?._id ? "Session updated!" : "Session added!",
        { description: getIndianFormattedDate() }
      );

      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="add-hotel-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-3"
          >
            {/* Faculty Dropdown */}
            <FormField
              control={form.control}
              name="facultyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select faculty" />
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

            {/* Hotel Name */}
            <FormField
              control={form.control}
              name="sessionTopicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Topic Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter session topic name"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check-in Date & Time */}
                <CustomDatePicker name="sessionDate" label="Session Date *" />
                <CustomTimePicker name="sessionStartTime" label="Session Start Time *" />
                <CustomTimePicker name="sessionEndTime" label="Session End Time *" />
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between bg-background">
        <SheetClose asChild>
          <Button variant="outline" className="border" disabled={loading}>
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="add-hotel-form"
          disabled={loading}
          className="bg-orange-500 text-white hover:bg-orange-600"
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
