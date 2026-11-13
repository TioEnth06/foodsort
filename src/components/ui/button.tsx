import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[#1B4332] text-[#FAF8F5] hover:bg-[#122E22] shadow-sm border border-[#1B4332]",
      secondary:
        "bg-[#40916C] text-white hover:bg-[#2D6A4F] shadow-sm border border-[#40916C]",
      outline:
        "bg-transparent text-[#1B4332] border border-[#1B4332]/30 hover:bg-[#D8F3DC]/50",
      ghost:
        "bg-transparent text-[#1C1F1E] hover:bg-[#1B4332]/10 border border-transparent",
      danger:
        "bg-[#B91C1C] text-white hover:bg-[#991B1B] shadow-sm border border-[#B91C1C]",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-xs rounded-lg font-medium",
      md: "px-4 py-2.5 text-sm rounded-xl font-medium",
      lg: "px-6 py-3.5 text-base rounded-xl font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40916C] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
