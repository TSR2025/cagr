"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface ChartGateProps {
  isLocked: boolean;
  overlayTitle?: string;
  overlaySubtitle?: string;
  children: ReactNode;
}

export function ChartGate({
  isLocked,
  overlayTitle = "Set your time horizon",
  overlaySubtitle = "Time does more work than money.",
  children
}: ChartGateProps) {
  return (
    <div className="relative">
      <div
        className={clsx("rounded-2xl", isLocked && "pointer-events-none")}
        style={{
          filter: isLocked ? "blur(6px) saturate(0.85)" : "none",
          opacity: isLocked ? 0.65 : 1,
          transform: isLocked ? "translateY(2px)" : "translateY(0)",
          transition: "filter 350ms ease, opacity 350ms ease, transform 350ms ease"
        }}
      >
        {children}
      </div>

      <div
        className={clsx(
          "absolute inset-0 z-10 flex items-center justify-center p-4",
          "transition-opacity duration-300 ease-in-out",
          isLocked ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isLocked}
      >
        <div
          className={clsx(
            "max-w-xs rounded-2xl border border-white/50 bg-white/70 px-5 py-4 text-center shadow-subtle",
            "backdrop-blur-md"
          )}
          style={{
            boxShadow: "0 20px 50px -20px rgba(30, 41, 59, 0.25)",
            pointerEvents: isLocked ? "auto" : "none"
          }}
        >
          <p className="text-sm font-semibold text-slate-900">{overlayTitle}</p>
          <p className="mt-1 text-xs text-slate-600">{overlaySubtitle}</p>
          <p className="mt-3 text-xs font-semibold text-slate-700">Adjust age or years to unlock results</p>
        </div>
      </div>
    </div>
  );
}
