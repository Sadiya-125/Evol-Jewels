"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, MapPin, Phone, Mail, Download, Clock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

export default function AdminStoresPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    email: "",
    openingHours: "",
    coordinates: "",
    isActive: true,
  });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getAllStores.useQuery({ limit: 50 });

  const createMutation = trpc.admin.createStore.useMutation({
    onSuccess: () => {
      toast.success("Store created");
      utils.admin.getAllStores.invalidate();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.admin.updateStore.useMutation({
    onSuccess: () => {
      toast.success("Store updated");
      utils.admin.getAllStores.invalidate();
      setEditingId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteStore.useMutation({
    onSuccess: () => {
      toast.success("Store deleted");
      utils.admin.getAllStores.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      email: "",
      openingHours: "",
      coordinates: "",
      isActive: true,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug || !formData.address || !formData.city || !formData.state || !formData.postalCode || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email || undefined,
      openingHours: formData.openingHours || undefined,
      coordinates: formData.coordinates || undefined,
      isActive: formData.isActive,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      name: formData.name,
      slug: formData.slug,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email || undefined,
      openingHours: formData.openingHours || undefined,
      coordinates: formData.coordinates || undefined,
      isActive: formData.isActive,
    });
  };

  const startEdit = (store: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string | null;
    openingHours: string | null;
    coordinates: string | null;
    isActive: boolean;
  }) => {
    setEditingId(store.id);
    setFormData({
      name: store.name,
      slug: store.slug,
      address: store.address,
      city: store.city,
      state: store.state,
      postalCode: store.postalCode,
      country: store.country,
      phone: store.phone,
      email: store.email || "",
      openingHours: store.openingHours || "",
      coordinates: store.coordinates || "",
      isActive: store.isActive,
    });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleExportCSV = () => {
    if (!data?.stores.length) {
      toast.error("No stores to export");
      return;
    }
    const csvContent = [
      ["Name", "Slug", "Address", "City", "State", "Postal Code", "Country", "Phone", "Email", "Opening Hours", "Active"].join(","),
      ...data.stores.map((s) =>
        [
          s.name,
          s.slug,
          `"${(s.address || "").replace(/"/g, '""')}"`,
          s.city,
          s.state,
          s.postalCode,
          s.country,
          s.phone,
          s.email || "",
          `"${(s.openingHours || "").replace(/"/g, '""')}"`,
          s.isActive ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stores-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-evol-light-grey rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-evol-light-grey rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Stores</h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage physical store locations ({data?.total || 0} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="w-3 h-3 shrink-0" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-evol-light-grey border border-evol-grey p-6 space-y-4">
          <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">New Store</h2>
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
                placeholder="Store name"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="store-slug"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-sm text-evol-dark-grey mb-1">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Postal Code *</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="Mon-Sat: 10AM-8PM"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Coordinates</label>
              <input
                type="text"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                placeholder="lat,lng"
              />
            </div>
          </div>
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

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.stores.map((store) => (
          <div key={store.id} className={`bg-white border border-evol-grey p-5 ${!store.isActive ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-sans text-lg font-semibold text-evol-dark-grey">{store.name}</h3>
                <p className="font-mono text-xs text-evol-metallic">/{store.slug}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleActive(store.id, store.isActive)}
                  className={`p-1 rounded transition-all active:scale-90 ${
                    store.isActive
                      ? "text-green-600 hover:bg-green-50"
                      : "text-evol-metallic hover:bg-evol-light-grey"
                  }`}
                  title={store.isActive ? "Hide store" : "Show store"}
                >
                  {store.isActive ? <Eye className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
                </button>
                <button
                  onClick={() => startEdit(store)}
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
                  description={`Delete store "${store.name}"? This may affect inventory data.`}
                  onConfirm={() => deleteMutation.mutate({ id: store.id })}
                  isPending={deleteMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2 text-evol-metallic">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-body text-sm">
                  {store.address}, {store.city}, {store.state} {store.postalCode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <p className="font-body text-sm">{store.phone}</p>
              </div>
              {store.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <p className="font-body text-sm">{store.email}</p>
                </div>
              )}
              {store.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <p className="font-body text-sm">{store.openingHours}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {data?.stores.length === 0 && (
          <div className="col-span-full text-center py-8 text-evol-metallic font-body">
            No stores found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">Edit Store</h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-evol-metallic hover:bg-evol-light-grey rounded"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block font-sans text-sm text-evol-dark-grey mb-1">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  placeholder="Mon-Sat: 10AM-8PM"
                />
              </div>
              <div>
                <label className="block font-sans text-sm text-evol-dark-grey mb-1">Coordinates</label>
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  className="w-full px-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
                  placeholder="lat,lng"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="editIsActive" className="font-body text-sm text-evol-dark-grey">
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
