import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-mono leading-none transition-[background,transform,border-color,box-shadow] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[rgb(253_254_254_/_0.08)] bg-[#111111] text-[#FDFEFE] shadow-[0_2px_8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(253,254,254,0.04)] hover:-translate-y-px hover:border-[rgb(253_254_254_/_0.14)] hover:bg-[#1b1b1b] active:translate-y-0 active:scale-[0.98] focus-visible:outline-[rgb(253_254_254_/_0.35)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 min-w-[132px] rounded-full px-4 text-[10px] font-medium uppercase tracking-[0.08em]",
        sm: "h-8 min-w-[104px] rounded-full px-3 text-[9px] uppercase tracking-[0.08em]",
        lg: "h-9 min-w-[148px] rounded-full px-5 text-[10px] uppercase tracking-[0.08em]",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
