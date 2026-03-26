"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-gradient-primary text-white shadow-glow hover:opacity-90",
  secondary: "bg-surface hover:bg-surface-hover text-foreground border border-surface-border",
  outline: "border border-surface-border bg-transparent hover:bg-surface-hover text-foreground",
  ghost: "hover:bg-surface-hover text-foreground",
  danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20",
};

const sizeStyles = {
  default: "h-11 px-6 py-2",
  sm: "h-9 rounded-lg px-4 text-xs",
  lg: "h-12 rounded-2xl px-8 text-base",
  icon: "h-11 w-11",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        // Only trigger the tap animation if the button is interactive
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };