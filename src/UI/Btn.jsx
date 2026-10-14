import { LoaderCircle } from "lucide-react";

export default function Btn({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}) {
  const styles = {
    primary:
      "bg-navy text-white hover:bg-navy-dark shadow-[0_5px_12px_#173e3514]",
    ghost: "text-muted hover:text-navy hover:bg-navy/5",
    outline: "border border-line bg-white text-ink hover:border-navy",
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
