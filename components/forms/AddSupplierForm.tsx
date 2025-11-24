'use client'

import React, { useState } from 'react'
import { SupplierFormSchema, SupplierFormValues } from '@/validations/supplierSchema'
import { FaUser, FaEnvelope, FaPhone, FaTruck, FaServicestack} from "react-icons/fa";
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
} from '@/lib/imports'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetClose,
  toast,
  status,
} from '@/lib/imports'
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { getIndianFormattedDate } from '@/lib/formatIndianDate';

type AddSupplierFormProps = {
  defaultValues?: SupplierFormValues & { _id?: string }
  onSave: (formData: SupplierFormValues & { _id?: string }) => Promise<void>
  onSuccess?: () => void
}

export default function AddSupplierForm({ defaultValues, onSave}: AddSupplierFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: defaultValues || {
      supplierName: '',
      services: '',
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonMobile: '',
      status: 'Active',
    },
  })

  async function onSubmit(data: SupplierFormValues & { _id?: string }) {
    try {
      setLoading(true)
      
          let res
          if (defaultValues?._id) {
            // Edit mode
            res = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/suppliers/${defaultValues._id}`,
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
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/suppliers`,
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
          if (!res.ok) throw new Error(result.message || "Failed to save supplier")
      
          if (defaultValues?._id) {
          toast("Supplier has been updated successfully!", {
              description: getIndianFormattedDate(),
            })
        } else {
          toast("Supplier has been created successfully!", {
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
            id="add-supplier-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pr-3 pl-3"
          >
            {/* Supplier Name */}
            <FormField
              control={form.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type supplier name" icon={<FaTruck />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Services */}
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services *</FormLabel>
                  <FormControl>
          <InputWithIcon {...field} placeholder="Type services offered" icon={<FaServicestack />} />
        </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person Name */}
            <FormField
    control={form.control}
    name="contactPersonName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Name *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type contact person name" icon={<FaUser />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="contactPersonEmail"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Email *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type contact person email address" icon={<FaEnvelope />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="contactPersonMobile"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Mobile Number *</FormLabel>
        <FormControl>
          <InputWithIcon
            {...field}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="Type contact person mobile number"
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Status</FormLabel>
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
          form="add-supplier-form"
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
  )
}
