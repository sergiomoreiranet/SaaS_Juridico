import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default: "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 shadow-sm",
      destructive: "bg-red-500 text-zinc-50 hover:bg-red-500/90 shadow-sm",
      outline:
        "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 shadow-sm",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80",
      ghost: "hover:bg-zinc-100 hover:text-zinc-900",
      link: "text-zinc-900 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Spinner size={16} className="mr-2 text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
