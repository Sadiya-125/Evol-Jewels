"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Gem, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

export default function AdminStoneSpecsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    stoneType: "",
    stoneQuality: "",
    stoneColor: "",
    stoneWeight: "",
    stoneCount: 1,
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getStoneSpecifications.useQuery({ limit: 50 });

  const createMutation = trpc.admin.createStoneSpecification.useMutation({
    onSuccess: () => {
      toast.success("Stone specification created");
      utils.admin.getStoneSpecifications.invalidate();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.updateStoneSpecification.useMutation({
    onSuccess: () => {
      toast.success("Stone specification updated");
      utils.admin.getStoneSpecifications.invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteStoneSpecification.useMutation({
    onSuccess: () => {
      toast.success("Stone specification deleted");
      utils.admin.getStoneSpecifications.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      stoneType: "",
      stoneQuality: "",
      stoneColor: "",
      stoneWeight: "",
      stoneCount: 1,
    });
  };

  const handleCreate = () => {
    if (!formData.stoneType) {
      toast.error("Stone type is required");
      return;
    }
    createMutation.mutate({
      ...formData,
      stoneCount: formData.stoneCount || undefined,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      ...formData,
      stoneCount: formData.stoneCount || undefined,
    });
  };

  const startEdit = (spec: any) => {
    setEditingId(spec.id);
    setFormData({
      stoneType: spec.stoneType,
      stoneQuality: spec.stoneQuality || "",
      stoneColor: spec.stoneColor || "",
      stoneWeight: spec.stoneWeight || "",
      stoneCount: spec.stoneCount || 1,
    });
  };

  const stoneTypes = ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Moissanite", "Other"];
  const qualityGrades = ["VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

  const handleExportCSV = () => {
    if (!data?.specifications.length) {
      toast.error("No stone specifications to export");
      return;
    }
    const csvContent = [
      ["Stone Type", "Quality", "Color", "Weight (ct)", "Count"].join(","),
      ...data.specifications.map((s) =>
        [
          s.stoneType,
          s.stoneQuality || "",
          s.stoneColor || "",
          s.stoneWeight || "",
          s.stoneCount || "",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stone-specifications-${new Date().toISOString().split("T")[0]}.csv`;
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
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Stone Specifications</h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage stone specification templates ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="w-3 h-3 shrink-0" />
            Add Stone Spec
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-evol-light-grey border border-evol-grey p-6 space-y-4">
          <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">New Stone Specification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Stone Type *</label>
              <select
                value={formData.stoneType}
                onChange={(e) => setFormData({ ...formData, stoneType: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                <option value="">Select type</option>
                {stoneTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Quality Grade</label>
              <select
                value={formData.stoneQuality}
                onChange={(e) => setFormData({ ...formData, stoneQuality: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                <option value="">Select quality</option>
                {qualityGrades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Color</label>
              <input
                type="text"
                value={formData.stoneColor}
                onChange={(e) => setFormData({ ...formData, stoneColor: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="e.g., D, E, F or Blue, Red"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Weight (ct)</label>
              <input
                type="text"
                value={formData.stoneWeight}
                onChange={(e) => setFormData({ ...formData, stoneWeight: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="e.g., 0.5, 1.0"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Stone Count</label>
              <input
                type="number"
                min="1"
                value={formData.stoneCount}
                onChange={(e) => setFormData({ ...formData, stoneCount: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
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

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.specifications.map((spec) => (
          <div key={spec.id} className="bg-white border border-evol-grey p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-evol-red" />
                <h3 className="font-sans text-lg font-semibold text-evol-dark-grey">{spec.stoneType}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(spec)}
                  className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
                >
                  <Pencil className="w-4 h-4 shrink-0" />
                </button>
                <DeleteConfirmDialog
                  trigger={
                    <button className="p-1 text-evol-red hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  }
                  description={`Delete this ${spec.stoneType} stone specification?`}
                  onConfirm={() => deleteMutation.mutate({ id: spec.id })}
                  isPending={deleteMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-1 font-body text-sm text-evol-metallic">
              {spec.stoneQuality && (
                <p><span className="text-evol-dark-grey">Quality:</span> {spec.stoneQuality}</p>
              )}
              {spec.stoneColor && (
                <p><span className="text-evol-dark-grey">Color:</span> {spec.stoneColor}</p>
              )}
              {spec.stoneWeight && (
                <p><span className="text-evol-dark-grey">Weight:</span> {spec.stoneWeight} ct</p>
              )}
              {spec.stoneCount && (
                <p><span className="text-evol-dark-grey">Count:</span> {spec.stoneCount}</p>
              )}
            </div>
          </div>
        ))}
        {data?.specifications.length === 0 && (
          <div className="col-span-full text-center py-8 text-evol-metallic font-body">
            No stone specifications found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                Edit Stone Specification
              </h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Stone Type *</label>
                <select
                  value={formData.stoneType}
                  onChange={(e) => setFormData({ ...formData, stoneType: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
                >
                  <option value="">Select type</option>
                  {stoneTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Quality Grade</label>
                <select
                  value={formData.stoneQuality}
                  onChange={(e) => setFormData({ ...formData, stoneQuality: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
                >
                  <option value="">Select quality</option>
                  {qualityGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Color</label>
                <input
                  type="text"
                  value={formData.stoneColor}
                  onChange={(e) => setFormData({ ...formData, stoneColor: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  placeholder="e.g., D, E"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Weight (ct)</label>
                <input
                  type="text"
                  value={formData.stoneWeight}
                  onChange={(e) => setFormData({ ...formData, stoneWeight: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  placeholder="e.g., 0.5"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Count</label>
                <input
                  type="number"
                  min="1"
                  value={formData.stoneCount}
                  onChange={(e) => setFormData({ ...formData, stoneCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdate(editingId)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
