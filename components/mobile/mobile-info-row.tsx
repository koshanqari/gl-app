import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function MobileInfoRow({
  icon: Icon,
  label,
  value,
  className,
}: MobileInfoRowProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {typeof value === "string" ? (
          <p className="text-base font-semibold text-slate-900 truncate">
            {value}
          </p>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

