export default function Divider({ children }) {
  return (
    <div className="flex items-center gap-4 text-[11px] text-muted">
      <span className="h-px flex-1 bg-line" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
