"use client";

import { useState } from "react";
import { Search, Trash2, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

export default function AdminNewsletterPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 30;

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getNewsletterSubscribers.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
  });

  const { sortedData, sortConfig, requestSort } = useSortableTable(
    data?.subscribers,
  );

  const deleteMutation = trpc.admin.deleteNewsletterSubscriber.useMutation({
    onSuccess: () => {
      toast.success("Subscriber removed");
      utils.admin.getNewsletterSubscribers.invalidate();
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

  const handleExport = () => {
    if (!data?.subscribers.length) {
      toast.error("No subscribers to export");
      return;
    }

    const csv = [
      "Email,Subscribed Date",
      ...data.subscribers.map(
        (s) => `${s.email},${formatDate(s.subscribedAt)}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-evol-dark-grey">
            Newsletter
          </h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage newsletter subscribers ({data?.total || 0} total)
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
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
          placeholder="Search by Email..."
          className="w-full pl-10 pr-4 py-2 border border-evol-grey font-body text-sm focus:outline-none focus:border-evol-dark-grey"
        />
      </div>

      {/* Subscribers List */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-evol-light-grey rounded" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-evol-grey overflow-hidden">
          <table className="w-full">
            <thead className="bg-evol-light-grey">
              <tr>
                <SortableTableHeader
                  label="Email"
                  sortKey="email"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Subscribed"
                  sortKey="subscribedAt"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <th className="px-6 py-3 text-right font-sans text-xs uppercase tracking-wider text-evol-metallic">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-evol-grey">
              {sortedData.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-evol-light-grey/50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-evol-metallic" />
                      <span className="font-body text-sm text-evol-dark-grey">
                        {subscriber.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    <span className="font-body text-sm text-evol-metallic">
                      {formatDate(subscriber.subscribedAt)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <DeleteConfirmDialog
                      trigger={
                        <button
                          disabled={deleteMutation.isPending}
                          className="p-2 text-evol-red hover:bg-red-50 rounded"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      }
                      description={`Remove ${subscriber.email} from newsletter subscribers?`}
                      onConfirm={() =>
                        deleteMutation.mutate({ id: subscriber.id })
                      }
                      isPending={deleteMutation.isPending}
                    />
                  </td>
                </tr>
              ))}
              {data?.subscribers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-evol-metallic font-body text-sm"
                  >
                    No subscribers found
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
