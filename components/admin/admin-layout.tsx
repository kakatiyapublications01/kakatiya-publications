"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  UserCheck,
  Crown,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Globe,
} from "lucide-react";

interface NavSection {
  label: string;
  items: {
    title: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

const navSections: NavSection[] = [
  {
    label: "DASHBOARD",
    items: [
      {
        title: "Overview",
        href: "/admin/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "CONTENT",
    items: [
      {
        title: "Magazines",
        href: "/admin/magazines",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        title: "Stories & Articles",
        href: "/admin/stories",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        title: "VIP Directory",
        href: "/admin/vip",
        icon: <UserCheck className="w-4 h-4" />,
      },
      {
        title: "VVIP Spotlight",
        href: "/admin/vvip",
        icon: <Crown className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "AUDIENCE",
    items: [
      {
        title: "Visitors Log",
        href: "/admin/analytics",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        title: "Live Visitors",
        href: "/admin/analytics/live",
        icon: <Activity className="w-4 h-4" />,
      },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.includes("#")) return pathname === href.split("#")[0];
    return pathname === href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#14532D] text-white">
      {/* Editorial CMS Masthead */}
      <div className="px-6 py-5 border-b border-green-800/80 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/logo.png" alt="KakatiyaPulse" fill className="object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-sm font-bold text-white tracking-wider">
              KAKATIYA
            </span>
            <span className="text-[9px] font-bold text-[#E8D48A] tracking-[0.3em]">
              PULSE
            </span>
          </div>
        </Link>
        <p className="text-[10px] text-green-200/60 mt-2 font-mono uppercase tracking-widest">
          Editorial CMS
        </p>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section, si) => (
          <div key={si}>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E8D48A] px-3 mb-1.5">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-[2px] text-xs font-medium transition-colors ${
                        active
                          ? "bg-[#166534] text-white font-bold border-l-2 border-[#C9A227]"
                          : "text-green-100/75 hover:bg-green-800/50 hover:text-white"
                      }`}
                    >
                      <span className={active ? "text-[#E8D48A]" : "text-green-200/60"}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                      {active && <ChevronRight className="w-3 h-3 ml-auto text-[#E8D48A]" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: User & Sign Out */}
      <div className="px-4 py-4 border-t border-green-800/80 shrink-0 space-y-2 text-xs">
        {user?.email && (
          <div className="px-2 py-1 text-green-200/70 truncate">
            <span className="text-[10px] uppercase tracking-wider block text-green-300/50">Staff</span>
            <span className="truncate font-mono text-[11px]">{user.email}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-red-200 hover:text-white hover:bg-red-900/40 rounded-[2px] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* Desktop Forest Green Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-green-900/50 fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-60 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white hover:text-[#E8D48A] cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main CMS Workspace */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0 bg-white">
        {/* Top CMS Header */}
        <header className="bg-white border-b border-[#E5E5E0] px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 border border-[#E5E5E0] text-[#14532D] rounded-[2px]"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#14532D]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#14532D] hover:text-[#C9A227] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Site</span>
            </Link>
          </div>
        </header>

        {/* CMS Workspace View */}
        <main className="flex-1 p-6 lg:p-8 bg-[#FBFBFA]">
          {children}
        </main>
      </div>
    </div>
  );
}
