"use client";
import React, { useState, useEffect } from "react";
import { HotelFormSchema, HotelFormValues } from "@/validations/hotelSchema";
import {FaBus,FaHotel, FaMap, FaMapMarker, FaPlane, FaTrain} from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";
import {
  zodResolver,
  useForm,
  toast,
  SheetClose,
  Button,
  LocationSelector,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  status,
} from "@/lib/imports";
import { hotelCategory } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { mutate } from "swr";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

interface AddHotelFormProps {
  onSuccess: () => void;
  mode?: "add" | "edit";
  hotel?: any; // type later if needed
}

export default function AddHotelForm({ onSuccess, mode = "add", hotel }: AddHotelFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(HotelFormSchema),
    defaultValues: {
      hotelName: "",
      hotelAddress: "",
      hotelImage: "",
      country: "",
      state: "",
      city: "",
      hotelCategory: "",
      status: "Active",
      googleMapLink: "",
      distanceFromAirport: "",
      distanceFromRailwayStation: "",
      nearestMetroStation: "",
    },
  });

  // ✅ Reset values in edit mode
  useEffect(() => {
    if (mode === "edit" && hotel) {
      form.reset({
        hotelName: hotel.hotelName || "",
        hotelAddress: hotel.hotelAddress || "",
        hotelImage: undefined, // don't prefill file input
        country: hotel.country || "",
        state: hotel.state || "",
        city: hotel.city || "",
        hotelCategory: hotel.hotelCategory || "",
        status: hotel.status || "",
        googleMapLink: hotel.googleMapLink || "",
        distanceFromAirport: hotel.distanceFromAirport || "",
        distanceFromRailwayStation: hotel.distanceFromRailwayStation || "",
        nearestMetroStation: hotel.nearestMetroStation || "",
      });
    }
  }, [mode, hotel, form]);

  async function onSubmit(data: HotelFormValues) {
    try {
      setLoading(true);
      const formData = new FormData();

      // append all fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (key === "hotelImage" && value instanceof FileList) {
            formData.append("hotelImage", value[0]); // must match backend field
          } else {
            formData.append(key, value as string);
          }
        }
      });

      let res;
      if (mode === "edit" && hotel?._id) {
        // ✅ EDIT (PUT)
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hotels/${hotel._id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // ✅ CREATE (POST)
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hotels`,
          {
            method: "POST",
            body: formData,
          }
        );
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Something went wrong");

      if (mode === "edit") {
  toast("Hotel has been updated successfully!", {
      description: getIndianFormattedDate(),
    })
} else {
  toast("Hotel has been created successfully!", {
      description: getIndianFormattedDate(),
    })
}

      // ✅ Update SWR cache for hotels list
      const SWR_KEY = `${process.env.NEXT_PUBLIC_API_URL}/api/hotels`;
      mutate(
        SWR_KEY,
        (cached: any) => {
          const existing = cached?.data || [];
          if (mode === "edit") {
            return {
              ...cached,
              data: existing.map((h: any) =>
                h._id === hotel?._id ? { ...h, ...result.data } : h
              ),
            };
          } else {
            return { ...cached, data: [result.data, ...existing] };
          }
        },
        false
      );

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save hotel ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {mode === "edit" ? "Edit Hotel" : "Add Hotel"}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="hotel-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full p-3 mb-16 space-y-6"
          >
            {/* Hotel Name */}
            <FormField
              control={form.control}
              name="hotelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name *</FormLabel>
          <FormControl>
          <InputWithIcon {...field} placeholder="Type hotel name" icon={<FaHotel />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hotel Address */}
            <FormField
              control={form.control}
              name="hotelAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Address *</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type hotel address" icon={<FaMapMarker />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hotel Upload Image */}
            <FormField
              control={form.control}
              name="hotelImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Image *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files as FileList)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LocationSelector form={form} />

            {/* Hotel Category + Status */}
            <div className="grid gap-6 sm:grid-cols-2 w-full">
              {/* Hotel Category */}
              <FormField
                control={form.control}
                name="hotelCategory"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hotel Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-3">
                          <SelectValue placeholder="Select hotel category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hotelCategory.map((hotel) => (
                          <SelectItem key={hotel.value} value={hotel.value}>
                            {hotel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>

            {/* Google Maps + Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <FormField
                control={form.control}
                name="googleMapLink"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Google map link *</FormLabel>
                    <FormControl>
          <InputWithIcon {...field} placeholder="Type google map link" icon={<FaMap />} />
        </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distanceFromAirport"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Distance from airport * (KM)</FormLabel>
                    <FormControl>
          <InputWithIcon {...field} placeholder="Type distance from airport" icon={<FaPlane />} />
        </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Distance Railway + Metro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <FormField
                control={form.control}
                name="distanceFromRailwayStation"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Distance from railway station * (KM)</FormLabel>
                    <FormControl>
          <InputWithIcon {...field} placeholder="Type distance from railway station" icon={<FaTrain />} />
        </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nearestMetroStation"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Distance from metro station * (KM)</FormLabel>
                    <FormControl>
          <InputWithIcon {...field} placeholder="Type distance from metro station" icon={<FaBus />} />
        </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button type="button" variant="outline" className="border border-gray-400">
            Close
          </Button>
        </SheetClose>
        <Button
        type="submit"
        form="hotel-form"
        disabled={loading}
        className="bg-sky-800 text-white hover:bg-sky-900"
      >
        {loading ? (mode === "edit" ? "Updating..." : "Creating...") : mode === "edit" ? "Update" : "Create"}
      </Button>
      </div>
    </div>
  );
}
