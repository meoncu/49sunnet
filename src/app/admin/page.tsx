"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminGroups, useAdminSunnahs } from "@/hooks/useAdmin";
import { FolderTree, BookOpen, Plus, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ groups: 0, sunnahs: 0 });
  const { getAllGroups } = useAdminGroups();
  const { getAllSunnahs } = useAdminSunnahs();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [groups, sunnahs] = await Promise.all([
          getAllGroups(),
          getAllSunnahs(),
        ]);
        setStats({
          groups: groups.length,
          sunnahs: sunnahs.length,
        });
      } catch (error) {
        console.error("İstatistikler yüklenirken hata:", error);
      }
    };
    loadStats();
  }, [getAllGroups, getAllSunnahs]);

  const cards = [
    {
      title: "Toplam Kategori",
      value: stats.groups,
      icon: FolderTree,
      href: "/admin/groups",
      gradient: "from-[#0D7377] to-[#14A085]",
      iconBg: "bg-white/20",
    },
    {
      title: "Toplam Sünnet",
      value: stats.sunnahs,
      icon: BookOpen,
      href: "/admin/sunnahs",
      gradient: "from-[#C9A227] to-[#D4B43A]",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0D7377] to-[#14A085] p-6 text-white shadow-lg shadow-[#0D7377]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-white/80">
              Uygulama istatistikleri ve yönetim
            </p>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">
                      {card.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#2C3E50]">
                      {card.value}
                    </p>
                  </div>
                  <div className={`rounded-xl ${card.gradient} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Hızlı İşlemler */}
      <div className="rounded-2xl border border-[#E8E0D0] bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
          Hızlı İşlemler
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/groups"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D7377] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0D7377]/20 transition hover:bg-[#095754]"
          >
            <Plus className="h-4 w-4" />
            Kategori Ekle
          </Link>
          <Link
            href="/admin/sunnahs"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#D4B43A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#C9A227]/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Sünnet Ekle
          </Link>
        </div>
      </div>
    </div>
  );
}
