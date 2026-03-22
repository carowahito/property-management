import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-md",
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-md",
        secondary: "bg-neutral-600 text-white hover:bg-neutral-700 focus-visible:ring-neutral-500 shadow-sm hover:shadow-md",
        success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500 shadow-sm hover:shadow-md",
        danger: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 shadow-sm hover:shadow-md",
        warning: "bg-warning-600 text-white hover:bg-warning-700 focus-visible:ring-warning-500 shadow-sm hover:shadow-md",
        destructive: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 shadow-sm hover:shadow-md",
        outline: "border-2 border-neutral-300 bg-surface text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-500",
        ghost: "hover:bg-neutral-100 text-neutral-700",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2 text-sm rounded-md",
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-4 py-2 text-sm rounded-md",
        lg: "px-6 py-2.5 text-base rounded-md",
        xl: "px-8 py-3 text-lg rounded-md",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={asChild ? undefined : ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
