"use client"

import { useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import { FaSearch } from "react-icons/fa"
import VenueCard from "@/components/VenuesCard"
import AddVenueForm from "@/components/forms/AddVenueForm"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import VenueCardSkeleton from "@/components/VenueCardSkeleton"

export type Venue = {
  _id: string
  venueName: string
  venueAddress: string
  venueImage?: string
  country: string
  state: string
  city: string
  website?: string
  status: string
  googleMapLink?: string
  distanceFromAirport?: string
  distanceFromRailwayStation?: string
  nearestMetroStation?: string
  updatedAt?: string
}

type Props = {
  initialVenues: Venue[]
}

const fetcher = async (url: string) => {
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error("Failed to fetch venues")
  return res.json()
}

export default function VenuePageClient({ initialVenues }: Props) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/venues`

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Venue[] }>(
    API_URL,
    fetcher,
    {
      fallbackData: { success: true, data: initialVenues },
      revalidateOnFocus: false,
    }
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("Active")
  const [currentPage, setCurrentPage] = useState(1)

  const tabs = ["Active", "Inactive", "All"]
  const itemsPerPage = 10
  const venues: Venue[] = data?.data || []

  const filteredByTab =
    activeTab === "All" ? venues : venues.filter((v) => v.status === activeTab)

  const filteredVenues = filteredByTab.filter((v) =>
    v.venueName.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage)

  const refreshVenues = async () => mutate()

  return (
    <div className="p-4 bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Venues</h1>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="bg-sky-800 hover:bg-sky-900 text-white"
              onClick={() => setSheetOpen(true)}
            >
              + Add Venue
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[500px] sm:w-[600px]">
            <AddVenueForm
              onSuccess={() => {
                setSheetOpen(false)
                refreshVenues()
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

      {/* Search */}
      <div className="relative w-full max-w-[400px] mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-100 transition-colors duration-200"
        />
      </div>

      {/* Venue List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="p-4 text-red-500">Failed to load venues.</p>
      ) : filteredVenues.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginatedVenues.map((venue) => (
            <VenueCard key={venue._id} venue={venue} onRefresh={refreshVenues} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[30vh] w-full border border-gray-300 p-4 rounded">
          <div className="text-center">
            <Image
              src="https://res.cloudinary.com/dr5kn8993/image/upload/v1752307409/AIG_Event_Software/icons/not-found.png"
              alt="Not Found"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-base text-gray-600">No venues match your search criteria.</p>
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
