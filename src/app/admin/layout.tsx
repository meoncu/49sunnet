"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  ArrowLeft,
  Home,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/sunnahs", label: "Sünnetler", icon: BookOpen },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
          <p className="text-sm text-[#6B7280]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C75B5B]/10">
            <Shield className="h-8 w-8 text-[#C75B5B]" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-[#2C3E50]">
            Erişim Reddedildi
          </h1>
          <p className="mb-6 text-sm text-[#6B7280]">
            Bu sayfaya erişmek için admin yetkisi gerekiyor.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D7377] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0D7377]/20 transition hover:bg-[#095754]"
          >
            <Home className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* Üst Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8E0D0] bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#6B7280] transition hover:bg-[#0D7377] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C9A227] to-[#D4B43A]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#2C3E50]">Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#6B7280] sm:block">
              {user.displayName}
            </span>
            <span className="rounded-full bg-gradient-to-r from-[#C9A227] to-[#D4B43A] px-3 py-1 text-xs font-semibold text-white">
              Admin
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-[#E8E0D0] bg-white p-4 lg:block">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#0D7377] text-white shadow-md shadow-[#0D7377]/20"
                      : "text-[#6B7280] hover:bg-[#F5F1E8] hover:text-[#2C3E50]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobil Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E0D0] bg-white px-6 py-2 lg:hidden">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition",
                    isActive
                      ? "text-[#0D7377]"
                      : "text-[#6B7280] hover:text-[#2C3E50]"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
