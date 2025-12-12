"use client";

import { Button } from "@/components/ui/button";

interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export function ExpandToggle({ expanded, onToggle }: ExpandToggleProps) {
  return (
    <div className="flex justify-end">
      <Button variant="outline" onClick={onToggle} className="mt-2">
        {expanded ? "Hide details" : "Show full year-by-year"}
      </Button>
    </div>
  );
}
