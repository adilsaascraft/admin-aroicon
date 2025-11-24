'use client'

import Image from 'next/image'
import { api } from '@/lib/api'
import { HelpCircle, Mail, Phone } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { mutate as globalMutate } from 'swr'

// ✅ import the new toggle
import ModeToggle from '@/components/ModeToggle'

export default function DashboardNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    try {
      await api("/logout", { method: "POST" })
      localStorage.removeItem("token")
      localStorage.removeItem("selectedEvent")
      globalMutate(() => true, undefined, { revalidate: false })
      setIsLoggedIn(false)
      setLogoutDialogOpen(false)
      router.push("/login")
    } catch (err: any) {
      console.error("Logout failed:", err.message)
      alert(err.message || "Logout failed")
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
<header
  className="
    text-white
bg-gradient-to-r
from-[#FFC085] via-[#FF9F50] to-[#FF7A1F]

dark:from-[#1a1a1a] dark:via-[#222] dark:to-[#444]
shadow-md
sticky top-0 z-50

  "
>
      <div className="max-w-full flex items-center justify-between h-16 px-4 md:px-[30px]">
        {/* Left: Logo */}
        <div className="flex items-center">
          <button onClick={() => router.push('/home')}>
            <Image
              src="https://res.cloudinary.com/dymanaa1j/image/upload/v1763966137/ChatGPT_Image_Nov_24_2025_12_04_23_PM_pfrqzq.png"
              alt="Logo"
              width={150}
              height={100}
              className="cursor-pointer"
            />
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>

          {/* ✅ Dark / Light toggle */}
          <ModeToggle />

          <HoverCard>
            <HoverCardTrigger>
              <HelpCircle size={20} className="cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="text-sm p-4 w-72 rounded-md shadow-lg border border-gray-200 bg-white dark:bg-gray-800 space-y-3">
              <div className="font-semibold text-gray-800 dark:text-gray-100">Need Help?</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                If you&apos;re facing any issues or need assistance, feel free to reach out:
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  <a href="mailto:support@saascraft.studio" className="text-blue-600 hover:underline text-sm">
                    support@saascraft.studio
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" />
                  <a href="tel:+917331131070" className="text-blue-600 hover:underline text-sm">
                    +91 73311 31070
                  </a>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <div className="relative">
            {isLoggedIn && (
              <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button className="text-white border border-white text-sm px-4 py-1 rounded-lg font-semibold hover:bg-white hover:text-sky-800 transition">
                    Logout
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? This will end your session.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} disabled={loading} className="bg-sky-800 hover:bg-sky-900">
                      {loading ? "Logging out..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
