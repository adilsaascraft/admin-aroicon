"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PresentationSchema, PresentationValues } from "@/validations/presentationSchema";
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

type AddPresentationFormProps = {
  defaultValues?: PresentationValues & { _id?: string };
  onSave: (formData: PresentationValues & { _id?: string }) => Promise<void>;
};

export default function AddPresentationForm({ defaultValues, onSave }: AddPresentationFormProps) {
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const form = useForm<PresentationValues>({
    resolver: zodResolver(PresentationSchema),
    defaultValues: defaultValues || {
      facultyName: "",
      presentationTopicName: "",
      presentationDate: "",
      presentationStartTime: "",
      presentationEndTime: "",
    },
  });

  // Load faculty dropdown
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await fetchWithAuth(`/api/faculty`);
        const data = await res.json();
        setFacultyList(data.data ?? []);
      } catch (error) {
        console.error("Failed to load faculty list", error);
      }
    };
    loadFaculty();
  }, []);

  // Submit Handler
  async function onSubmit(data: PresentationValues & { _id?: string }) {
    try {
      setLoading(true);
      await onSave(data);

      toast.success(
        defaultValues?._id ? "Presentation updated!" : "Presentation added!",
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
            id="add-presentation-form"
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

            {/* Presentation Topic Name */}
            <FormField
              control={form.control}
              name="presentationTopicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presentation Topic *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter presentation topic"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Presentation Date */}
            <CustomDatePicker name="presentationDate" label="Presentation Date *" />

            {/* Start Time */}
            <CustomTimePicker name="presentationStartTime" label="Start Time *" />

            {/* End Time */}
            <CustomTimePicker name="presentationEndTime" label="End Time *" />
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
          form="add-presentation-form"
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
