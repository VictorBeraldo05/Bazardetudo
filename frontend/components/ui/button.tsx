import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "bg-ink text-white hover:opacity-90",
        variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
        variant === "outline" && "border border-black/10 bg-white/70 text-ink hover:bg-white",
        className
      )}
      {...props}
    />
  );
}
