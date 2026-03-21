import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { SortConfig } from "@/hooks/useSortableTable";

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  align?: "left" | "right" | "center";
}

export default function SortableTableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = "left",
}: SortableTableHeaderProps) {
  const isSorted = sortConfig.key === sortKey;
  const direction = isSorted ? sortConfig.direction : null;

  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[align];

  return (
    <th
      className={`px-4 py-3 ${alignClass} font-sans text-xs uppercase tracking-widest text-evol-metallic cursor-pointer hover:bg-evol-grey/30 transition-colors select-none`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
        <span>{label}</span>
        {direction === "asc" ? (
          <ArrowUp className="w-3 h-3 shrink-0" />
        ) : direction === "desc" ? (
          <ArrowDown className="w-3 h-3 shrink-0" />
        ) : (
          <ChevronsUpDown className="w-3 h-3 shrink-0 opacity-40" />
        )}
      </div>
    </th>
  );
}
