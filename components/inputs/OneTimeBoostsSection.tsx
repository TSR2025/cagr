import { useMemo } from "react";
import { OneTimeBoost } from "@/lib/calculations/calculateProjection";
import { OneTimeBoostRow } from "./OneTimeBoostRow";
import { SectionHeader } from "./SectionHeader";

interface OneTimeBoostsSectionProps {
  boosts: OneTimeBoost[];
  onChange: (boosts: OneTimeBoost[]) => void;
  maxYear: number;
  showHeader?: boolean;
}

export function OneTimeBoostsSection({ boosts, onChange, maxYear, showHeader = true }: OneTimeBoostsSectionProps) {
  const visibleRows = useMemo(() => {
    const rows: OneTimeBoost[] = boosts.filter((b) => b.year || b.amount).slice(0, 5);
    const hasEmpty = rows.some((r) => !r.year || !r.amount);
    if (!hasEmpty && rows.length < 5) {
      rows.push({ year: rows.length + 1, amount: 0, label: "" });
    } else if (rows.length === 0) {
      rows.push({ year: 1, amount: 0, label: "" });
    }
    return rows;
  }, [boosts]);

  const updateRow = (index: number, updated: OneTimeBoost) => {
    const next = [...boosts];
    next[index] = updated;
    onChange(next);
  };

  const removeRow = (index: number) => {
    const next = boosts.slice(0, index).concat(boosts.slice(index + 1));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <SectionHeader
          title="One-Time Boosts"
          description="Optional. Add large one-time amounts at specific years, like bonuses or a house sale."
          tooltip="Add occasional windfalls to see how they influence your total growth."
        />
      )}
      <div className="space-y-3">
        {visibleRows.map((row, idx) => (
          <OneTimeBoostRow
            key={idx}
            boost={row}
            maxYear={maxYear}
            onChange={(updated) => updateRow(idx, updated)}
            onRemove={() => removeRow(idx)}
            isRemovable={Boolean(row.year || row.amount || row.label) && visibleRows.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
