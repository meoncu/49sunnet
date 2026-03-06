"use client";

import { useEffect, useState } from "react";
import { useAdminSunnahs, useAdminGroups } from "@/hooks/useAdmin";
import type { Sunnah } from "@/hooks/useSunnahs";
import type { Group } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
  Search,
  Activity,
} from "lucide-react";

export default function SunnahsAdmin() {
  const [sunnahs, setSunnahs] = useState<Sunnah[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSunnah, setEditingSunnah] = useState<Sunnah | null>(null);
  const [formData, setFormData] = useState({
    groupId: "",
    shortText: "",
    detailText: "",
    hadithArabic: "",
    hadithTranslation: "",
    hadithSource: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [selectedGroupForReorder, setSelectedGroupForReorder] = useState<string>("");
  const [reorderingSunnahs, setReorderingSunnahs] = useState<Sunnah[]>([]);

  // Arama, filtreleme ve sıralama state'leri
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<"sequence" | "shortText" | "groupId">("sequence");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    getAllSunnahs,
    createSunnah,
    updateSunnah,
    deleteSunnah,
    reorderSunnahs,
    loading: sunnahLoading,
    error: sunnahError,
  } = useAdminSunnahs();

  const { getAllGroups, loading: groupsLoading, error: groupsError } =
    useAdminGroups();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sunnahsData, groupsData] = await Promise.all([
        getAllSunnahs(),
        getAllGroups(),
      ]);
      setSunnahs(sunnahsData);
      setGroups(groupsData);
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    }
  };

  // Sıralama modunu başlat
  const startReorderMode = (groupId?: string) => {
    let listToReorder = [...sunnahs];
    if (groupId && groupId !== "all") {
      setSelectedGroupForReorder(groupId);
      listToReorder = listToReorder.filter((s) => s.groupId === groupId);
    } else {
      setSelectedGroupForReorder("all");
    }

    setReorderingSunnahs(listToReorder.sort((a, b) => a.sequence - b.sequence));
    setIsReorderMode(true);
  };

  // Tüm listeyi 1'den başlayarak yeniden numaralandır
  const reIndexAll = async () => {
    if (!confirm("Tüm sünnet numaraları 1'den başlayarak yeniden düzenlenecektir. Onaylıyor musunuz?")) return;

    try {
      const updates = sunnahs
        .sort((a, b) => {
          // Önce grup sırasına, sonra kendi sırasına göre diz
          const groupA = groups.find(g => g.id === a.groupId)?.order || 0;
          const groupB = groups.find(g => g.id === b.groupId)?.order || 0;
          if (groupA !== groupB) return groupA - groupB;
          return a.sequence - b.sequence;
        })
        .map((sunnah, index) => ({
          id: sunnah.id,
          sequence: index + 1,
        }));

      await reorderSunnahs(updates);
      loadData();
      alert("Tüm kayıtlar başarıyla yeniden numaralandırıldı.");
    } catch (err) {
      console.error("Yeniden indeksleme hatası:", err);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSunnahs = [...reorderingSunnahs];
    [newSunnahs[index - 1], newSunnahs[index]] = [
      newSunnahs[index],
      newSunnahs[index - 1],
    ];
    setReorderingSunnahs(newSunnahs);
  };

  const moveDown = (index: number) => {
    if (index === reorderingSunnahs.length - 1) return;
    const newSunnahs = [...reorderingSunnahs];
    [newSunnahs[index], newSunnahs[index + 1]] = [
      newSunnahs[index + 1],
      newSunnahs[index],
    ];
    setReorderingSunnahs(newSunnahs);
  };

  const saveReorder = async () => {
    try {
      const updates = reorderingSunnahs.map((sunnah, index) => ({
        id: sunnah.id,
        sequence: index + 1,
      }));
      await reorderSunnahs(updates);
      setIsReorderMode(false);
      loadData();
    } catch (err) {
      console.error("Sıralama kaydedilirken hata:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedShortText = formData.shortText.trim();
      const capitalizedShortText = formattedShortText.charAt(0).toUpperCase() + formattedShortText.slice(1);

      const data = {
        ...formData,
        shortText: capitalizedShortText,
        detailText: formData.detailText || null,
        hadithArabic: formData.hadithArabic || null,
        hadithTranslation: formData.hadithTranslation || null,
        hadithSource: formData.hadithSource || null,
      };

      if (editingSunnah) {
        await updateSunnah(editingSunnah.id, data);
      } else {
        await createSunnah({ ...data, sequence: 0 }, true);
      }
      setIsFormOpen(false);
      setEditingSunnah(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error("Kaydetme hatası:", err);
    }
  };

  const handleEdit = (sunnah: Sunnah) => {
    setEditingSunnah(sunnah);
    setFormData({
      groupId: sunnah.groupId,
      shortText: sunnah.shortText,
      detailText: sunnah.detailText || "",
      hadithArabic: sunnah.hadithArabic || "",
      hadithTranslation: sunnah.hadithTranslation || "",
      hadithSource: sunnah.hadithSource || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSunnah(id, true);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      groupId: "",
      shortText: "",
      detailText: "",
      hadithArabic: "",
      hadithTranslation: "",
      hadithSource: "",
    });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSunnah(null);
    resetForm();
  };

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.name || "Bilinmeyen";
  };

  const loading = sunnahLoading || groupsLoading;
  const error = sunnahError || groupsError;

  const filteredAndSortedSunnahs = sunnahs
    .filter((s) => {
      if (filterGroupId !== "all" && s.groupId !== filterGroupId) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.shortText.toLowerCase().includes(query) ||
          (s.detailText?.toLowerCase() || "").includes(query) ||
          (s.hadithArabic?.toLowerCase() || "").includes(query) ||
          (s.hadithTranslation?.toLowerCase() || "").includes(query) ||
          s.sequence.toString().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "sequence":
          comparison = a.sequence - b.sequence;
          break;
        case "shortText":
          comparison = a.shortText.localeCompare(b.shortText);
          break;
        case "groupId":
          const groupA = getGroupName(a.groupId);
          const groupB = getGroupName(b.groupId);
          comparison = groupA.localeCompare(groupB);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <div className="space-y-8 bg-[#FDFBF4] min-h-screen p-4 md:p-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D0]">
        <div>
          <h2 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Sünnet Kayıtları</h2>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Repository Management</p>
        </div>
        {!isFormOpen && !isReorderMode && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => reIndexAll()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E8E0D0] bg-white px-4 py-2.5 text-xs font-bold text-[#2C3E50] transition-all hover:bg-[#FAF7F0] active:scale-95"
              title="Tüm numaraları 1'den başlayarak yeniden düzenler"
            >
              <Activity className="h-3.5 w-3.5 text-[#C9A227]" />
              NUMARALARI DÜZELT
            </button>
            <button
              onClick={() => startReorderMode("all")}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E8E0D0] bg-white px-4 py-2.5 text-xs font-bold text-[#2C3E50] transition-all hover:bg-[#FAF7F0] active:scale-95"
            >
              <GripVertical className="h-4 w-4 text-[#0D7377]" />
              GENEL SIRALAMA
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0D7377] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0D7377]/20 transition-all hover:bg-[#095754] active:scale-95"
            >
              <Plus className="h-4 w-4" />
              YENİ SÜNNET
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Form Section */}
      {isFormOpen && (
        <div className="rounded-xl border border-[#E8E0D0] bg-white p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0D7377]"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#2C3E50]">
              {editingSunnah ? "Sünnet Düzenle" : "Sünnet Kayıt"}
            </h3>
            <button onClick={handleCancel} className="text-[#9CA3AF] hover:text-[#2C3E50]">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Kategori *</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Kısa Başlık *</label>
                <input
                  type="text"
                  value={formData.shortText}
                  onChange={(e) => setFormData({ ...formData, shortText: e.target.value })}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  placeholder="örn: Misvak Kullanmak"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Hadis (Arapça)</label>
              <textarea
                value={formData.hadithArabic}
                onChange={(e) => setFormData({ ...formData, hadithArabic: e.target.value })}
                rows={4}
                dir="rtl"
                className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-2xl font-arabic focus:border-[#0D7377] focus:outline-none transition-all"
                placeholder="الحديث بالعربية..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Hadis Meali</label>
                <textarea
                  value={formData.hadithTranslation}
                  onChange={(e) => setFormData({ ...formData, hadithTranslation: e.target.value })}
                  rows={4}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  placeholder="Hadisin Türkçe meali..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Detaylı Açıklama</label>
                <textarea
                  value={formData.detailText}
                  onChange={(e) => setFormData({ ...formData, detailText: e.target.value })}
                  rows={4}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  placeholder="Sünnetin detaylı açıklaması..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Hadis Kaynağı</label>
              <input
                type="text"
                value={formData.hadithSource}
                onChange={(e) => setFormData({ ...formData, hadithSource: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                placeholder="örn: Buhari, Tecrîd, 1/123"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0D7377] text-white py-4 rounded-xl font-bold transition-all hover:bg-[#095754] disabled:opacity-50 shadow-lg shadow-[#0D7377]/20 flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                {loading ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 border border-[#E8E0D0] text-[#2C3E50] font-bold rounded-xl hover:bg-[#FAF7F0] transition-all"
              >
                İPTAL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reorder Mode Section */}
      {isReorderMode && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-[#0D7377] rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50]">Sıralama Düzenleniyor</h3>
                <p className="text-[10px] font-bold text-[#0D7377] uppercase tracking-widest">
                  {selectedGroupForReorder === "all" ? "Tüm Repository" : `${getGroupName(selectedGroupForReorder)} Kategorisi`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveReorder}
                  className="bg-[#0D7377] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#095754] transition-all flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  SIRALAMAYI KAYDET
                </button>
                <button
                  onClick={() => setIsReorderMode(false)}
                  className="border border-[#E8E0D0] text-[#2C3E50] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#FAF7F0] transition-all"
                >
                  İPTAL
                </button>
              </div>
            </div>

            <div className="bg-[#FAF7F0] rounded-lg border border-[#E8E0D0] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#E8E0D0]/30">
                    <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] text-[10px] uppercase w-16">Sıra</th>
                    <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] text-[10px] uppercase">Sünnet</th>
                    <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] text-[10px] uppercase">Kategori</th>
                    <th className="px-6 py-4 text-right font-bold text-[#9CA3AF] text-[10px] uppercase">Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D0]/50">
                  {reorderingSunnahs.map((sunnah, index) => (
                    <tr key={sunnah.id} className="bg-white hover:bg-[#FAF7F0] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#0D7377]">
                        {(index + 1).toString().padStart(3, "0")}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#2C3E50]">
                        {sunnah.shortText}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase bg-[#FAF7F0] px-2 py-1 rounded">
                          {getGroupName(sunnah.groupId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-2 text-[#9CA3AF] hover:text-[#0D7377] disabled:opacity-20 transition-all border border-transparent hover:border-[#E8E0D0] rounded"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === reorderingSunnahs.length - 1}
                            className="p-2 text-[#9CA3AF] hover:text-[#0D7377] disabled:opacity-20 transition-all border border-transparent hover:border-[#E8E0D0] rounded"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* List Section */}
      {!isFormOpen && !isReorderMode && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Repository içinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8E0D0] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[#0D7377] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto items-center">
              <select
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
                className="bg-white border border-[#E8E0D0] px-4 py-2.5 rounded-lg text-sm focus:outline-none min-w-[200px]"
              >
                <option value="all">Tüm Kategoriler</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              {filterGroupId !== "all" && (
                <button
                  onClick={() => startReorderMode(filterGroupId)}
                  className="p-2.5 text-[#0D7377] border border-[#E8E0D0] bg-white rounded-lg hover:bg-[#FAF7F0] transition-colors"
                  title="Bu kategoriyi sırala"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E8E0D0] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm academic-table">
              <thead>
                <tr className="bg-[#FAF7F0]">
                  <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest w-20">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest">Sünnet Kayıt Metni</th>
                  <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest hidden md:table-cell">Kategori</th>
                  <th className="px-6 py-4 text-right font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest w-32">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredAndSortedSunnahs.map((sunnah) => (
                  <tr key={sunnah.id} className="hover:bg-[#FAF7F0]/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-[#0D7377]">
                      {sunnah.sequence.toString().padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#2C3E50]">
                      <div className="flex flex-col gap-1">
                        <span>{sunnah.shortText}</span>
                        <span className="text-[10px] text-[#9CA3AF] font-normal italic">Ref: {sunnah.hadithSource || "Kaynak belirtilmemiş"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-[#6B7280]">
                      <span className="bg-[#F3F4F6] px-2 py-1 rounded text-[10px] font-bold uppercase">{getGroupName(sunnah.groupId)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(sunnah)} className="p-2 text-[#9CA3AF] hover:text-[#0D7377] transition-all"><Pencil className="h-4 w-4" /></button>
                        {deleteConfirm === sunnah.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(sunnah.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteConfirm(null)} className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(sunnah.id)} className="p-2 text-[#9CA3AF] hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
