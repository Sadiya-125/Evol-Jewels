"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Package,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Plus,
  Search,
  Download,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import Button from "@/components/ui/Button";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    name: string;
    slug: string;
    description: string;
    images: string[];
    basePrice: string;
    makingCharges: string;
    gst: string;
    stockQuantity: number;
    categoryId: string;
    isActive: boolean;
    isFeatured: boolean;
  }>({
    name: "",
    slug: "",
    description: "",
    images: [],
    basePrice: "0",
    makingCharges: "0",
    gst: "3",
    stockQuantity: 0,
    categoryId: "",
    isActive: true,
    isFeatured: false,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    images: [] as string[],
    basePrice: "0",
    makingCharges: "0",
    gst: "3",
    stockQuantity: 0,
    categoryId: "",
    isActive: true,
    isFeatured: false,
  });

  const limit = 10;
  const { data, isLoading, refetch } = trpc.admin.getProducts.useQuery({
    limit,
    offset: page * limit,
    search: debouncedSearch || undefined,
  });

  const { data: categoriesData } = trpc.admin.getCategories.useQuery({
    limit: 100,
  });

  const { sortedData, sortConfig, requestSort } = useSortableTable(data?.products);

  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      toast.success("Product Updated");
    },
    onError: () => {
      toast.error("Failed to Update Product");
    },
  });

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setNewProduct({
        name: "",
        slug: "",
        description: "",
        images: [],
        basePrice: "0",
        makingCharges: "0",
        gst: "3",
        stockQuantity: 0,
        categoryId: "",
        isActive: true,
        isFeatured: false,
      });
      toast.success("Product created");
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });

  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Product deleted");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const handleEdit = (product: NonNullable<typeof data>["products"][0]) => {
    setEditingId(product.id);
    setEditValues({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      images: product.images || [],
      basePrice: product.basePrice,
      makingCharges: product.makingCharges || "0",
      gst: product.gst || "3",
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    updateProduct.mutate({
      id: editingId,
      name: editValues.name,
      slug: editValues.slug,
      description: editValues.description || undefined,
      images: editValues.images,
      basePrice: editValues.basePrice,
      makingCharges: editValues.makingCharges,
      gst: editValues.gst,
      stockQuantity: editValues.stockQuantity,
      categoryId: editValues.categoryId,
      isActive: editValues.isActive,
      isFeatured: editValues.isFeatured,
    });
  };

  const handleToggleActive = (id: string, currentValue: boolean) => {
    updateProduct.mutate({ id, isActive: !currentValue });
  };

  const handleToggleFeatured = (id: string, currentValue: boolean) => {
    updateProduct.mutate({ id, isFeatured: !currentValue });
  };

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.slug || !newProduct.categoryId) {
      toast.error("Name, slug, and category are required");
      return;
    }
    createProduct.mutate(newProduct);
  };

  const handleExportCSV = () => {
    if (!data?.products) return;

    const headers = [
      "ID",
      "Name",
      "Slug",
      "Category",
      "Base Price",
      "Making Charges",
      "GST %",
      "Stock",
      "Active",
      "Featured",
      "Created",
    ];
    const rows = data.products.map((p) => [
      p.id,
      p.name,
      p.slug,
      p.categoryName || "",
      p.basePrice,
      p.makingCharges || "0",
      p.gst || "3",
      p.stockQuantity,
      p.isActive ? "Yes" : "No",
      p.isFeatured ? "Yes" : "No",
      new Date(p.createdAt).toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Products</h1>
          <p className="font-sans text-sm text-evol-metallic mt-1">
            Manage your product catalog ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="h-3 w-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-3 w-3 shrink-0" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 text-evol-metallic" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search Products..."
          className="w-full pl-10 pr-4 py-2 border border-evol-grey font-sans text-sm focus:outline-none focus:border-evol-dark-grey"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-evol-grey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-evol-light-grey">
              <tr>
                <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-widest text-evol-metallic">
                  Image
                </th>
                <SortableTableHeader
                  label="Product"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Category"
                  sortKey="categoryName"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Base Price"
                  sortKey="basePrice"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Making"
                  sortKey="makingCharges"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Stock"
                  sortKey="stockQuantity"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
                <SortableTableHeader
                  label="Status"
                  sortKey="isActive"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
                <SortableTableHeader
                  label="Featured"
                  sortKey="isFeatured"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
                <th className="px-4 py-3 text-right font-sans text-xs uppercase tracking-widest text-evol-metallic">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-evol-grey/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-12 bg-evol-light-grey rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-evol-metallic"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                sortedData.map((product) => (
                  <tr key={product.id} className="hover:bg-evol-light-grey/30">
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 bg-evol-light-grey">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-evol-grey">
                            <Package className="h-5 w-5 shrink-0" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm text-evol-dark-grey">
                        {product.name}
                      </span>
                      <p className="font-mono text-xs text-evol-metallic">
                        /{product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm text-evol-metallic">
                        {product.categoryName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm text-evol-dark-grey">
                        {formatCurrency(product.basePrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm text-evol-metallic">
                        {formatCurrency(product.makingCharges || "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "font-sans text-sm",
                          product.stockQuantity < 5
                            ? "text-amber-600"
                            : "text-evol-dark-grey"
                        )}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleToggleActive(product.id, product.isActive)
                        }
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 text-xs font-sans transition-all active:scale-95",
                          product.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-evol-light-grey text-evol-metallic hover:bg-evol-grey/50"
                        )}
                      >
                        {product.isActive ? (
                          <>
                            <Eye className="h-3 w-3 shrink-0" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 shrink-0" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleToggleFeatured(product.id, product.isFeatured)
                        }
                        className={cn(
                          "p-1 transition-all active:scale-90",
                          product.isFeatured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-evol-grey hover:text-evol-metallic"
                        )}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5 shrink-0",
                            product.isFeatured && "fill-current"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-evol-metallic hover:text-evol-dark-grey hover:bg-evol-light-grey transition-colors"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                        </button>
                        <DeleteConfirmDialog
                          trigger={
                            <button
                              disabled={deleteProduct.isPending}
                              className="p-1 text-evol-metallic hover:text-evol-red hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                            </button>
                          }
                          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                          onConfirm={() =>
                            deleteProduct.mutate({ id: product.id })
                          }
                          isPending={deleteProduct.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-evol-light-grey border-t border-evol-grey flex items-center justify-between">
            <span className="font-sans text-sm text-evol-metallic">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-evol-dark-grey">
                Add New Product
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={newProduct.slug}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="product-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
                  placeholder="Product description"
                />
              </div>

              <MultiImageUpload
                value={newProduct.images}
                onChange={(urls) =>
                  setNewProduct({ ...newProduct, images: urls })
                }
                folder="evol-products"
                label="Product Images"
                maxImages={6}
              />

              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Category *
                </label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
                >
                  <option value="">Select category</option>
                  {categoriesData?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Base Price
                  </label>
                  <input
                    type="text"
                    value={newProduct.basePrice}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, basePrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Making Charges
                  </label>
                  <input
                    type="text"
                    value={newProduct.makingCharges}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        makingCharges: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    GST %
                  </label>
                  <input
                    type="text"
                    value={newProduct.gst}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, gst: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isActive}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm text-evol-dark-grey">
                    Active
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isFeatured}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm text-evol-dark-grey">
                    Featured
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateProduct}
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-evol-dark-grey">
                Edit Product
              </h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
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
                    value={editValues.slug}
                    onChange={(e) =>
                      setEditValues({ ...editValues, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Description
                </label>
                <textarea
                  value={editValues.description}
                  onChange={(e) =>
                    setEditValues({ ...editValues, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey resize-none"
                />
              </div>

              <MultiImageUpload
                value={editValues.images}
                onChange={(urls) =>
                  setEditValues({ ...editValues, images: urls })
                }
                folder="evol-products"
                label="Product Images"
                maxImages={6}
              />

              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Category *
                </label>
                <select
                  value={editValues.categoryId}
                  onChange={(e) =>
                    setEditValues({ ...editValues, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
                >
                  <option value="">Select category</option>
                  {categoriesData?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Base Price
                  </label>
                  <input
                    type="text"
                    value={editValues.basePrice}
                    onChange={(e) =>
                      setEditValues({ ...editValues, basePrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Making Charges
                  </label>
                  <input
                    type="text"
                    value={editValues.makingCharges}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        makingCharges: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    GST %
                  </label>
                  <input
                    type="text"
                    value={editValues.gst}
                    onChange={(e) =>
                      setEditValues({ ...editValues, gst: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={editValues.stockQuantity}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editValues.isActive}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm text-evol-dark-grey">
                    Active
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editValues.isFeatured}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm text-evol-dark-grey">
                    Featured
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? "Saving..." : "Save Changes"}
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
