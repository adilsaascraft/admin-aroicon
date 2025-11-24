"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast, SheetClose, LocationSelector } from "@/lib/imports"
import {FaBuilding, FaBus,FaGlobe,FaMap, FaMapMarker, FaPlane, FaTrain} from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  status,
} from "@/lib/imports"
import { VenueFormSchema, VenueFormValues } from "@/validations/venueSchema"
import { mutate } from "swr"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { Venue } from "@/components/clients/VenuePageClient"
import { getIndianFormattedDate } from "@/lib/formatIndianDate"

interface AddVenueFormProps {
  onSuccess: () => void
  mode?: "add" | "edit"
  venue?: Venue
}

export default function AddVenueForm({
  onSuccess,
  mode = "add",
  venue,
}: AddVenueFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(VenueFormSchema),
    defaultValues: venue
      ? { ...venue, venueImage: undefined }
      : {
          venueName: "",
          venueAddress: "",
          venueImage: undefined,
          country: "",
          state: "",
          city: "",
          website: "",
          status: "Active",
          googleMapLink: "",
          distanceFromAirport: "",
          distanceFromRailwayStation: "",
          nearestMetroStation: "",
        },
  })

  useEffect(() => {
    if (mode === "edit" && venue) {
      form.reset({
        ...venue,
        venueImage: undefined,
      })
    }
  }, [mode, venue, form])

  const onSubmit = async (data: VenueFormValues) => {
    try {
      setLoading(true)
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (key === "venueImage" && value instanceof FileList) {
            formData.append("venueImage", value[0])
          } else {
            formData.append(key, value as string)
          }
        }
      })

      let res: Response
      if (mode === "edit" && venue?._id) {
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/venues/${venue._id}`,
          { method: "PUT", body: formData }
        )
      } else {
        res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/venues`,
          { method: "POST", body: formData }
        )
      }

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Something went wrong")

      if (mode === "edit") {
        toast("Venue has been updated successfully!", {
            description: getIndianFormattedDate(),
          })
      } else {
        toast("Venue has been created successfully!", {
            description: getIndianFormattedDate(),
          })
      }

      const SWR_KEY = `${process.env.NEXT_PUBLIC_API_URL}/api/venues`
      mutate(
        SWR_KEY,
        (cached: any) => {
          const existing = cached?.data || []
          if (mode === "edit") {
            return {
              ...cached,
              data: existing.map((v: Venue) =>
                v._id === venue?._id ? { ...v, ...result.data } : v
              ),
            }
          } else {
            return { ...cached, data: [result.data, ...existing] }
          }
        },
        false
      )

      form.reset()
      onSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to save venue ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {mode === "edit" ? "Edit Venue" : "Add Venue"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full p-3 mb-16 space-y-6"
          >
            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type venue name" icon={<FaBuilding />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venueAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Address</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type venue address" icon={<FaMapMarker />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venueImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files as FileList)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LocationSelector form={form} />
            <div className="grid gap-6 sm:grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type website url" icon={<FaGlobe />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
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
            <div className="grid gap-6 sm:grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="googleMapLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Map Link</FormLabel>
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
                <FormItem>
                  <FormLabel>Distance from Airport * (KM)</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type distance from airport" icon={<FaPlane />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="distanceFromRailwayStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance from Railway Station* (KM)</FormLabel>
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
                <FormItem>
                  <FormLabel>Distance from Metro Station * (KM)</FormLabel>
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

      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button type="button" variant="outline">
            Close
          </Button>
        </SheetClose>
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  )
}
