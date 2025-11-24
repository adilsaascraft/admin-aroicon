// components/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import clsx from "clsx";
import {
  GraduationCap,
  Users,
  PlaneLanding,
  PlaneTakeoff,
  Building2,
  MonitorPlay,
  Hotel,
} from "lucide-react";

const sidebarItems = [
  { name: "Faculty", href: "/faculty", icon: <GraduationCap size={20} /> },
  { name: "Team", href: "/teams", icon: <Users size={20} /> },

  // ✈️ Meaningful flight icons
  { name: "Arrival", href: "/arrival", icon: <PlaneLanding size={20} /> },
  { name: "Departure", href: "/departure", icon: <PlaneTakeoff size={20} /> },

  // 🏨 Hotel
  { name: "Hotel", href: "/hotel", icon: <Hotel size={20} /> },

  // 🏛 Session Hall
  { name: "Faculty Hall Session", href: "/session", icon: <Building2 size={20} /> },

  // 🎦 Preview Room
  { name: "Preview Room", href: "/preview", icon: <MonitorPlay size={20} /> },
];


function SidebarComponent() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const isActive = (href?: string) => href && pathname === href;

  const baseItem =
    "flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors";

  // 🔥 Replaced sky-* with orange-600
  const inactive =
    "text-black hover:bg-white hover:text-orange-600 dark:text-foreground dark:hover:bg-muted dark:hover:text-orange-600";

  const active =
    "bg-white text-orange-600 dark:bg-muted dark:text-orange-600 dark:hover:bg-muted";

  return (
    <motion.div
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="min-h-screen bg-orange-100 p-2 flex flex-col relative dark:bg-background dark:text-foreground border-r overflow-hidden"
    >
      {/* Collapse / Expand Button */}
      {!isMobile && (
        <div className="relative mb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`absolute top-1/4 -translate-y-1/2 pr-2 mt-2
              transition-all duration-300 ease-in-out
              ${collapsed ? "left-3" : "-right-5"}`}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-6" />
            ) : (
              <ChevronLeftIcon className="w-5 h-6" />
            )}
          </button>
        </div>
      )}

      {/* Sidebar Items */}
      <nav className="flex flex-col space-y-1 mt-2 flex-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            href={item.href!}
            className={clsx(
              baseItem,
              isActive(item.href) ? active : inactive,
              collapsed && "justify-center"
            )}
            title={collapsed ? item.name : undefined}
          >
            {item.icon}
            {!collapsed && <span className="font-semibold">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}

export default memo(SidebarComponent);
