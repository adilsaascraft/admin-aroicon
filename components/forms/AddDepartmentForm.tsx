"use client";
import React, { useState , useEffect } from "react";
import { DepartmentFormSchema, DepartmentFormValues } from "@/validations/departmentSchema";
import { z } from 'zod'
import { FaBuilding, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
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
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type AddDepartmentFormProps = {
  defaultValues?: Partial<DepartmentFormValues> // prefill values for Edit mode
  onSave: (entry: DepartmentFormValues & { _id: string }) => void
}

export default function AddDepartmentForm({ defaultValues, onSave }: AddDepartmentFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      departmentName: '',
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonMobile: '',
      status: 'Active',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
    } else {
      form.reset({ ...form.getValues(), status: 'Active' }) // ensure default Active
    }
  }, [defaultValues, form])

  async function onSubmit(data: z.infer<typeof DepartmentFormSchema>) {
  try {
    setLoading(true)

    const token = localStorage.getItem("token") // ✅ read token

    let res
    if (defaultValues?._id) {
      // Edit mode
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/departments/${defaultValues._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send token
          },
          body: JSON.stringify(data),
        }
      )
    } else {
      // Add mode
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send token
          },
          body: JSON.stringify({ ...data, status: "Active" }),
        }
      )
    }

    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Failed to save department")

    if (defaultValues?._id) {
      toast("Department has been updated successfully!", {
          description: getIndianFormattedDate(),
        })
    } else {
      toast("Department has been created successfully!", {
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

<form id="department-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-3 pl-3">
  <FormField
    control={form.control}
    name="departmentName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Department Name *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type department name" icon={<FaBuilding />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

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

  <FormField
    control={form.control}
    name="status"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>Status</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <SelectTrigger className="w-full p-3">
            <SelectValue placeholder="Select status type" />
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
</form>

        </Form>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button type="button" variant="outline" className="border border-gray-400" disabled={loading}>
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="department-form"
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading
            ? defaultValues?._id
              ? 'Updating...'
              : 'Creating...'
            : defaultValues?._id
            ? 'Update'
            : 'Create'}
        </Button>
      </div>
    </div>
  )
}
