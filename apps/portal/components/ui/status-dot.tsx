import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusDotVariants = cva(
  "inline-flex items-center gap-1.5 text-sm",
  {
    variants: {
      status: {
        active: "",
        inactive: "",
        pending: "",
        danger: "",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
)

const dotColors = {
  active: "bg-success-500",
  inactive: "bg-neutral-400",
  pending: "bg-warning-500",
  danger: "bg-danger-500",
}

const textColors = {
  active: "text-success-700",
  inactive: "text-neutral-500",
  pending: "text-warning-700",
  danger: "text-danger-700",
}

interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  label?: string
  pulse?: boolean
}

function StatusDot({ status = "active", label, pulse, className, ...props }: StatusDotProps) {
  const s = status ?? "active"

  return (
    <span className={cn(statusDotVariants({ status }), textColors[s], className)} {...props}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              dotColors[s]
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotColors[s])} />
      </span>
      {label}
    </span>
  )
}

export { StatusDot }
