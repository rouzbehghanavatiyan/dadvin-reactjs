export default function Brand({ light = false }) {
  return (
    <span
      className={`text-[32px] font-bold leading-none ${light ? "text-white" : "text-ink"}`}
    >
      دادوین
    </span>
  );
}
