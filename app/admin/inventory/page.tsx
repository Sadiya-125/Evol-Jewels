"use client";

import { useState } from "react";
import {
  Filter,
  AlertTriangle,
  Pencil,
  Download,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

export default function AdminInventoryPage() {
  const [page, setPage] = useState(0);
  const [storeFilter, setStoreFilter] = useState<string>("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ quantity: 0, reservedQuantity: 0, price: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInventory, setNewInventory] = useState({
    storeId: "",
    productVariantId: "",
    quantity: 0,
    reservedQuantity: 0,
    price: "",
  });

  const limit = 15;
  const { data, isLoading, refetch } = trpc.admin.getInventory.useQuery({
    limit,
    offset: page * limit,
    storeId: storeFilter || undefined,
    lowStock: lowStockOnly || undefined,
  });

  const { data: stores } = trpc.admin.getStores.useQuery();
  const { data: productVariants } = trpc.admin.getProductVariants.useQuery({ limit: 100 });

  const { sortedData, sortConfig, requestSort } = useSortableTable(data?.items);

  const createInventory = trpc.admin.createInventory.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setNewInventory({ storeId: "", productVariantId: "", quantity: 0, reservedQuantity: 0, price: "" });
      toast.success("Inventory item created");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateInventory = trpc.admin.updateInventory.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      toast.success("Inventory updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteInventory = trpc.admin.deleteInventory.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Inventory item deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleEdit = (item: { id: string; quantity: number; reservedQuantity: number; price: string | null; variantPrice?: string | null }) => {
    setEditingId(item.id);
    setEditValues({ quantity: item.quantity, reservedQuantity: item.reservedQuantity, price: item.price || item.variantPrice || "" });
  };

  const handleSave = () => {
    if (!editingId) return;
    updateInventory.mutate({
      id: editingId,
      quantity: editValues.quantity,
      reservedQuantity: editValues.reservedQuantity,
      price: editValues.price || undefined,
    });
  };

  const handleCreate = () => {
    if (!newInventory.storeId || !newInventory.productVariantId) {
      toast.error("Store and product variant are required");
      return;
    }
    createInventory.mutate(newInventory);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleExportCSV = () => {
    if (!data?.items.length) {
      toast.error("No inventory items to export");
      return;
    }
    const csvContent = [
      ["Product", "Variant", "SKU", "Store", "Price", "Quantity", "Reserved", "Status"].join(","),
      ...data.items.map((item) =>
        [
          `"${(item.productName || "").replace(/"/g, '""')}"`,
          item.baseVariantName || "",
          item.variantSku || "",
          item.storeName || "",
          item.price || item.variantPrice || "",
          item.quantity,
          item.reservedQuantity,
          item.quantity === 0 ? "Out of Stock" : item.quantity < 5 ? "Low Stock" : "In Stock",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Inventory</h1>
          <p className="font-sans text-sm text-evol-metallic mt-1">
            Track and manage stock levels ({data?.total || 0} items)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-3 h-3 shrink-0" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-evol-metallic" />
          <select
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-evol-grey font-sans text-sm bg-white focus:outline-none focus:border-evol-dark-grey"
          >
            <option value="">All Stores</option>
            {stores?.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.city})
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(0);
            }}
            className="w-4 h-4"
          />
          <span className="font-sans text-sm text-evol-dark-grey flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            Low Stock Only
          </span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white border border-evol-grey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-evol-light-grey">
              <tr>
                <SortableTableHeader
                  label="Product"
                  sortKey="productName"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Variant"
                  sortKey="baseVariantName"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="SKU"
                  sortKey="variantSku"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Store"
                  sortKey="storeName"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Price"
                  sortKey="price"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="right"
                />
                <SortableTableHeader
                  label="Qty"
                  sortKey="quantity"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
                <SortableTableHeader
                  label="Reserved"
                  sortKey="reservedQuantity"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
                <th className="px-4 py-3 text-center font-sans text-xs uppercase tracking-widest text-evol-metallic">
                  Status
                </th>
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
                      <div className="h-6 bg-evol-light-grey rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-evol-metallic">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-evol-light-grey/30",
                      item.quantity < 5 && "bg-amber-50/50"
                    )}
                  >
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm text-evol-dark-grey">
                        {item.productName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm text-evol-metallic">
                        {item.baseVariantName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-evol-metallic">
                        {item.variantSku || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm text-evol-metallic">
                        {item.storeName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          placeholder="Price"
                          value={editValues.price}
                          onChange={(e) =>
                            setEditValues({ ...editValues, price: e.target.value })
                          }
                          className="w-24 px-2 py-1 text-right border border-evol-grey font-sans text-sm"
                        />
                      ) : (
                        <span className="font-sans text-sm text-evol-dark-grey">
                          {item.price ? formatCurrency(item.price) : item.variantPrice ? formatCurrency(item.variantPrice) : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editValues.quantity}
                          onChange={(e) =>
                            setEditValues({ ...editValues, quantity: parseInt(e.target.value) || 0 })
                          }
                          className="w-16 px-2 py-1 text-center border border-evol-grey font-sans text-sm"
                        />
                      ) : (
                        <span
                          className={cn(
                            "font-sans text-sm font-medium",
                            item.quantity < 5 ? "text-amber-600" : "text-evol-dark-grey"
                          )}
                        >
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editValues.reservedQuantity}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              reservedQuantity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 px-2 py-1 text-center border border-evol-grey font-sans text-sm"
                        />
                      ) : (
                        <span className="font-sans text-sm text-evol-metallic">
                          {item.reservedQuantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {item.quantity === 0 ? (
                        <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 font-sans text-xs">
                          Out of Stock
                        </span>
                      ) : item.quantity < 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 font-sans text-xs">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 font-sans text-xs">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSave}
                              disabled={updateInventory.isPending}
                            >
                              {updateInventory.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-evol-metallic hover:text-evol-dark-grey hover:bg-evol-light-grey transition-colors"
                            >
                              <Pencil className="h-4 w-4 shrink-0" />
                            </button>
                            <DeleteConfirmDialog
                              trigger={
                                <button className="p-1 text-evol-metallic hover:text-evol-red hover:bg-red-50 transition-colors">
                                  <Trash2 className="h-4 w-4 shrink-0" />
                                </button>
                              }
                              description="Are you sure you want to delete this inventory item?"
                              onConfirm={() => deleteInventory.mutate({ id: item.id })}
                              isPending={deleteInventory.isPending}
                            />
                          </>
                        )}
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
          <div className="bg-white w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-evol-dark-grey">Add Inventory</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Store *</label>
              <select
                value={newInventory.storeId}
                onChange={(e) => setNewInventory({ ...newInventory, storeId: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                <option value="">Select store</option>
                {stores?.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Product Variant *
              </label>
              <select
                value={newInventory.productVariantId}
                onChange={(e) => {
                  const selectedVariant = productVariants?.variants.find(v => v.id === e.target.value);
                  setNewInventory({
                    ...newInventory,
                    productVariantId: e.target.value,
                    price: selectedVariant?.variantPrice || ""
                  });
                }}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey bg-white"
              >
                <option value="">Select product variant</option>
                {productVariants?.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.productName} - {variant.baseVariantName} ({variant.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                Price
              </label>
              <input
                type="text"
                placeholder="0.00"
                value={newInventory.price}
                onChange={(e) =>
                  setNewInventory({
                    ...newInventory,
                    price: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={newInventory.quantity}
                  onChange={(e) =>
                    setNewInventory({
                      ...newInventory,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">
                  Reserved
                </label>
                <input
                  type="number"
                  min="0"
                  value={newInventory.reservedQuantity}
                  onChange={(e) =>
                    setNewInventory({
                      ...newInventory,
                      reservedQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                disabled={createInventory.isPending}
              >
                {createInventory.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
