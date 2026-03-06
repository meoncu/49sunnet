"use client";

import { useState, useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useSunnahs, Sunnah } from "@/hooks/useSunnahs";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  Library,
  BarChart3,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Bell,
  Compass,
  User as UserIcon,
  Share2,
} from "lucide-react";

type SunnahLayoutProps = {
  initialParentGroupId?: string | null;
};

export function SunnahLayout({ initialParentGroupId = null }: SunnahLayoutProps) {
  const { user, loading: authLoading, signInWithGoogle, isAdmin } = useAuth();

  const [selectedParentGroupId, setSelectedParentGroupId] = useState<string | null>(initialParentGroupId);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedSunnahId, setExpandedSunnahId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { groups: parentGroups } = useGroups(null);
  const { sunnahs, loading: sunnahsLoading } = useSunnahs(selectedGroupId);

  const featuredSunnah = sunnahs.find(s => s.sequence === 1) || sunnahs[0];

  const filteredSunnahs = sunnahs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.shortText.toLowerCase().includes(query) ||
      (s.detailText?.toLowerCase() || "").includes(query) ||
      (s.hadithArabic?.toLowerCase() || "").includes(query) ||
      (s.hadithTranslation?.toLowerCase() || "").includes(query)
    );
  });

  useEffect(() => {
    if (parentGroups.length > 0 && !selectedGroupId) {
      const firstGroup = parentGroups[0];
      setSelectedParentGroupId(firstGroup.id);
      setSelectedGroupId(firstGroup.id);
    }
  }, [parentGroups, selectedGroupId]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
          <p className="text-sm font-medium text-[#6B7280]">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-4 font-sans">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border-t-4 border-[#0D7377]">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-1">49SÜNNET ACADEMIC</h1>
              <h2 className="text-3xl font-bold tracking-tighter text-[#2C3E50] leading-none">Scholarly Research Library</h2>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-[#6B7280]">
              Peygamber Efendimizin (s.a.v) sahih rivayetlerini akademik bir bakış açısıyla inceleyin, kaydedin ve hayatınıza geçirin.
            </p>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#0D7377] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#0D7377]/20 transition-all hover:bg-[#095754] active:scale-[0.98]"
              onClick={() => void signInWithGoogle()}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#FAF7F0] font-sans md:mx-auto md:max-w-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white px-5 py-6 border-b border-[#E8E0D0] sticky top-0 z-20">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-[#0D7377] rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#2C3E50] leading-none">49Sünnet</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">Academic Archive</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-[#2C3E50] hover:bg-[#F3F4F6] rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C9A227] rounded-full border border-white"></span>
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-lg border border-[#E8E0D0] bg-[#F3F4F6] flex items-center justify-center text-sm font-bold text-[#6B7280]">
              {(user.displayName ?? "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="relative mb-2">
          <span className="absolute inset-y-0 left-3 flex items-center text-[#9CA3AF]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hadith, Category, or Source..."
            className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border-none rounded-lg text-sm focus:ring-1 focus:ring-[#0D7377] placeholder:text-[#9CA3AF] transition-all"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* Featured Card */}
          {!searchQuery && (
            <div className="px-5 pt-6 pb-2">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Featured Daily Sunnah</h3>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-6 relative overflow-hidden group transition-all hover:border-[#0D7377]/50">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="h-12 w-12 text-[#0D7377]" />
                </div>
                {featuredSunnah && (
                  <>
                    <p className="font-arabic text-2xl text-right text-[#2C3E50] leading-relaxed mb-4" dir="rtl">
                      {featuredSunnah.hadithArabic}
                    </p>
                    <h4 className="text-lg font-bold text-[#2C3E50] leading-tight mb-2">
                      {featuredSunnah.shortText}
                    </h4>
                    <button
                      onClick={() => setExpandedSunnahId(featuredSunnah.id)}
                      className="text-[11px] font-bold text-[#0D7377] uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      Devamını Gör <ChevronRight className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <nav className="px-5 py-4 overflow-x-auto no-scrollbar flex gap-3">
            <button
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                !selectedGroupId ? "bg-[#0D7377] border-[#0D7377] text-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF]"
              )}
              onClick={() => setSelectedGroupId(null)}
            >
              Archive
            </button>
            {parentGroups.map((g) => (
              <button
                key={g.id}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                  selectedGroupId === g.id ? "bg-[#0D7377] border-[#0D7377] text-white" : "bg-white border-[#E8E0D0] text-[#9CA3AF]"
                )}
                onClick={() => setSelectedGroupId(g.id)}
              >
                {g.name}
              </button>
            ))}
          </nav>

          {/* Archive List */}
          <section className="bg-white min-h-screen">
            <div className="px-5 py-3 border-b border-[#F3F4F6] flex justify-between items-center bg-[#FAF7F0]/50 sticky top-0 z-10 backdrop-blur-sm">
              <h3 className="text-[11px] font-bold text-[#2C3E50] uppercase tracking-widest">Repository Index</h3>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-[#0D7377]">ID Order</span>
                <span className="text-[10px] font-bold text-[#9CA3AF]">A-Z</span>
              </div>
            </div>

            <table className="w-full text-[13px] academic-table border-t border-[#E8E0D0]">
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredSunnahs.map((s) => (
                  <SunnahRow
                    key={s.id}
                    sunnah={s}
                    isExpanded={expandedSunnahId === s.id}
                    onToggle={() => setExpandedSunnahId(expandedSunnahId === s.id ? null : s.id)}
                  />
                ))}

                {filteredSunnahs.length === 0 && !sunnahsLoading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
                        <Search className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No results found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* A-Z Scroller Scroller */}
        <div className="w-6 border-l border-[#E8E0D0] bg-[#FAF7F0]/30 hidden md:flex flex-col items-center justify-center gap-1 py-4">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
            <span key={letter} className="text-[8px] font-bold text-[#9CA3AF] cursor-default hover:text-[#0D7377]">
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative bg-white border-t border-[#E8E0D0] px-4 py-3 z-30 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center">
          <NavItem icon={Library} label="Archive" active />
          <NavItem icon={Compass} label="Discover" />
          <NavItem icon={BarChart3} label="Insights" />
          <NavItem icon={UserIcon} label="Profile" />
          {isAdmin && (
            <Link href="/admin" className="flex flex-col items-center gap-0.5 text-[#9CA3AF] hover:text-[#0D7377] transition-colors">
              <Settings className="h-5 w-5" />
              <p className="text-[9px] font-bold uppercase tracking-tighter">Panel</p>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

function SunnahRow({ sunnah, isExpanded, onToggle }: { sunnah: Sunnah, isExpanded: boolean, onToggle: () => void }) {
  return (
    <>
      <tr
        className={cn(
          "transition-colors cursor-pointer group",
          isExpanded ? "bg-[#0D7377]/5" : "hover:bg-[#F9FAFB]"
        )}
        onClick={onToggle}
      >
        <td className={cn(
          "px-5 py-5 font-mono font-bold transition-colors w-16",
          isExpanded ? "text-[#0D7377]" : "text-[#9CA3AF] group-hover:text-[#0D7377]"
        )}>
          {sunnah.sequence.toString().padStart(3, "0")}
        </td>
        <td className="px-2 py-5">
          <div className="flex flex-col gap-1">
            <span className={cn(
              "font-medium transition-colors text-[14px] leading-tight",
              isExpanded ? "text-[#2C3E50]" : "text-[#4B5563] group-hover:text-[#2C3E50]"
            )}>
              {sunnah.shortText}
            </span>
            {!isExpanded && (
              <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-tighter flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#10B981]"></div> Sahih
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-5 text-right w-10">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
            isExpanded ? "bg-[#0D7377] text-white rotate-180" : "bg-[#F3F4F6] text-[#9CA3AF] group-hover:bg-[#E8E0D0]"
          )}>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={3} className="bg-[#FDFBF4] p-0 border-b border-[#0D7377]/20">
            <div className="p-7 space-y-7 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E0D0]">
                  <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest">
                    Sunnah ID: S-{sunnah.sequence?.toString().padStart(3, "0") || "000"}
                  </h3>
                  <span className="text-[10px] bg-[#0D7377] text-white px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter">SAHİH</span>
                </div>

                {sunnah.hadithArabic && (
                  <div className="py-4">
                    <p
                      className="text-right font-arabic text-3xl leading-[1.8] text-[#2C3E50]"
                      dir="rtl"
                    >
                      {sunnah.hadithArabic}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Metin & Tercüme</h4>
                  <p className="text-sm text-[#4B5563] leading-relaxed font-sans">
                    {sunnah.hadithTranslation || sunnah.detailText}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="p-4 bg-white rounded-lg border border-[#E8E0D0] space-y-2">
                  <h4 className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest">Hadis Kaynağı</h4>
                  <p className="text-[12px] text-[#2C3E50] font-medium leading-relaxed italic">
                    {sunnah.hadithSource || "Kaynak bilgisi akademik arşivde araştırılmaktadır."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button className="flex-1 py-3 bg-[#0D7377] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-[#095754] active:scale-[0.98] shadow-sm">
                  DETAYLI ANALİZ
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button className="px-4 py-3 bg-white border border-[#E8E0D0] text-[#2C3E50] rounded-lg transition-all hover:bg-[#F3F4F6]">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center gap-0.5 transition-colors",
      active ? "text-[#0D7377]" : "text-[#9CA3AF] hover:text-[#4B5563]"
    )}>
      <Icon className={cn("h-5 w-5", active && "fill-current")} />
      <p className="text-[9px] font-bold uppercase tracking-tighter antialiased">{label}</p>
    </button>
  );
}
