'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Users,
  PlaneLanding,
  PlaneTakeoff,
  Building2,
  MonitorPlay,
  Hotel,
} from "lucide-react";

// 🟧 Menu Items (Hotel removed)
const menuItems = [
  { name: "Faculty", href: "/faculty", icon: GraduationCap },
  { name: "Team", href: "/teams", icon: Users },

  // ✈️ Meaningful flight icons
  { name: "Arrival", href: "/arrival", icon: PlaneLanding },
  { name: "Departure", href: "/departure", icon: PlaneTakeoff },

  // 🏛 Session Hall
  { name: "Session Hall", href: "/session", icon: Building2 },

  // 🎦 Preview Room
  { name: "Preview Room", href: "/preview", icon: MonitorPlay },
];

export default function MobileNavbarAdmin() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo(() => menuItems, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (item: any) => {
    if (!item.subMenu?.length) return;
    setOpenMenu((prev) => (prev === item.name ? null : item.name));
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className="sticky top-[64px] bg-background border-t border-orange-900 z-[30]"
      >
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex items-start justify-start gap-6 px-4 py-3 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive = pathname === item.href;

              return (
                <div key={item.name} className="relative flex flex-col items-center">
                  <div className="flex flex-col items-center cursor-pointer select-none">
                    <Link href={item.href}>
                      <button
                        className={cn(
                          'flex flex-col items-center justify-center w-14 h-14 rounded-full border transition-all duration-200',
                          isActive
                            ? 'bg-orange-800 text-background border-orange-800'
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        )}
                      >
                        <Icon size={22} />
                      </button>
                    </Link>

                    <div
                      className={cn(
                        'mt-1 flex items-center text-xs font-medium transition-colors',
                        isActive ? 'text-orange-800' : 'text-foreground'
                      )}
                    >
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔥 Submenu removed fully, nothing to render */}
    </>
  );
}
