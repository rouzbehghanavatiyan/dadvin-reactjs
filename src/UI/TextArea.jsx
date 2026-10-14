import { useId } from "react";

export default function TextArea({ label, error, hint, ...props }) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2.5 block text-[13px] font-medium text-ink"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none placeholder:text-muted/70 focus:border-navy focus:ring-3 focus:ring-navy/8"
        {...props}
      />
      {(error || hint) && (
        <p
          id={`${id}-help`}
          className={`mt-2 text-xs ${error ? "text-red-700" : "text-muted"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
