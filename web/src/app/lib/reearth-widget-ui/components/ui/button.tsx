import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "[background-color:var(--color-primary)!important] text-primary-foreground shadow hover:[background-color:color-mix(in_oklch,var(--color-primary),transparent_10%)!important]",
        destructive:
          "[background-color:var(--color-destructive)!important] text-destructive-foreground shadow-sm hover:[background-color:color-mix(in_oklch,var(--color-destructive),transparent_10%)!important]",
        outline:
          "border border-input [background-color:var(--color-background)!important] shadow-sm hover:[background-color:var(--color-accent)!important] hover:text-accent-foreground",
        secondary:
          "[background-color:var(--color-secondary)!important] text-secondary-foreground shadow-sm hover:[background-color:color-mix(in_oklch,var(--color-secondary),transparent_20%)!important]",
        ghost:
          "hover:[background-color:var(--color-hover-background)!important] hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      },
      active: {
        true: "[background-color:var(--color-primary)!important] text-primary-foreground shadow hover:[background-color:color-mix(in_oklch,var(--color-primary),transparent_10%)!important] hover:text-primary-foreground",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      active: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, active, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
