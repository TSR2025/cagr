"use client";

import { ReactNode } from "react";

interface ChartGateProps {
  isLocked: boolean;
  children: ReactNode;
}

export function ChartGate({
  isLocked,
  children
}: ChartGateProps) {
  return (
    <div className="relative">
      {children}

      {isLocked && (
        <div className="pointer-events-none absolute left-4 right-4 top-0 z-10 flex justify-center lg:left-8 lg:right-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-xs font-medium text-white shadow-subtle">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            <span>Set your starting age and contribution end to personalize the projection.</span>
          </div>
        </div>
      )}
    </div>
  );
}
