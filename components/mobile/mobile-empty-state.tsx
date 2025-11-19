import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: MobileEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-20",
        className
      )}
    >
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-base text-slate-500 text-center max-w-xs">
        {description}
      </p>
    </div>
  );
}

