"use client";

import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";

interface ChartGateProps {
  isLocked: boolean;
  insightTrigger?: number;
  onInsightComplete?: () => void;
  children: ReactNode;
}

export function ChartGate({
  isLocked,
  insightTrigger,
  onInsightComplete,
  children
}: ChartGateProps) {
  const [showOverlay, setShowOverlay] = useState(isLocked);
  const [insightActive, setInsightActive] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setShowOverlay(true);
      return;
    }

    const timeout = window.setTimeout(() => setShowOverlay(false), 350);
    return () => window.clearTimeout(timeout);
  }, [isLocked]);

  useEffect(() => {
    if (!insightTrigger || insightActive) return;

    setInsightActive(true);
    const timeout = window.setTimeout(() => {
      setInsightActive(false);
      onInsightComplete?.();
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [insightActive, insightTrigger, onInsightComplete]);

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

      {showOverlay && (
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
              "max-w-xs rounded-2xl border border-white/40 bg-white/75 px-5 py-4 text-center shadow-subtle",
              "backdrop-blur-md"
            )}
            style={{
              boxShadow: "0 20px 50px -20px rgba(30, 41, 59, 0.25)",
              pointerEvents: isLocked ? "auto" : "none"
            }}
          >
            <p className="text-sm font-semibold text-slate-900">Your results depend on time</p>
            <p className="mt-1 text-xs text-slate-600">Compounding rewards consistency over years.</p>
            <p className="mt-3 text-xs font-semibold text-slate-700">Set your age and time horizon.</p>
          </div>
        </div>
      )}

      {insightActive && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <p className="insight-flash text-sm font-medium text-slate-700">This is what consistency over years does.</p>
        </div>
      )}

      <style jsx>{`
        .insight-flash {
          animation: insight-fade 700ms ease-in-out forwards;
        }

        @keyframes insight-fade {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
