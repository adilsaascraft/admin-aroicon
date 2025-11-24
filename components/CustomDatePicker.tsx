// components/CustomDatePicker.tsx
import { Controller, useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useMemo } from "react"

interface Props {
  name: string
  label?: string
}

export const CustomDatePicker = ({ name, label }: Props) => {
  const { control, watch, setValue } = useFormContext()

  const dateValue = watch(name) // e.g., "15/08/2025"

  // Default to today if empty
  useEffect(() => {
    if (!dateValue) {
      const today = new Date()
      const formatted = `${String(today.getDate()).padStart(2, "0")}/${String(
        today.getMonth() + 1
      ).padStart(2, "0")}/${today.getFullYear()}`
      setValue(name, formatted)
    }
  }, [dateValue, name, setValue])

  const parseDate = (date: string) => {
    const [day, month, year] = date.split("/")
    return { day, month, year }
  }

  const handleChange = (type: "day" | "month" | "year", value: string) => {
    let { day, month, year } = parseDate(dateValue || "01/01/2025")

    if (type === "day") day = value
    if (type === "month") month = value
    if (type === "year") year = value

    // Adjust day if it's invalid for the new month/year
    const maxDays = getDaysInMonth(parseInt(month), parseInt(year))
    if (parseInt(day) > maxDays) {
      day = String(maxDays).padStart(2, "0")
    }

    const newDate = `${day}/${month}/${year}`
    setValue(name, newDate)
  }

  // ✅ Get days based on month + year (handles leap years)
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate()
  }

  // Months with names
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 2050 - currentYear + 1 }, (_, i) =>
    String(currentYear + i)
  )

  const current = parseDate(dateValue || "01/01/2025")

  const days = useMemo(() => {
    const maxDays = getDaysInMonth(parseInt(current.month), parseInt(current.year))
    return Array.from({ length: maxDays }, (_, i) =>
      String(i + 1).padStart(2, "0")
    )
  }, [current.month, current.year])

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <Label className="px-1">{label}</Label>}
      <div className="flex gap-2">
        {/* Month */}
        <Controller
          name={name}
          control={control}
          render={() => (
            <Select
              onValueChange={(val) => handleChange("month", val)}
              value={current.month}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {/* Day */}
        <Controller
          name={name}
          control={control}
          render={() => (
            <Select
              onValueChange={(val) => handleChange("day", val)}
              value={current.day}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="DD" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {/* Year */}
        <Controller
          name={name}
          control={control}
          render={() => (
            <Select
              onValueChange={(val) => handleChange("year", val)}
              value={current.year}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  )
}
