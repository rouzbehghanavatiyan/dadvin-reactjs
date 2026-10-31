export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`text-[32px] font-bold leading-none ${light ? "text-white" : "text-ink"}`}
    >
      دادوین
    </span>
  );
}
