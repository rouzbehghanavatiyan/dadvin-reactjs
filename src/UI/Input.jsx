import { useId } from "react";

export default function Input({
  label,
  error,
  icon: Icon,
  endAdornment,
  hint,
  className = "",
  id: providedId,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2.5 block text-[13px] font-medium text-ink"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-white transition focus-within:border-navy focus-within:ring-3 focus-within:ring-navy/8 ${error ? "border-red-400" : "border-line"}`}
      >
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 text-muted"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-help` : undefined}
          className={`min-w-0 w-full rounded-lg bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-[#8b9bb2] ${Icon ? "pl-12" : "pl-4"} ${endAdornment ? "pr-12" : "pr-4"}`}
          {...props}
        />
        {endAdornment && <div className="absolute right-1">{endAdornment}</div>}
      </div>
      {(error || hint) && (
        <p
          id={`${id}-help`}
          className={`mt-2 text-xs leading-6 ${error ? "text-red-700" : "text-muted"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
