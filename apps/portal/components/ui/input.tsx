import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "block w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm",
            "placeholder:text-neutral-400",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-danger-600">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
