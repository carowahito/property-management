import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-700",
        primary: "bg-primary-100 text-primary-700",
        success: "bg-success-100 text-success-700",
        danger: "bg-danger-100 text-danger-700",
        warning: "bg-warning-100 text-warning-700",
        neutral: "bg-neutral-100 text-neutral-700",
        outline: "border border-neutral-300 text-neutral-700 bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs rounded",
        md: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-2.5 py-1 text-sm rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
