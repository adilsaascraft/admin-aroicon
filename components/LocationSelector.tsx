"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { countries, states, cities } from "@/data/locationData"
// Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Form
import {
  FormControl,
} from "@/components/ui/form"


type LocationSelectorProps = {
  form: UseFormReturn<any>
  countryName?: string
  stateName?: string
  cityName?: string
  className?: string
}

export function LocationSelector({
  form,
  countryName = "country",
  stateName = "state",
  cityName = "city",
  className,
}: LocationSelectorProps) {

  const countryValue = form.watch(countryName)
  const stateValue = form.watch(stateName)

  // Reset state + city when country changes
React.useEffect(() => {
  form.setValue(stateName, "")
  form.setValue(cityName, "")
}, [countryValue, form, stateName, cityName])

// Reset city when state changes
React.useEffect(() => {
  form.setValue(cityName, "")
}, [stateValue, form, cityName])


  return (
    <>
      {/* Country */}
<FormField
  control={form.control}
  name={countryName}
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Country *</FormLabel>
      <Select
        onValueChange={(val) => {
          field.onChange(val)
          form.setValue(stateName, "") // reset state when country changes
          form.setValue(cityName, "") // reset city when country changes
        }}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger className="w-full p-3">
            <SelectValue placeholder="Select Country..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

<div className={cn("grid gap-6 sm:grid-cols-2", className)}>
  {/* State */}
  <FormField
    control={form.control}
    name={stateName}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>State *</FormLabel>
        <Select
          onValueChange={(val) => {
            field.onChange(val)
            form.setValue(cityName, "") // reset city when state changes
          }}
          defaultValue={field.value}
          disabled={!countryValue}
        >
          <FormControl>
            <SelectTrigger className="w-full p-3">
              <SelectValue placeholder="Select State..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {states[countryValue]?.map((s) => (
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

  {/* City */}
  <FormField
    control={form.control}
    name={cityName}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>City *</FormLabel>
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          disabled={!stateValue}
        >
          <FormControl>
            <SelectTrigger className="w-full p-3">
              <SelectValue placeholder="Select City..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {cities[stateValue]?.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

    </>
  )
}
