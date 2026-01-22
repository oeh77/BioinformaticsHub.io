"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectableRowProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  children: React.ReactNode;
}

export function SelectableRow({ id, selected, onSelect, children }: SelectableRowProps) {
  return (
    <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selected ? "bg-primary/5" : ""}`}>
      <td className="p-4 w-12">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(id, !!checked)}
          aria-label={`Select item ${id}`}
        />
      </td>
      {children}
    </tr>
  );
}

interface UseSelectionReturn {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string, selected: boolean) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
}

export function useSelection(): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggle = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const selectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  return { selectedIds, isSelected, toggle, selectAll, deselectAll };
}
