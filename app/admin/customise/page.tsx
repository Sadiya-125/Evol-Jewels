"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import {
  Eye,
  Clock,
  CheckCircle,
  MessageSquare,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import SortableTableHeader from "@/components/admin/SortableTableHeader";
import { useSortableTable } from "@/hooks/useSortableTable";

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: Clock },
  reviewed: {
    label: "Reviewed",
    color: "bg-yellow-100 text-yellow-800",
    icon: Eye,
  },
  in_discussion: {
    label: "In Discussion",
    color: "bg-purple-100 text-purple-800",
    icon: MessageSquare,
  },
  quoted: {
    label: "Quoted",
    color: "bg-indigo-100 text-indigo-800",
    icon: FileText,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const budgetLabels: Record<string, string> = {
  under_50k: "< ₹50K",
  "50k_1l": "₹50K-1L",
  "1l_3l": "₹1L-3L",
  "3l_5l": "₹3L-5L",
  above_5l: "> ₹5L",
};

export default function AdminCustomisePage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: inquiries, isLoading } = trpc.customise.adminList.useQuery({
    status: statusFilter as any,
    offset,
    limit,
  });

  const { sortedData, sortConfig, requestSort } = useSortableTable(inquiries);

  const statusCounts = {
    all: inquiries?.length || 0,
    new: inquiries?.filter((i) => i.status === "new").length || 0,
    reviewed: inquiries?.filter((i) => i.status === "reviewed").length || 0,
    in_discussion:
      inquiries?.filter((i) => i.status === "in_discussion").length || 0,
    quoted: inquiries?.filter((i) => i.status === "quoted").length || 0,
    completed: inquiries?.filter((i) => i.status === "completed").length || 0,
    cancelled: inquiries?.filter((i) => i.status === "cancelled").length || 0,
  };

  const handleExportCSV = () => {
    if (!inquiries?.length) {
      toast.error("No inquiries to export");
      return;
    }
    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Requirement",
        "Budget",
        "Occasion",
        "Status",
        "Date",
      ].join(","),
      ...inquiries.map((i) =>
        [
          `"${(i.name || "").replace(/"/g, '""')}"`,
          i.email,
          i.phone,
          `"${(i.requirement || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          i.budgetRange ? budgetLabels[i.budgetRange] : "",
          i.occasion || "",
          statusConfig[i.status as keyof typeof statusConfig].label,
          formatDate(i.createdAt),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customise-inquiries-${new Date().toISOString().split("T")[0]}.csv`;
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
            Customisation Inquiries
          </h1>
          <p className="font-body text-sm text-evol-metallic mt-1">
            Manage bespoke jewellery requests from customers.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download className="w-3 h-3 shrink-0" />
          Export CSV
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-evol-grey overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setOffset(0);
            }}
            className={cn(
              "px-6 py-3 font-sans text-sm transition-colors border-b-2",
              !statusFilter
                ? "border-evol-red text-evol-red"
                : "border-transparent text-evol-metallic hover:text-evol-dark-grey",
            )}
          >
            All ({statusCounts.all})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setOffset(0);
              }}
              className={cn(
                "px-6 py-3 font-sans text-sm transition-colors border-b-2",
                statusFilter === key
                  ? "border-evol-red text-evol-red"
                  : "border-transparent text-evol-metallic hover:text-evol-dark-grey",
              )}
            >
              {config.label} ({statusCounts[key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-pulse text-evol-metallic font-body">
            Loading Inquiries...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && inquiries && inquiries.length === 0 && (
        <div className="text-center py-12 bg-evol-light-grey border border-evol-grey">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-evol-metallic" />
          <h3 className="font-serif text-2xl text-evol-dark-grey mb-2">
            No Inquiries Found
          </h3>
          <p className="font-body text-evol-metallic">
            {statusFilter
              ? `No inquiries with status "${statusConfig[statusFilter as keyof typeof statusConfig].label}"`
              : "No customisation inquiries yet."}
          </p>
        </div>
      )}

      {/* Inquiries Table */}
      {!isLoading && inquiries && inquiries.length > 0 && (
        <div className="bg-white border border-evol-grey overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-evol-light-grey">
                <tr>
                  <SortableTableHeader
                    label="Customer"
                    sortKey="name"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Requirement"
                    sortKey="requirement"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Budget"
                    sortKey="budgetRange"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Status"
                    sortKey="status"
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
                  <th className="px-6 py-3 text-right font-sans text-xs uppercase tracking-wider text-evol-metallic">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-evol-grey">
                {sortedData.map((inquiry) => {
                  const StatusIcon =
                    statusConfig[inquiry.status as keyof typeof statusConfig]
                      .icon;
                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-evol-light-grey/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-sans text-sm text-evol-dark-grey">
                          {inquiry.name}
                        </div>
                        <div className="font-body text-sm text-evol-metallic">
                          {inquiry.email}
                        </div>
                        <div className="font-body text-sm text-evol-metallic">
                          +91 {inquiry.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-body text-sm text-evol-dark-grey max-w-md truncate">
                          {inquiry.requirement}
                        </div>
                        {inquiry.occasion && (
                          <div className="font-body text-xs text-evol-metallic mt-1 capitalize">
                            {inquiry.occasion}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inquiry.budgetRange ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-xs bg-evol-light-grey text-evol-dark-grey">
                            {budgetLabels[inquiry.budgetRange]}
                          </span>
                        ) : (
                          <span className="font-body text-xs text-evol-metallic">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                            statusConfig[
                              inquiry.status as keyof typeof statusConfig
                            ].color,
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {
                            statusConfig[
                              inquiry.status as keyof typeof statusConfig
                            ].label
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body text-sm text-evol-metallic whitespace-nowrap">
                        {new Date(inquiry.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/customise/${inquiry.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-evol-dark-grey text-white font-sans text-sm hover:bg-evol-red transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-evol-light-grey px-6 py-4 border-t border-evol-grey flex items-center justify-between">
            <p className="font-body text-sm text-evol-metallic">
              Showing {offset + 1} -{" "}
              {Math.min(offset + limit, offset + inquiries.length)} of{" "}
              {offset + inquiries.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={inquiries.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
