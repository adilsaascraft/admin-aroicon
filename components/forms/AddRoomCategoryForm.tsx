"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RoomCategoryFormSchema,
  RoomCategoryFormValues,
} from "@/validations/roomCategorySchema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {toast} from "@/lib/imports"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetClose } from "../ui/sheet";
import {status} from '@/lib/imports'
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";


interface AddRoomCategoryFormProps {
 defaultValues?: RoomCategoryFormValues & { _id?: string }
   onSave: (formData: RoomCategoryFormValues & { _id?: string }) => Promise<void>
   onSuccess?: () => void
}

export default function AddRoomCategoryForm({ defaultValues, onSave}: AddRoomCategoryFormProps) {
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(false);

  const form = useForm<RoomCategoryFormValues>({
    resolver: zodResolver(RoomCategoryFormSchema),
    defaultValues: {
      hotel:"",
      roomCategory: "",
      roomType: "",
      status: "Active",
    },
  });

  // Fetch hotels for dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels`);
        const data = await res.json();
        if (data.success) {
          setHotels(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hotels", error);
      }
    };
    fetchHotels();
  }, []);

async function onSubmit(data: RoomCategoryFormValues & { _id?: string }) {
    try {
      setLoading(true)
      
          let res
          if (defaultValues?._id) {
            // Edit mode
            res = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/room-categories/${defaultValues._id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              }
            )
          } else {
            // Add mode
            res = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/room-categories`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data, status: "Active" }),
              }
            )
          }
      
          const result = await res.json()
          if (!res.ok) throw new Error(result.message || "Failed to save room category")
      
          if (defaultValues?._id) {
          toast("Room Category has been updated successfully!", {
              description: getIndianFormattedDate(),
            })
        } else {
          toast("Room Category has been created successfully!", {
              description: getIndianFormattedDate(),
            })
        }
      
          onSave?.(result.data)
          form.reset()
        } catch (err: any) {
          toast.error(err.message || "Something went wrong ❌")
        } finally {
          setLoading(false)
        }
      }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
    <Form {...form}>
      <form
      id="add-category-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pr-3 pl-3"
      >
        {/* Hotel Dropdown */}
        <FormField
          control={form.control}
          name="hotel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel Name *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={loading}
              >
              <SelectTrigger className="w-full p-3">
                  <SelectValue placeholder="Select Hotel" />
              </SelectTrigger>
                
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel._id} value={hotel._id}>
                      {hotel.hotelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Room Category */}
        <FormField
          control={form.control}
          name="roomCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Category *</FormLabel>
              <FormControl>
                <Input placeholder="eg. Delux , Suit, Luxary" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Room Type */}
        <FormField
          control={form.control}
          name="roomType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Type *</FormLabel>
              <FormControl>
                <Input placeholder="eg. AC double bed, Non AC single bed" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full p-3">
                                <SelectValue placeholder="Select status type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {status.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
      </form>
    </Form>
    </div>
    {/* Sticky footer */}
          <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
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
              form="add-category-form"
              disabled={loading}
              className="bg-sky-800 text-white hover:bg-sky-900"
              >
              {loading
              ? defaultValues
              ? 'Updating...'
              : 'Creating...'
              : defaultValues
              ? 'Update'
              : 'Create'}
              </Button>
          </div>
        </div>
  );
};
