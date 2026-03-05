"use client";

import { useState, useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useSunnahs } from "@/hooks/useSunnahs";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  Home,
  BarChart3,
  BookOpenText,
  User as UserIcon,
  Bookmark,
  Settings,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

type SunnahLayoutProps = {
  initialParentGroupId?: string | null;
};

export function SunnahLayout({ initialParentGroupId = null }: SunnahLayoutProps) {
  const { user, loading: authLoading, signInWithGoogle, logout, isAdmin } =
    useAuth();

  const [selectedParentGroupId, setSelectedParentGroupId] = useState<
    string | null
  >(initialParentGroupId);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSunnahId, setSelectedSunnahId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { groups: parentGroups } = useGroups(null);
  const { sunnahs } = useSunnahs(selectedGroupId);

  // Arama fonksiyonu
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

  const selectedSunnah = sunnahs.find((s) => s.id === selectedSunnahId) ?? null;

  // İlk kategori otomatik seç (veri yüklendiğinde)
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
          <p className="text-sm text-[#6B7280]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-4">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Dekoratif üst kısım */}
          <div className="relative h-32 bg-gradient-to-br from-[#0D7377] to-[#14A085]">
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                  <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <rect width="100" height="100" fill="url(#islamic-pattern)" />
              </svg>
            </div>
            <div className="absolute bottom-4 left-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="mb-2 text-2xl font-bold text-[#2C3E50]">
              49 Sünnet
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">
              Peygamber Efendimizin (s.a.v) günlük hayatımızda uygulayabileceğimiz sünnetlerini keşfedin.
            </p>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D7377] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0D7377]/25 transition hover:bg-[#095754] active:scale-95"
              onClick={() => void signInWithGoogle()}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google ile Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#FAF7F0] md:mx-auto md:max-w-lg">
      {/* Üst başlık - Kompakt */}
      <header className="sticky top-0 z-10 bg-[#FAF7F0]/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D7377] to-[#14A085] text-xs font-bold text-white shadow-md shadow-[#0D7377]/20">
              {(user.displayName ?? "K").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#6B7280]">Hoş Geldiniz</p>
              <h2 className="text-sm font-bold text-[#2C3E50]">
                {user.displayName?.split(" ")[0] ?? "Kullanıcı"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm">
                <Search className="h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ara..."
                  className="w-24 bg-transparent text-xs outline-none placeholder:text-[#6B7280]"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-[#6B7280] hover:text-[#2C3E50]"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#6B7280] shadow-sm transition hover:text-[#0D7377]"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A227] text-white shadow-sm transition hover:bg-[#D4B43A]"
                title="Admin Paneli"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Kategoriler - Kompakt */}
      <section className="py-1.5">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4">
          {parentGroups.map((g) => {
            const active = selectedParentGroupId === g.id || selectedGroupId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200",
                  active
                    ? "bg-[#0D7377] text-white shadow-md shadow-[#0D7377]/20"
                    : "bg-white text-[#6B7280] hover:bg-[#0D7377]/5"
                )}
                onClick={() => {
                  setSelectedParentGroupId(g.id);
                  setSelectedGroupId(g.id);
                  setSelectedSunnahId(null);
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Başlık - Kompakt */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#2C3E50]">Sünnetler</h3>
          <span className="text-[10px] font-medium text-[#6B7280]">
            {selectedGroupId 
              ? searchQuery 
                ? `${filteredSunnahs.length}/${sunnahs.length} bulundu`
                : `${sunnahs.length} adet`
              : "Kategori seçin"}
          </span>
        </div>
      </div>

      {/* Sünnet Listesi - Minimalist Liste Yapısı */}
      <main className="flex-1 pb-72">
        <div className="bg-white border-y border-[#F3F4F6]">
          {filteredSunnahs.map((s) => {
            const active = selectedSunnahId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSunnahId(s.id)}
                className={cn(
                  "group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors border-b border-[#F3F4F6] last:border-0",
                  active ? "bg-[#FAF7F0]" : "hover:bg-gray-50/50"
                )}
              >
                {/* Sıra numarası */}
                <div className="w-8 shrink-0 text-[11px] font-medium text-[#9CA3AF] tabular-nums">
                  {s.sequence.toString().padStart(3, "0")}
                </div>
                
                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] leading-snug transition-colors",
                    active ? "font-semibold text-[#0D7377]" : "text-[#4B5563]"
                  )}>
                    {s.shortText}
                  </p>
                </div>
                
                {/* Ok ikonu */}
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center transition-colors",
                  active ? "text-[#0D7377]" : "text-[#D1D5DB]"
                )}>
                  <ChevronLeft className={cn("h-3.5 w-3.5 rotate-180 transition-transform", active && "rotate-0")} />
                </div>
              </button>
            );
          })}
          
          {filteredSunnahs.length === 0 && selectedGroupId && (
            <div className="flex h-32 flex-col items-center justify-center px-4">
              <Search className="mb-2 h-7 w-7 text-[#E5E7EB]" />
              <p className="text-[11px] text-[#9CA3AF]">
                {searchQuery ? "Arama sonucu bulunamadı." : "Bu kategori için henüz sünnet yok."}
              </p>
            </div>
          )}
          
          {!selectedGroupId && (
            <div className="flex h-32 flex-col items-center justify-center px-4">
              <Sparkles className="mb-2 h-7 w-7 text-[#F59E0B]/20" />
              <p className="text-[11px] text-[#9CA3AF]">Başlamak için bir kategori seçin.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detay Paneli - Kompakt */}
      <div className="fixed bottom-16 left-0 right-0 z-20 mx-auto w-full px-4 md:max-w-lg">
        <div className={cn(
          "overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#2C3E50]/10 transition-all duration-300",
          selectedSunnah ? "max-h-[50vh]" : "max-h-20"
        )}>
          {/* Üst başlık - Kompakt */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0D7377] to-[#14A085] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-[10px] font-bold text-white">
                {selectedSunnah?.sequence || "?"}
              </span>
              <span className="text-[11px] font-medium text-white/90">
                {selectedSunnah ? "Sünnet Detayı" : "Detay"}
              </span>
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Favorilere ekle"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* İçerik - Kompakt */}
          <div className="max-h-[35vh] overflow-y-auto p-4">
            {selectedSunnah ? (
              <div className="space-y-3">
                {/* Kısa başlık */}
                <h4 className="text-sm font-bold text-[#2C3E50]">
                  {selectedSunnah.shortText}
                </h4>
                
                {/* Detay açıklama */}
                {selectedSunnah.detailText && (
                  <p className="text-xs leading-relaxed text-[#6B7280]">
                    {selectedSunnah.detailText}
                  </p>
                )}
                
                {/* Hadis Bölümü - Kompakt */}
                {(selectedSunnah.hadithArabic || selectedSunnah.hadithTranslation) && (
                  <div className="rounded-xl bg-[#FAF7F0] p-3">
                    {selectedSunnah.hadithArabic && (
                      <p
                        className="mb-2 text-right text-base leading-relaxed text-[#2C3E50]"
                        dir="rtl"
                        style={{ fontFamily: "serif" }}
                      >
                        {selectedSunnah.hadithArabic}
                      </p>
                    )}
                    {selectedSunnah.hadithTranslation && (
                      <>
                        <div className="mb-2 h-px bg-[#E8E0D0]" />
                        <p className="text-xs italic leading-relaxed text-[#6B7280]">
                          {selectedSunnah.hadithTranslation}
                        </p>
                      </>
                    )}
                    {selectedSunnah.hadithSource && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-[#C9A227]">
                          Kaynak:
                        </span>
                        <span className="text-[10px] text-[#6B7280]">
                          {selectedSunnah.hadithSource}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-16 items-center justify-center">
                <p className="text-xs text-[#6B7280]">
                  Detay için sünnet seçin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alt Navigasyon - Kompakt */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full border-t border-[#E8E0D0] bg-white/95 px-4 backdrop-blur-md md:max-w-lg">
        <div className="flex justify-around py-1.5">
          {[
            { icon: Home, label: "Ana Sayfa", active: true },
            { icon: BarChart3, label: "İlerleme", active: false },
            { icon: BookOpenText, label: "Dualar", active: false },
            { icon: UserIcon, label: "Profil", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 transition-colors",
                  item.active
                    ? "text-[#0D7377]"
                    : "text-[#6B7280] hover:text-[#2C3E50]"
                )}
              >
                <Icon className={cn("h-4 w-4", item.active && "fill-current")} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
