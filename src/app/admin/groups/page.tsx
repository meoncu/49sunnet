"use client";

import { useEffect, useState } from "react";
import { useAdminGroups } from "@/hooks/useAdmin";
import type { Group } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

export default function GroupsAdmin() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    parentGroupId: null as string | null,
    order: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { getAllGroups, createGroup, updateGroup, deleteGroup, loading, error } =
    useAdminGroups();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getAllGroups();
      setGroups(data);
    } catch (err) {
      console.error("Kategoriler yüklenirken hata:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData);
      } else {
        await createGroup(formData);
      }
      setIsFormOpen(false);
      setEditingGroup(null);
      setFormData({ name: "", parentGroupId: null, order: 0 });
      loadGroups();
    } catch (err) {
      console.error("Kaydetme hatası:", err);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      parentGroupId: group.parentGroupId,
      order: group.order,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id);
      setDeleteConfirm(null);
      loadGroups();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
    setFormData({ name: "", parentGroupId: null, order: 0 });
  };

  return (
    <div className="space-y-8 bg-[#FDFBF4] min-h-screen p-4 md:p-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D0]">
        <div>
          <h2 className="text-2xl font-bold text-[#2C3E50] tracking-tight">Kategori Yönetimi</h2>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Classification Engine</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0D7377] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#0D7377]/20 transition-all hover:bg-[#095754]"
          >
            <Plus className="h-4 w-4" />
            Yeni Kategori
          </button>
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
              {editingGroup ? "Kategori Düzenle" : "Kategori Kayıt"}
            </h3>
            <button onClick={handleCancel} className="text-[#9CA3AF] hover:text-[#2C3E50]">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Kategori Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  placeholder="örn: Sabah Sünnetleri"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Sıra Numarası</label>
                <input
                  type="number"
                  value={Number.isNaN(formData.order) ? "" : formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm focus:border-[#0D7377] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0D7377] text-white py-4 rounded-xl font-bold transition-all hover:bg-[#095754] disabled:opacity-50 shadow-lg shadow-[#0D7377]/20 flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
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

      {/* List Section */}
      {!isFormOpen && (
        <div className="bg-white border border-[#E8E0D0] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm academic-table">
            <thead>
              <tr className="bg-[#FAF7F0]">
                <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest w-24">SIRA</th>
                <th className="px-6 py-4 text-left font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest">KATEGORİ TANIMI</th>
                <th className="px-6 py-4 text-right font-bold text-[#9CA3AF] uppercase text-[10px] tracking-widest w-32">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-[#FAF7F0]/50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-[#0D7377]">
                    {group.order.toString().padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#2C3E50]">
                    {group.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(group)} className="p-2 text-[#9CA3AF] hover:text-[#0D7377] transition-all"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteConfirm(group.id)} className="p-2 text-[#9CA3AF] hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#9CA3AF]">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      <p className="font-medium">Henüz kategori eklenmemiş.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
