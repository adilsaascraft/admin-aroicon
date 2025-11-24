"use client";

import React, { useEffect, useState } from "react";
import { FacultySchema, FacultyValues } from "@/validations/facultySchema";
import { z } from "zod";

import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";

import {
  zodResolver,
  useForm,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/lib/imports";

import {
  Button,
  SheetClose,
  toast,
} from "@/lib/imports";

import { getIndianFormattedDate } from "@/lib/formatIndianDate";

// ----------------------------------------------------

type AddFacultyFormProps = {
  defaultValues?: Partial<FacultyValues & { _id?: string }>;
  onSave: (entry: FacultyValues & { _id: string }) => void;
};

// ----------------------------------------------------

export default function AddFacultyForm({
  defaultValues,
  onSave,
}: AddFacultyFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FacultyValues>({
    resolver: zodResolver(FacultySchema),
    defaultValues: {
      facultyName: "",
      email: "",
      mobile: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // ----------------------------------------------------

  async function onSubmit(data: z.infer<typeof FacultySchema>) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let res;

      if (defaultValues?._id) {
        // Edit
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty/${defaultValues._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
      } else {
        // Add
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
      }

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to save faculty");

      toast.success(
        defaultValues?._id
          ? "Faculty updated successfully!"
          : "Faculty created successfully!",
        {
          description: getIndianFormattedDate(),
        }
      );

      onSave?.(result.data);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="faculty-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-3"
          >
            {/* Faculty Name */}
            <FormField
              control={form.control}
              name="facultyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Name *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Enter faculty name"
                      icon={<FaUser />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Enter email"
                      icon={<FaEnvelope />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile */}
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      type="text"
                      maxLength={15}
                      inputMode="numeric"
                      placeholder="Enter faculty mobile number"
                      icon={<FaPhone />}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/\D/g, "").slice(0, 15);
                      }}
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
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between bg-background">
        <SheetClose asChild>
          <Button variant="outline" className="border border-gray-400" disabled={loading}>
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="faculty-form"
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
