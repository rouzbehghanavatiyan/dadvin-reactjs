import { useId } from "react";

export default function Checkbox({ children, error, ...props }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-navy"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-xs leading-6 text-muted"
        >
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
