import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#1B4332]/25 bg-white px-3.5 py-2 text-sm text-[#1C1F1E] placeholder:text-[#525B56]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40916C] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-[#1B4332]/25 bg-white px-3.5 py-2.5 text-sm text-[#1C1F1E] placeholder:text-[#525B56]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40916C] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
