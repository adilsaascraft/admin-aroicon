"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

type Tab = {
  label: string
  value: string
}

type TabsProps = {
  tabs: Tab[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export function Tabs({ tabs, defaultValue, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0]?.value)

  const handleClick = (value: string) => {
    setActive(value)
    onChange?.(value)
  }

  return (
    <div className={cn("flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleClick(tab.value)}
          className={cn(
            "pb-2 border-b-2 transition-colors duration-200 cursor-pointer",
            active === tab.value
              ? "border-[#035D8A] text-[#035D8A] font-semibold"
              : "border-transparent hover:text-black"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
