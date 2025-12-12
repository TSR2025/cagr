import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionHeaderProps {
  title: string;
  description?: string;
  tooltip?: string;
}

export function SectionHeader({ title, description, tooltip }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
      {tooltip && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger className="text-slate-500">
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-slate-900/95 text-white">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
