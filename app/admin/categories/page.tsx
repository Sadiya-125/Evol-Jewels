"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminCategoriesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null as string | null,
    isActive: true,
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getCategories.useQuery({ limit: 50 });

  const createMutation = trpc.admin.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created");
      utils.admin.getCategories.invalidate();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category Updated");
      utils.admin.getCategories.invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted");
      utils.admin.getCategories.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      isActive: true,
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
      description: formData.description || undefined,
      image: formData.image || undefined,
      isActive: formData.isActive,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      image: formData.image || undefined,
      isActive: formData.isActive,
    });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const startEdit = (category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
  }) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image,
      isActive: category.isActive,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleExportCSV = () => {
    if (!data?.categories.length) {
      toast.error("No categories to export");
      return;
    }
    const csvContent = [
      ["Name", "Slug", "Description", "Image", "Active"].join(","),
      ...data.categories.map((c) =>
        [
          c.name,
          c.slug,
          `"${(c.description || "").replace(/"/g, '""')}"`,
          c.image || "",
          c.isActive ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories-${new Date().toISOString().split("T")[0]}.csv`;
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
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">
            Categories
          </h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage product categories ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 shrink-0 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-evol-light-grey border border-evol-grey p-6 space-y-4">
          <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
            New Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Name *
              </label>
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
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="category-slug"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-sm text-evol-dark-grey mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            folder="evol-categories"
            label="Category Image"
            aspectRatio="landscape"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="isActive"
              className="font-body text-sm text-evol-dark-grey"
            >
              Active (visible on site)
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white border border-evol-grey overflow-hidden ${
              !category.isActive ? "opacity-60" : ""
            }`}
          >
            {/* Image */}
            <div className="relative h-40 bg-evol-light-grey">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-evol-metallic text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-sans text-lg font-semibold text-evol-dark-grey">
                    {category.name}
                  </h3>
                  <p className="font-mono text-xs text-evol-metallic">
                    /{category.slug}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleActive(category.id, category.isActive)}
                    className={`p-1 rounded transition-all active:scale-90 ${
                      category.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-evol-metallic hover:bg-evol-light-grey"
                    }`}
                    title={
                      category.isActive ? "Hide category" : "Show category"
                    }
                  >
                    {category.isActive ? (
                      <Eye className="w-4 h-4 shrink-0" />
                    ) : (
                      <EyeOff className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
                  >
                    <Pencil className="w-4 h-4 shrink-0" />
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
                    description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
                    onConfirm={() => deleteMutation.mutate({ id: category.id })}
                    isPending={deleteMutation.isPending}
                  />
                </div>
              </div>
              {category.description && (
                <p className="font-body text-sm text-evol-metallic line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        ))}
        {data?.categories.length === 0 && (
          <div className="col-span-full text-center py-8 text-evol-metallic font-body">
            No categories found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                Edit Category
              </h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
                rows={3}
              />
            </div>

            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="evol-categories"
              label="Category Image"
              aspectRatio="landscape"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label
                htmlFor="editIsActive"
                className="font-body text-sm text-evol-dark-grey"
              >
                Active (visible on site)
              </label>
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
