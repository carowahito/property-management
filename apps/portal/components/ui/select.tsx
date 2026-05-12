import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "block w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
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
Select.displayName = "Select"

export { Select }
