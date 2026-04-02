import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2";

  const variants = {
    default: "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80",
    secondary: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80",
    destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-100/80",
    success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
    warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/80",
    outline: "text-zinc-950",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
