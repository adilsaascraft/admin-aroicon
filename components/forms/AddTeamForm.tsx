"use client";

import React, { useState, useEffect } from "react";
import { TeamFormSchema, TeamFormValues } from "@/validations/teamSchema";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";

import {
  zodResolver,
  useForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/imports";

import {
  Button,
  SheetClose,
  toast,
} from "@/lib/imports";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type AddTeamFormProps = {
  defaultValues?: TeamFormValues & { _id?: string };
  onSave: (formData: TeamFormValues & { _id?: string }) => Promise<void>;
};

export default function AddTeamForm({ defaultValues, onSave }: AddTeamFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      mobile: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // -------------------- SUBMIT ------------------------
  async function onSubmit(data: TeamFormValues & { _id?: string }) {
    try {
      setLoading(true);

      const isEdit = Boolean(defaultValues?._id);

      const res = await fetchWithAuth(
        isEdit
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams/${defaultValues?._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save team");

      toast(
        isEdit
          ? "Team updated successfully!"
          : "Team created successfully!",
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

  // -------------------- UI ------------------------
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="add-team-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-3"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder="Enter name"
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
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="Enter 10-digit mobile number"
                      icon={<FaPhone />}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/\D/g, "").slice(0, 10);
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
          <Button
            type="button"
            variant="outline"
            className="border border-gray-400"
            disabled={loading}
          >
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="add-team-form"
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
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
