"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 focus:ring-primary-500",
      secondary:
        "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] focus:ring-slate-500",
      outline:
        "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
      ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
      destructive:
        "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-lg shadow-error-600/25",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg gap-1.5",
      md: "h-11 px-6 text-base rounded-xl gap-2",
      lg: "h-14 px-8 text-lg rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" size={size === "sm" ? 16 : 20} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
