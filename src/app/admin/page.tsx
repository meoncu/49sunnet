"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminGroups, useAdminSunnahs } from "@/hooks/useAdmin";
import { FolderTree, BookOpen, Plus, Sparkles, LogOut, Activity, Users } from "lucide-react";

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

  return (
    <div className="space-y-8 bg-[#FDFBF4] min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-[#E8E0D0]">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Yönetim Paneli</h1>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">49Sünnet Scholarly Control</p>
        </div>
        <Link
          href="/"
          className="p-2 text-[#9CA3AF] hover:text-[#0D7377] transition-colors"
          title="Çıkış"
        >
          <LogOut className="h-5 w-5" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E8E0D0] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#0D7377]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Toplam Sünnet</p>
              <h3 className="text-4xl font-bold text-[#2C3E50] tracking-tighter">{stats.sunnahs}</h3>
            </div>
            <div className="bg-[#FAF7F0] p-3 rounded-lg text-[#0D7377]">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E8E0D0] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#C9A227]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Toplam Kategori</p>
              <h3 className="text-4xl font-bold text-[#2C3E50] tracking-tighter">{stats.groups}</h3>
            </div>
            <div className="bg-[#FAF7F0] p-3 rounded-lg text-[#C9A227]">
              <FolderTree className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Ana İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/sunnahs" className="bg-white border border-[#E8E0D0] p-6 rounded-xl hover:border-[#0D7377] transition-all flex flex-col items-center gap-3">
            <Plus className="h-5 w-5 text-[#0D7377]" />
            <span className="text-sm font-bold text-[#2C3E50]">Sünnet Ekle/Düzenle</span>
          </Link>
          <Link href="/admin/groups" className="bg-white border border-[#E8E0D0] p-6 rounded-xl hover:border-[#0D7377] transition-all flex flex-col items-center gap-3">
            <Activity className="h-5 w-5 text-[#0D7377]" />
            <span className="text-sm font-bold text-[#2C3E50]">Kategori Yönetimi</span>
          </Link>
          <button className="bg-white border border-[#E8E0D0] p-6 rounded-xl hover:border-[#0D7377] transition-all flex flex-col items-center gap-3 cursor-not-allowed opacity-60">
            <Users className="h-5 w-5 text-[#9CA3AF]" />
            <span className="text-sm font-bold text-[#9CA3AF]">Kullanıcı İstatistikleri</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#E8E0D0] rounded-xl p-6">
        <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-6">Son İşlemler</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-3 border-b border-[#F3F4F6]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0D7377]"></div>
            <p className="text-[13px] text-[#2C3E50]">
              <span className="font-bold">007 Misvak Sunnah</span> güncellendi
            </p>
            <span className="ml-auto text-[10px] font-mono text-[#9CA3AF]">2 dk önce</span>
          </div>
          <div className="flex items-center gap-4 py-3 border-b border-[#F3F4F6]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></div>
            <p className="text-[13px] text-[#2C3E50]">
              <span className="font-bold">IBADET</span> kategorisine yeni alt öğe eklendi
            </p>
            <span className="ml-auto text-[10px] font-mono text-[#9CA3AF]">1 saat önce</span>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></div>
            <p className="text-[13px] text-[#2C3E50]">
              Yeni kullanıcı arşive erişim sağladı
            </p>
            <span className="ml-auto text-[10px] font-mono text-[#9CA3AF]">3 saat önce</span>
          </div>
        </div>
      </div>
    </div>
  );
}
