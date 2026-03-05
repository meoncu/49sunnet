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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Kategoriler</h2>
          <p className="text-sm text-slate-600">
            Sünnet kategorilerini yönetin
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori
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
            {editingGroup ? "Kategori Düzenle" : "Yeni Kategori"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kategori Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="örn: Sabah Sünnetleri"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sıra Numarası
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
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

      {/* Liste */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Sıra
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Kategori Adı
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{group.order}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {group.name}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(group)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"
                      title="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteConfirm === group.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                          title="Onayla"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="İptal"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(group.id)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
