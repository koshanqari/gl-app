import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

export function MobileStatCard({
  icon: Icon,
  label,
  value,
  className,
}: MobileStatCardProps) {
  return (
    <div
      className={cn(
        "text-center p-4 bg-slate-50 rounded-xl",
        className
      )}
    >
      <Icon className="h-6 w-6 mx-auto text-slate-600 mb-2" />
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      ) : (
        <div>{value}</div>
      )}
    </div>
  );
}

