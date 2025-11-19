import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MobileContainer({
  children,
  className,
  ...props
}: MobileContainerProps) {
  return (
    <div
      className={cn("px-4 pt-3 pb-6 space-y-3 bg-slate-50", className)}
      {...props}
    >
      {children}
    </div>
  );
}

