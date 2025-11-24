"use client"

import { useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import HotelCard from "@/components/HotelCard"
import HotelCardSkeleton from "@/components/HotelCardSkeleton"
import AddHotelForm from "@/components/forms/AddHotelForm"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FaSearch } from "react-icons/fa"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

export type Hotel = {
  _id: string
  hotelName: string
  hotelAddress: string
  hotelImage?: string
  country: string
  state: string
  city: string
  hotelCategory: string
  status: string
  googleMapLink?: string
  distanceFromAirport?: string
  distanceFromRailwayStation?: string
  nearestMetroStation?: string
  updatedAt: string
}

type Props = {
  initialHotels: Hotel[]
}

const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error("Failed to fetch hotels")
  return res.json()
}

export default function HotelPageClient({ initialHotels }: Props) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/hotels`

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Hotel[] }>(
    API_URL,
    fetcher,
    {
      fallbackData: { success: true, data: initialHotels },
      revalidateOnFocus: false,
    }
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("Active")
  const [currentPage, setCurrentPage] = useState(1)

  const tabs = ["Active", "Inactive", "All", "Trash"]
  const itemsPerPage = 10

  const hotels: Hotel[] = data?.data || []

  // --- Filtering ---
  const filteredByTab =
    activeTab === "All" ? hotels : hotels.filter((hotel) => hotel.status === activeTab)

  const filteredHotels = filteredByTab.filter((hotel) =>
    hotel.hotelName.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage)

  const refreshHotels = async () => {
    await mutate()
  }

  return (
    <div className="p-4 bg-background text-foreground">
      {/* Header with Sheet */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Hotels</h1>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="bg-sky-800 hover:bg-sky-900 text-white cursor-pointer"
              onClick={() => setSheetOpen(true)}
            >
              + Add Hotel
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[500px] sm:w-[600px]">
            <AddHotelForm
              onSuccess={() => {
                setSheetOpen(false)
                refreshHotels()
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setCurrentPage(1)
            }}
            className={`pb-2 border-b-2 transition-colors duration-200 cursor-pointer ${
              tab === activeTab
                ? "border-[#035D8A] text-[#035D8A] font-semibold"
                : "border-transparent dark:hover:text-foreground hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-[400px] mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search hotels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-100 transition-colors duration-200"
        />
      </div>

      {/* Hotel List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <HotelCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <p className="p-4 text-red-500">Failed to load hotels.</p>
      ) : filteredHotels.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginatedHotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} onRefresh={refreshHotels} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[30vh] w-full border border-gray-300 p-4 rounded">
          <div className="text-center">
            <Image
              src="https://res.cloudinary.com/dr5kn8993/image/upload/v1752307409/AIG_Event_Software/icons/not-found.png"
              alt="Not Found Icon"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-base text-gray-600">
              We could not find anything matching your search criteria.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded transition-colors duration-200 ${
                currentPage === i + 1
                  ? "bg-[#035D8A] text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
