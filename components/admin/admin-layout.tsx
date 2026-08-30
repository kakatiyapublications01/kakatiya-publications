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
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
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
    label: "",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "Magazines",
        href: "/admin/magazines",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        title: "Stories",
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
    label: "Analytics",
    items: [
      {
        title: "Visitors",
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
    // Exact match, but /admin/analytics should not match /admin/analytics/live
    return pathname === href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#E5E5E0] shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 shrink-0">
            <Image src="/logo.png" alt="KakatiyaPulse" fill className="object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-sm font-bold text-[#14532D] tracking-wider">
              KAKATIYA
            </span>
            <span className="text-[9px] font-bold text-[#C9A227] tracking-[0.35em]">
              PULSE
            </span>
          </div>
        </Link>
        <p className="text-[10px] text-[#555555] mt-3 font-medium tracking-widest uppercase">
          Admin Console
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, si) => (
          <div key={si} className="mb-6">
            {section.label && (
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A227] px-3 mb-2">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#14532D] text-white shadow-sm"
                          : "text-[#555555] hover:bg-[#F8F7F3] hover:text-[#14532D]"
                      }`}
                    >
                      <span className={active ? "text-white" : "text-[#C9A227]"}>
                        {item.icon}
                      </span>
                      {item.title}
                      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: User + Logout */}
      <div className="px-3 py-4 border-t border-[#E5E5E0] shrink-0 space-y-3">
        {user?.email && (
          <div className="px-3 py-2 bg-[#F8F7F3] rounded-lg">
            <p className="text-[10px] text-[#555555] tracking-wider uppercase font-medium">
              Signed in as
            </p>
            <p className="text-xs text-[#14532D] font-semibold truncate mt-0.5">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[#555555] hover:bg-red-50 hover:text-red-700 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F7F3]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#E5E5E0] fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5E5E0] transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F8F7F3] text-[#555555] hover:text-[#14532D] hover:bg-[#E5E5E0] transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E5E5E0] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#F8F7F3] text-[#14532D] hover:bg-[#E5E5E0] transition-colors cursor-pointer border border-[#E5E5E0]"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#14532D]">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#555555] hover:text-[#14532D] font-medium hidden sm:block transition-colors"
            >
              View Site
            </Link>
            {user?.email && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F8F7F3] rounded-full border border-[#E5E5E0]">
                <div className="w-6 h-6 rounded-full bg-[#14532D] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-[#555555] font-medium max-w-[140px] truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
