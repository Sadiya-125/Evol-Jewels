"use client";

import { useState } from "react";
import { Search, Trash2, Mail, Phone, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getUsers.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
  });

  const { sortedData, sortConfig, requestSort } = useSortableTable(data?.users);

  const deleteMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted");
      utils.admin.getUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleExportCSV = () => {
    if (!data?.users.length) {
      toast.error("No users to export");
      return;
    }
    const csvContent = [
      ["Name", "Email", "Phone", "Joined Date"].join(","),
      ...data.users.map((u) =>
        [
          `"${(u.name || "").replace(/"/g, '""')}"`,
          u.email,
          u.phone || "",
          formatDate(u.createdAt),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">Users</h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage registered users ({data?.total || 0} total)
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download className="w-3 h-3 shrink-0" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0 text-evol-metallic" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by Name or Email..."
          className="w-full pl-10 pr-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
        />
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-evol-light-grey rounded" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-evol-grey overflow-x-auto">
          <table className="w-full">
            <thead className="bg-evol-light-grey">
              <tr>
                <SortableTableHeader
                  label="User"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Contact"
                  sortKey="email"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Joined"
                  sortKey="createdAt"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <th className="px-6 py-3 text-right font-sans text-xs uppercase tracking-wider text-evol-metallic">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-evol-grey">
              {sortedData.map((user) => (
                <tr key={user.id} className="hover:bg-evol-light-grey/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-sans text-sm font-medium text-evol-dark-grey">
                        {user.name}
                      </p>
                      <p className="font-body text-xs text-evol-metallic">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-evol-metallic">
                        <Mail className="w-3 h-3" />
                        <span className="font-body text-xs">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-evol-metallic">
                          <Phone className="w-3 h-3" />
                          <span className="font-body text-xs">
                            {user.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="font-body text-sm text-evol-metallic">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteConfirmDialog
                      trigger={
                        <button
                          disabled={deleteMutation.isPending}
                          className="p-2 text-evol-red hover:bg-red-50 rounded"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      }
                      description={`Are you sure you want to delete user ${user.email}? This cannot be undone.`}
                      onConfirm={() => deleteMutation.mutate({ id: user.id })}
                      isPending={deleteMutation.isPending}
                    />
                  </td>
                </tr>
              ))}
              {data?.users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-evol-metallic font-body text-sm"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="font-body text-sm text-evol-metallic">
            Showing {page * limit + 1} -{" "}
            {Math.min((page + 1) * limit, data.total)} of {data.total}
          </p>
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
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
