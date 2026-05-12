import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-full shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
      color: {
        primary: "bg-primary-100 text-primary-700",
        success: "bg-success-100 text-success-700",
        danger: "bg-danger-100 text-danger-700",
        warning: "bg-warning-100 text-warning-700",
        neutral: "bg-neutral-200 text-neutral-700",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
)

interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof avatarVariants> {
  src?: string | null
  alt?: string
  name?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Avatar({ className, size, color, src, alt, name, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || ""}
        className={cn(
          "rounded-full object-cover shrink-0",
          size === "sm" && "h-8 w-8",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-12 w-12",
          size === "xl" && "h-16 w-16",
          (!size || size === undefined) && "h-10 w-10",
          className
        )}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    )
  }

  return (
    <div
      className={cn(avatarVariants({ size, color }), className)}
      role="img"
      aria-label={alt || name || "avatar"}
      {...props}
    >
      {name ? getInitials(name) : "?"}
    </div>
  )
}

export { Avatar, avatarVariants }
