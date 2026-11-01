import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  error?: ReactNode;
};

export default function Select({ label, error, children, ...props }: SelectProps) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2.5 block text-[13px] font-medium text-ink"
      >
        {label}
      </label>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink outline-none focus:border-navy focus:ring-3 focus:ring-navy/8 disabled:cursor-not-allowed disabled:bg-[#f4f7fb] disabled:text-muted"
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
