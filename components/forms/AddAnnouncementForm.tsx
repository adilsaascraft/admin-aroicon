'use client';

import { useEffect, useState } from 'react';
import { AnnouncementFormSchema, AnnouncementFormValues } from '@/validations/announcementSchema';
import { zodResolver, useForm, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/lib/imports';
import { Button, SheetClose, toast } from '@/lib/imports';
import { FaHeading, FaUser } from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";
import { Textarea } from '@/components/ui/textarea';
import { mutate } from 'swr';
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from '@/lib/formatIndianDate';

type AddAnnouncementFormProps = {
  onSuccess?: () => void;
  mode?: 'add' | 'edit';
  announcement?: {
    _id: string;
    heading: string;
    description: string;
    postedBy: string;
  };
};

export default function AddAnnouncementForm({ onSuccess, mode = 'add', announcement }: AddAnnouncementFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: {
      heading: '',
      description: '',
      postedBy: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && announcement) {
      form.reset({
        heading: announcement.heading,
        description: announcement.description,
        postedBy: announcement.postedBy,
      });
    }
  }, [mode, announcement, form]);

  async function onSubmit(data: AnnouncementFormValues) {
    try {
      setLoading(true);

      let res;
      if (mode === 'edit' && announcement?._id) {
        // ✅ EDIT (PUT)
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/${announcement._id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );
      } else {
        // ✅ CREATE (POST)
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Request failed');

      if (mode === "edit") {
              toast("Announcement has been updated successfully!", {
                  description: getIndianFormattedDate(),
                })
            } else {
              toast("Announcement has been created successfully!", {
                  description: getIndianFormattedDate(),
                })
            }

      // ✅ SWR cache key for list page
      const SWR_KEY = `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`;

      mutate(
        SWR_KEY,
        (cachedData: any) => {
          const existing = cachedData?.data || [];
          if (mode === 'edit') {
            return {
              ...cachedData,
              data: existing.map(
                (a: { _id: string }) =>
                  a._id === announcement?._id ? { ...a, ...data } : a
              ),
            };
          } else {
            return { ...cachedData, data: [result.data, ...existing] };
          }
        },
        false
      );

      form.reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong ❌');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {mode === 'edit' ? 'Update Announcement' : 'Add Announcement'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
  id="announcement-form"
  onSubmit={form.handleSubmit(onSubmit)}
  className="w-full p-3 mb-16 space-y-6"
>
  <FormField
    control={form.control}
    name="heading"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Heading *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type a heading name" icon={<FaHeading />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Description *</FormLabel>
        <FormControl>
          <Textarea {...field} className="h-[300px] resize-none" placeholder="Write a detailed description" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="postedBy"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Posted By *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Your name or role" icon={<FaUser />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</form>
        </Form>
      </div>

      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button variant="outline" disabled={loading}>
            Close
          </Button>
        </SheetClose>
        <Button
          type="submit"
          form="announcement-form"
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update Announcement'
            : 'Make Announcement'}
        </Button>
      </div>
    </div>
  );
}
