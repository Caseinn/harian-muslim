import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm outline-none transition-[color,box-shadow,transform] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-5",
        icon: "size-10",
        lg: "h-12 px-8 text-base",
        sm: "h-8 px-3 text-xs",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary/70 shadow-[0_14px_30px_rgba(45,106,79,0.18)] hover:bg-primary/90",
        destructive:
          "bg-destructive text-white border border-destructive/70 shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        ghost: "text-foreground/80 hover:bg-primary/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-primary/40 bg-transparent text-foreground shadow-sm hover:bg-primary/10 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary/70 shadow-[0_12px_26px_rgba(212,175,55,0.16)] hover:bg-secondary/90",
      },
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
