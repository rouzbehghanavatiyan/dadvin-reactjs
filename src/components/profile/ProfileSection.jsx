export default function ProfileSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="rounded-xl bg-[#edf2f7] p-2.5 text-navy">
          <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-medium text-ink">{title}</h2>
          <p className="mt-1 text-xs leading-6 text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
