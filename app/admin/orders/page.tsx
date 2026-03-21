"use client";

import { useState } from "react";
import { ShoppingCart, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

const ORDER_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const limit = 10;
  const { data, isLoading, refetch } = trpc.admin.getOrders.useQuery({
    limit,
    offset: page * limit,
    status: statusFilter || undefined,
  });

  const { sortedData, sortConfig, requestSort } = useSortableTable(data?.orders);

  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate({
      id: orderId,
      status: newStatus as
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusStyle = (status: string) => {
    return (
      ORDER_STATUSES.find((s) => s.value === status)?.color ||
      "bg-gray-100 text-gray-800"
    );
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleExportCSV = () => {
    if (!data?.orders.length) {
      toast.error("No orders to export");
      return;
    }
    const csvContent = [
      ["Order Number", "Date", "Store", "Total", "Status"].join(","),
      ...data.orders.map((order) =>
        [
          order.orderNumber,
          formatDate(order.createdAt),
          order.storeName || "Online",
          order.total,
          ORDER_STATUSES.find((s) => s.value === order.status)?.label ||
            order.status,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
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
            Orders
          </h1>
          <p className="font-sans text-sm text-evol-metallic mt-1">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-evol-metallic">
            <ShoppingCart className="h-4 w-4" />
            <span>{data?.total || 0} orders</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3 h-3 shrink-0" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-evol-metallic" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-evol-grey rounded-sm font-sans text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evol-red/20"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-evol-grey rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-evol-light-grey">
              <tr>
                <SortableTableHeader
                  label="Order"
                  sortKey="orderNumber"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="left"
                />
                <SortableTableHeader
                  label="Date"
                  sortKey="createdAt"
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
                  label="Total"
                  sortKey="total"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="right"
                />
                <SortableTableHeader
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="center"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-evol-grey/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-6 bg-evol-light-grey rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-evol-metallic"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                sortedData.map((order) => (
                  <tr key={order.id} className="hover:bg-evol-light-grey/30">
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm font-medium text-evol-dark-grey">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm text-evol-metallic">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-sans text-sm text-evol-metallic">
                        {order.storeName || "Online"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-sans text-sm font-medium text-evol-dark-grey">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updateStatus.isPending}
                          className={cn(
                            "px-3 py-1 rounded-sm font-sans text-xs font-medium cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-evol-red/20",
                            getStatusStyle(order.status),
                            updateStatus.isPending &&
                              "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
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
    </div>
  );
}
