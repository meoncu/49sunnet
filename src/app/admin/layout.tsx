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
  Activity,
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
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF4]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#0D7377] border-t-transparent shadow-sm" />
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] antialiased">Sistem Yükleniyor</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF4] px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center border border-[#E8E0D0] shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-xl font-bold text-[#2C3E50] tracking-tight">Erişim Yetkisi Yok</h1>
          <p className="mb-8 text-[13px] text-[#6B7280] leading-relaxed">
            Bu bölüme giriş yapabilmek için akademik yönetim yetkinizin bulunması gerekmektedir.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0D7377] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#095754] active:scale-95"
          >
            <Home className="h-4 w-4" />
            ANA SAYFAYA DÖN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF4] font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E8E0D0] bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 text-[#9CA3AF] hover:text-[#0D7377] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Site Görünümü</span>
            </Link>
            <div className="h-4 w-[1px] bg-[#E8E0D0] hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#0D7377] flex items-center justify-center text-white">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#2C3E50] leading-none uppercase tracking-tighter">Scholarly Panel</h1>
                <p className="text-[8px] font-bold text-[#9CA3AF] uppercase mt-1 tracking-widest">Admin Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-[#2C3E50]">{user.displayName || "Yönetici"}</p>
              <p className="text-[9px] text-[#0D7377] font-bold uppercase tracking-tighter">Yetkili Editör</p>
            </div>
            <div className="w-9 h-9 rounded-lg border border-[#E8E0D0] bg-[#FAF7F0] flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <LayoutDashboard className="h-4 w-4 text-[#C9A227]" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl pt-20">
        {/* Desktop Sidebar */}
        <aside className="fixed top-20 left-[max(0px,calc(50%-40rem))] hidden h-[calc(100vh-5rem)] w-64 border-r border-[#E8E0D0] bg-white/50 p-6 lg:block overflow-y-auto">
          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] mb-4 pl-4">Ana Menü</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all",
                    isActive
                      ? "bg-[#0D7377] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#0D7377] border border-transparent hover:border-[#E8E0D0]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 p-5 rounded-2xl bg-gradient-to-br from-[#0D7377] to-[#14A085] text-white relative overflow-hidden group">
            <Activity className="h-12 w-12 absolute -bottom-2 -right-2 opacity-10 font-bold rotate-12 transition-transform group-hover:scale-110" />
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Sistem Durumu</h4>
            <p className="text-[10px] text-white/80 leading-relaxed">Arşiv veritabanı %100 senkronize çalışıyor.</p>
          </div>
        </aside>

        {/* Mobile Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E0D0] bg-white/90 backdrop-blur-md px-6 py-3 lg:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all p-2",
                    isActive
                      ? "text-[#0D7377]"
                      : "text-[#9CA3AF] hover:text-[#2C3E50]"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-6 pb-28 lg:pb-12 min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
