"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

export default function AdminBaseVariantsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    goldKarat: "18K",
    goldColor: "Yellow",
    goldWeight: 0,
    isCustomizable: false,
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getBaseVariants.useQuery({ limit: 50 });

  const { sortedData, sortConfig, requestSort } = useSortableTable(data?.variants);

  const createMutation = trpc.admin.createBaseVariant.useMutation({
    onSuccess: () => {
      toast.success("Base variant created");
      utils.admin.getBaseVariants.invalidate();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.updateBaseVariant.useMutation({
    onSuccess: () => {
      toast.success("Base variant updated");
      utils.admin.getBaseVariants.invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteBaseVariant.useMutation({
    onSuccess: () => {
      toast.success("Base variant deleted");
      utils.admin.getBaseVariants.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      goldKarat: "18K",
      goldColor: "Yellow",
      goldWeight: 0,
      isCustomizable: false,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.goldKarat || !formData.goldColor) {
      toast.error("Name, karat, and color are required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, ...formData });
  };

  const startEdit = (variant: any) => {
    setEditingId(variant.id);
    setFormData({
      name: variant.name,
      goldKarat: variant.goldKarat,
      goldColor: variant.goldColor,
      goldWeight: variant.goldWeight || 0,
      isCustomizable: variant.isCustomizable || false,
    });
  };

  const karatOptions = ["14K", "18K", "22K", "24K"];
  const colorOptions = ["Yellow", "White", "Rose"];

  const handleExportCSV = () => {
    if (!data?.variants.length) {
      toast.error("No variants to export");
      return;
    }
    const csvContent = [
      ["Name", "Gold Karat", "Gold Color", "Gold Weight (mg)", "Customizable"].join(","),
      ...data.variants.map((v) =>
        [
          v.name,
          v.goldKarat,
          v.goldColor,
          v.goldWeight || "",
          v.isCustomizable ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `base-variants-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-evol-light-grey rounded w-48" />
        <div className="h-64 bg-evol-light-grey rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Base Variants</h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage gold variant templates ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="w-3 h-3 shrink-0" />
            Add Variant
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-evol-light-grey border border-evol-grey p-6 space-y-4">
          <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">New Base Variant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="e.g., 18K Yellow Gold Standard"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Gold Weight (mg)</label>
              <input
                type="number"
                value={formData.goldWeight}
                onChange={(e) => setFormData({ ...formData, goldWeight: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="Weight in milligrams"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Gold Karat *</label>
              <select
                value={formData.goldKarat}
                onChange={(e) => setFormData({ ...formData, goldKarat: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                {karatOptions.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Gold Color *</label>
              <select
                value={formData.goldColor}
                onChange={(e) => setFormData({ ...formData, goldColor: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                {colorOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCustomizable}
                  onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-body text-sm text-evol-dark-grey">Customizable</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => {
              setIsCreating(false);
              resetForm();
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Variants Table */}
      <div className="bg-white border border-evol-grey overflow-x-auto">
        <table className="w-full">
          <thead className="bg-evol-light-grey">
            <tr>
              <SortableTableHeader
                label="Name"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={requestSort}
                align="left"
              />
              <SortableTableHeader
                label="Karat"
                sortKey="goldKarat"
                sortConfig={sortConfig}
                onSort={requestSort}
                align="left"
              />
              <SortableTableHeader
                label="Color"
                sortKey="goldColor"
                sortConfig={sortConfig}
                onSort={requestSort}
                align="left"
              />
              <SortableTableHeader
                label="Weight"
                sortKey="goldWeight"
                sortConfig={sortConfig}
                onSort={requestSort}
                align="left"
              />
              <SortableTableHeader
                label="Custom"
                sortKey="isCustomizable"
                sortConfig={sortConfig}
                onSort={requestSort}
                align="left"
              />
              <th className="px-6 py-3 text-right font-sans text-xs uppercase tracking-wider text-evol-metallic">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-evol-grey">
            {sortedData.map((variant) => (
              <tr key={variant.id} className="hover:bg-evol-light-grey/50">
                {editingId === variant.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-evol-grey font-body text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={formData.goldKarat}
                        onChange={(e) => setFormData({ ...formData, goldKarat: e.target.value })}
                        className="px-2 py-1 border border-evol-grey font-body text-sm bg-white"
                      >
                        {karatOptions.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={formData.goldColor}
                        onChange={(e) => setFormData({ ...formData, goldColor: e.target.value })}
                        className="px-2 py-1 border border-evol-grey font-body text-sm bg-white"
                      >
                        {colorOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <input
                        type="number"
                        value={formData.goldWeight}
                        onChange={(e) => setFormData({ ...formData, goldWeight: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-evol-grey font-body text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <input
                        type="checkbox"
                        checked={formData.isCustomizable}
                        onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleUpdate(variant.id)}
                        disabled={updateMutation.isPending}
                        className="p-1 text-green-600 hover:bg-green-50 rounded mr-2"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-sans text-sm text-evol-dark-grey">{variant.name}</td>
                    <td className="px-6 py-4 font-body text-sm text-evol-metallic">{variant.goldKarat}</td>
                    <td className="px-6 py-4 font-body text-sm text-evol-metallic">{variant.goldColor}</td>
                    <td className="px-6 py-4 font-body text-sm text-evol-metallic hidden md:table-cell">
                      {variant.goldWeight ? `${variant.goldWeight} mg` : "-"}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`inline-block w-3 h-3 rounded-full ${variant.isCustomizable ? "bg-green-500" : "bg-evol-grey"}`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => startEdit(variant)}
                        className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded mr-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <DeleteConfirmDialog
                        trigger={
                          <button
                            disabled={deleteMutation.isPending}
                            className="p-1 text-evol-red hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        }
                        description={`Delete "${variant.name}"? This may affect product variants.`}
                        onConfirm={() => deleteMutation.mutate({ id: variant.id })}
                        isPending={deleteMutation.isPending}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
            {data?.variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-evol-metallic font-body text-sm">
                  No base variants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
