"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Download, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminCollectionsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    coverImageUrl: null as string | null,
    accentColor: "",
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getCollections.useQuery({ limit: 50 });

  const createMutation = trpc.admin.createCollection.useMutation({
    onSuccess: () => {
      toast.success("Collection created");
      utils.admin.getCollections.invalidate();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.updateCollection.useMutation({
    onSuccess: () => {
      toast.success("Collection updated");
      utils.admin.getCollections.invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteCollection.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted");
      utils.admin.getCollections.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      description: "",
      coverImageUrl: null,
      accentColor: "",
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      tagline: formData.tagline || undefined,
      description: formData.description || undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
      accentColor: formData.accentColor || undefined,
      displayOrder: formData.displayOrder,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      name: formData.name,
      slug: formData.slug,
      tagline: formData.tagline || undefined,
      description: formData.description || undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
      accentColor: formData.accentColor || undefined,
      displayOrder: formData.displayOrder,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const toggleFeatured = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isFeatured: !currentStatus });
  };

  const startEdit = (collection: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    coverImageUrl: string | null;
    accentColor: string | null;
    displayOrder: number;
    isActive: boolean;
    isFeatured: boolean;
  }) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      tagline: collection.tagline || "",
      description: collection.description || "",
      coverImageUrl: collection.coverImageUrl,
      accentColor: collection.accentColor || "",
      displayOrder: collection.displayOrder,
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleExportCSV = () => {
    if (!data?.collections.length) {
      toast.error("No collections to export");
      return;
    }
    const csvContent = [
      ["Name", "Slug", "Tagline", "Description", "Cover Image", "Accent Color", "Display Order", "Active", "Featured"].join(","),
      ...data.collections.map((c) =>
        [
          c.name,
          c.slug,
          `"${(c.tagline || "").replace(/"/g, '""')}"`,
          `"${(c.description || "").replace(/"/g, '""')}"`,
          c.coverImageUrl || "",
          c.accentColor || "",
          c.displayOrder,
          c.isActive ? "Yes" : "No",
          c.isFeatured ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collections-${new Date().toISOString().split("T")[0]}.csv`;
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
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Collections</h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage product collections ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="w-3 h-3 shrink-0" />
            Add Collection
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-evol-light-grey border border-evol-grey p-6 space-y-4">
          <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">New Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="Collection name"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="collection-slug"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-sm text-evol-dark-grey mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              placeholder="Short tagline"
            />
          </div>
          <div>
            <label className="block font-sans text-sm text-evol-dark-grey mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
              rows={3}
              placeholder="Collection description"
            />
          </div>
          <ImageUpload
            value={formData.coverImageUrl}
            onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
            folder="evol-collections"
            label="Cover Image"
            aspectRatio="landscape"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.accentColor || "#9F0B10"}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-10 border border-evol-grey cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="font-body text-sm text-evol-dark-grey">
                Active (visible on site)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isFeatured" className="font-body text-sm text-evol-dark-grey">
                Featured
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setIsCreating(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.collections.map((collection) => (
          <div
            key={collection.id}
            className={`bg-white border border-evol-grey overflow-hidden ${!collection.isActive ? "opacity-60" : ""}`}
          >
            {/* Cover Image */}
            <div className="relative h-40 bg-evol-light-grey">
              {collection.coverImageUrl ? (
                <Image
                  src={collection.coverImageUrl}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-evol-metallic text-sm">
                  No cover image
                </div>
              )}
              {collection.isFeatured && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 text-xs font-sans flex items-center gap-1">
                  <Star className="w-3 h-3 shrink-0 fill-current" />
                  Featured
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-sans text-lg font-semibold text-evol-dark-grey">{collection.name}</h3>
                  <p className="font-mono text-xs text-evol-metallic">/{collection.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleFeatured(collection.id, collection.isFeatured)}
                    className={`p-1 rounded transition-all active:scale-90 ${
                      collection.isFeatured
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-evol-metallic hover:bg-evol-light-grey"
                    }`}
                    title={collection.isFeatured ? "Unfeature collection" : "Feature collection"}
                  >
                    <Star className={`w-4 h-4 shrink-0 ${collection.isFeatured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => toggleActive(collection.id, collection.isActive)}
                    className={`p-1 rounded transition-all active:scale-90 ${
                      collection.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-evol-metallic hover:bg-evol-light-grey"
                    }`}
                    title={collection.isActive ? "Hide collection" : "Show collection"}
                  >
                    {collection.isActive ? (
                      <Eye className="w-4 h-4 shrink-0" />
                    ) : (
                      <EyeOff className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(collection)}
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
                    description={`Delete "${collection.name}"? This will also remove all product associations.`}
                    onConfirm={() => deleteMutation.mutate({ id: collection.id })}
                    isPending={deleteMutation.isPending}
                  />
                </div>
              </div>
              {collection.tagline && (
                <p className="font-body text-sm text-evol-dark-grey mb-2 italic">{collection.tagline}</p>
              )}
              {collection.description && (
                <p className="font-body text-sm text-evol-metallic line-clamp-2">{collection.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-evol-metallic">
                <span>Order: {collection.displayOrder}</span>
                {collection.accentColor && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: collection.accentColor }}
                    />
                    {collection.accentColor}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {data?.collections.length === 0 && (
          <div className="col-span-full text-center py-8 text-evol-metallic font-body">
            No collections found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                Edit Collection
              </h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
                rows={3}
              />
            </div>

            <ImageUpload
              value={formData.coverImageUrl}
              onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
              folder="evol-collections"
              label="Cover Image"
              aspectRatio="landscape"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor || "#9F0B10"}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 border border-evol-grey cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="editIsActive" className="font-body text-sm text-evol-dark-grey">
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="editIsFeatured" className="font-body text-sm text-evol-dark-grey">
                  Featured
                </label>
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
