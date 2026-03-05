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
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-1">Corpus Sunnah v1.0</h1>
              <h2 className="text-3xl font-bold tracking-tighter text-[#2C3E50] leading-none">Akademik Referans Kitaplığı</h2>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-[#6B7280]">
              Peygamber Efendimizin (s.a.v) sahih rivayetlerini akademik bir bakış açısıyla inceleyin ve kaydedin.
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
    <div className="relative flex min-h-screen w-full flex-col bg-[#FAF7F0] font-sans md:mx-auto md:max-w-lg shadow-2xl">
      {/* Header */}
      <header className="bg-white px-4 py-6 border-b-2 border-[#0D7377]/30 sticky top-0 z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">Corpus Sunnah v1.0</h1>
            <h2 className="text-2xl font-bold tracking-tighter text-[#2C3E50] leading-none">Akademik Referans Kitaplığı</h2>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center overflow-hidden rounded-md border border-[#E8E0D0] grayscale">
            <div className="flex h-full w-full items-center justify-center bg-[#F3F4F6] text-xs font-bold text-[#6B7280]">
              {(user.displayName ?? "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-[#9CA3AF]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hadis, Ravi veya Konu Ara..."
            className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] border-none rounded-md text-sm focus:ring-1 focus:ring-[#0D7377] placeholder:text-[#9CA3AF] transition-all"
          />
        </div>
      </header>

      {/* Categories */}
      <nav className="px-4 py-3 bg-[#FAF7F0] border-b border-[#E8E0D0]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            className={cn(
              "shrink-0 px-3 py-1 rounded text-[11px] font-bold uppercase transition-all",
              !selectedGroupId ? "bg-[#0D7377] text-white" : "border border-[#D1D5DB] text-[#6B7280]"
            )}
            onClick={() => {
              setSelectedGroupId(null);
              setExpandedSunnahId(null);
            }}
          >
            Tümü
          </button>
          {parentGroups.map((g) => (
            <button
              key={g.id}
              className={cn(
                "shrink-0 px-3 py-1 rounded text-[11px] font-bold uppercase transition-all",
                selectedGroupId === g.id ? "bg-[#0D7377] text-white" : "border border-[#D1D5DB] text-[#6B7280]"
              )}
              onClick={() => {
                setSelectedGroupId(g.id);
                setExpandedSunnahId(null);
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-white pb-20">
        <table className="w-full text-[13px] academic-table">
          <thead className="bg-[#FAF7F0] border-b border-[#E8E0D0]">
            <tr>
              <th className="w-14 px-4 py-3 text-left font-bold text-[#6B7280] uppercase text-[10px] tracking-wider">ID</th>
              <th className="px-4 py-3 text-left font-bold text-[#6B7280] uppercase text-[10px] tracking-wider">Hadis/Sünnet Metni</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
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
                    <p className="text-sm font-medium">Sonuç bulunamadı</p>
                    <p className="text-xs">Farklı bir arama yapmayı deneyin.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D0] px-4 py-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          <NavItem icon={Library} label="Arşiv" active />
          <NavItem icon={BarChart3} label="İstatistik" />
          <NavItem icon={History} label="Notlar" />
          {isAdmin ? (
            <Link href="/admin" className="flex flex-col items-center gap-0.5 text-[#9CA3AF]">
              <Settings className="h-5 w-5" />
              <p className="text-[9px] font-bold uppercase tracking-tighter">Panel</p>
            </Link>
          ) : (
            <NavItem icon={Settings} label="Ayarlar" />
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
          "transition-colors cursor-pointer",
          isExpanded ? "bg-[#0D7377]/5" : "hover:bg-[#F9FAFB]"
        )}
        onClick={onToggle}
      >
        <td className={cn(
          "px-4 py-4 font-mono font-bold transition-colors",
          isExpanded ? "text-[#0D7377]" : "text-[#9CA3AF]"
        )}>
          {sunnah.sequence.toString().padStart(3, "0")}
        </td>
        <td className={cn(
          "px-4 py-4 font-medium transition-colors",
          isExpanded ? "text-[#2C3E50]" : "text-[#4B5563]"
        )}>
          {sunnah.shortText}
        </td>
        <td className="px-4 py-4 text-right">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[#0D7377]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#D1D5DB]" />
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={3} className="bg-[#FAF7F0] p-0 border-b border-[#0D7377]/20">
            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-[#0D7377]/20 text-[#0D7377] px-2 py-0.5 rounded font-bold uppercase">Metin & Rivayet</span>
                  <span className="text-[10px] text-[#9CA3AF] font-mono tracking-widest uppercase">REF: S-{sunnah.sequence + 1000}</span>
                </div>

                {sunnah.hadithArabic && (
                  <p
                    className="text-right font-arabic text-3xl leading-relaxed text-[#2C3E50] py-4"
                    dir="rtl"
                  >
                    {sunnah.hadithArabic}
                  </p>
                )}

                <p className="text-sm italic text-[#4B5563] border-l-2 border-[#0D7377]/30 pl-3 leading-relaxed">
                  "{sunnah.hadithTranslation || sunnah.detailText}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1.5 antialiased">Kaynaklar</h4>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    • {sunnah.hadithSource || "Hadis kaynakları araştırılıyor."}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1.5 antialiased">Sıhhat Derecesi</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                    <span className="text-[11px] font-bold text-emerald-600">Sahih (Mütevatir)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E0D0]">
                <button className="w-full py-2.5 bg-[#0D7377] text-white text-[11px] font-bold rounded flex items-center justify-center gap-2 transition-all hover:bg-[#095754] active:scale-[0.98]">
                  AKADEMİK ANALİZİ GÖRÜNTÜLE
                  <ExternalLink className="h-3.5 w-3.5" />
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
