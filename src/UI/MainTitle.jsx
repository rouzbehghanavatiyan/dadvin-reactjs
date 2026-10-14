export default function MainTitle({ title, children }) {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-[24px] font-bold leading-relaxed text-ink sm:text-[27px]">
        {title}
      </h1>
      <p className="mt-3 text-[12px] leading-7 text-ink/85 sm:text-[13px]">
        {children}
      </p>
    </div>
  );
}
