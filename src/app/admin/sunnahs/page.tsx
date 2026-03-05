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
  const startReorderMode = (groupId: string) => {
    setSelectedGroupForReorder(groupId);
    const groupSunnahs = sunnahs
      .filter((s) => s.groupId === groupId)
      .sort((a, b) => a.sequence - b.sequence);
    setReorderingSunnahs(groupSunnahs);
    setIsReorderMode(true);
  };

  // Yukarı taşı
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSunnahs = [...reorderingSunnahs];
    [newSunnahs[index - 1], newSunnahs[index]] = [
      newSunnahs[index],
      newSunnahs[index - 1],
    ];
    setReorderingSunnahs(newSunnahs);
  };

  // Aşağı taşı
  const moveDown = (index: number) => {
    if (index === reorderingSunnahs.length - 1) return;
    const newSunnahs = [...reorderingSunnahs];
    [newSunnahs[index], newSunnahs[index + 1]] = [
      newSunnahs[index + 1],
      newSunnahs[index],
    ];
    setReorderingSunnahs(newSunnahs);
  };

  // Sıralamayı kaydet
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
      const data = {
        ...formData,
        detailText: formData.detailText || null,
        hadithArabic: formData.hadithArabic || null,
        hadithTranslation: formData.hadithTranslation || null,
        hadithSource: formData.hadithSource || null,
      };

      if (editingSunnah) {
        await updateSunnah(editingSunnah.id, data);
      } else {
        // Sıra numarası otomatik atanacak (0 geçici değer)
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
      await deleteSunnah(id);
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

  // Filtreleme ve sıralama mantığı
  const filteredAndSortedSunnahs = sunnahs
    .filter((s) => {
      // Grup filtresi
      if (filterGroupId !== "all" && s.groupId !== filterGroupId) {
        return false;
      }
      // Arama filtresi
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
      // Sıralama mantığı
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sünnetler</h2>
          <p className="text-sm text-slate-600">Sünnetleri yönetin</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Sünnet
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {editingSunnah ? "Sünnet Düzenle" : "Yeni Sünnet"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kategori *
              </label>
              <select
                value={formData.groupId}
                onChange={(e) =>
                  setFormData({ ...formData, groupId: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Kategori Seçin</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[#6B7280]">
                Sıra numarası otomatik atanacaktır.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kısa Başlık *
              </label>
              <input
                type="text"
                value={formData.shortText}
                onChange={(e) =>
                  setFormData({ ...formData, shortText: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="örn: Misvak Kullanmak"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Detaylı Açıklama
              </label>
              <textarea
                value={formData.detailText}
                onChange={(e) =>
                  setFormData({ ...formData, detailText: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Sünnetin detaylı açıklaması..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Hadis (Arapça)
              </label>
              <textarea
                value={formData.hadithArabic}
                onChange={(e) =>
                  setFormData({ ...formData, hadithArabic: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                dir="rtl"
                placeholder="الحديث بالعربية..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Hadis Meali
              </label>
              <textarea
                value={formData.hadithTranslation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hadithTranslation: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Hadisin Türkçe meali..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Hadis Kaynağı
              </label>
              <input
                type="text"
                value={formData.hadithSource}
                onChange={(e) =>
                  setFormData({ ...formData, hadithSource: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="örn: Buhari, Tecrîd, 1/123"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sıralama Modu */}
      {isReorderMode ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Sıralama Düzenle
            </h3>
            <div className="flex gap-2">
              <button
                onClick={saveReorder}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Kaydet
              </button>
              <button
                onClick={() => setIsReorderMode(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                İptal
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {reorderingSunnahs.map((sunnah, index) => (
              <div
                key={sunnah.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <GripVertical className="h-5 w-5 text-slate-400" />
                <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {sunnah.shortText}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="rounded-lg p-2 text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30"
                    title="Yukarı taşı"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === reorderingSunnahs.length - 1}
                    className="rounded-lg p-2 text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30"
                    title="Aşağı taşı"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Arama ve Filtreleme Çubuğu */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Sünnetlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Filtrele:</span>
              <select
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tüm Kategoriler</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategori bazlı sıralama butonları */}
          {!isReorderMode && (
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const groupSunnahsCount = sunnahs.filter(
                  (s) => s.groupId === group.id
                ).length;
                if (groupSunnahsCount < 2) return null;
                return (
                  <button
                    key={group.id}
                    onClick={() => startReorderMode(group.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    title={`${group.name} kategorisinde manuel sıralama yap`}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                    {group.name} Sıralaması
                  </button>
                );
              })}
            </div>
          )}

          {/* Liste */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    className="cursor-pointer select-none px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      if (sortColumn === "sequence") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortColumn("sequence");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Sıra
                      {sortColumn === "sequence" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer select-none px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      if (sortColumn === "shortText") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortColumn("shortText");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Başlık
                      {sortColumn === "shortText" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </th>
                  <th
                    className="hidden cursor-pointer select-none px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors sm:table-cell"
                    onClick={() => {
                      if (sortColumn === "groupId") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortColumn("groupId");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Kategori
                      {sortColumn === "groupId" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedSunnahs.map((sunnah) => (
                  <tr key={sunnah.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{sunnah.sequence}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 leading-tight">
                      {sunnah.shortText}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {getGroupName(sunnah.groupId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(sunnah)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors"
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirm === sunnah.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(sunnah.id)}
                              className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                              title="Onayla"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                              title="İptal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(sunnah.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedSunnahs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertCircle className="mb-2 h-8 w-8 text-slate-300" />
                        <p className="font-medium">Sonuç bulunamadı</p>
                        <p className="text-xs">Arama kriterlerinizi veya filtrenizi kontrol edin.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
