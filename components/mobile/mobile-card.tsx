import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MobileCard({ children, className, ...props }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function MobileCardHeader({
  children,
  action,
  className,
  ...props
}: MobileCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-slate-100 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <h2 className="text-base font-bold text-slate-900">{children}</h2>
      ) : (
        children
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

interface MobileCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MobileCardContent({
  children,
  className,
  ...props
}: MobileCardContentProps) {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

