import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "block w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm",
            "placeholder:text-neutral-400 resize-y min-h-[80px]",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {error && (
          <p className="text-sm text-danger-600">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
