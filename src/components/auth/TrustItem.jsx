export default function TrustItem({ icon: Icon, title, children }) {
  return (
    <div className="flex items-center gap-4">
      <Icon
        size={25}
        strokeWidth={1.45}
        className="shrink-0 text-white/95"
        aria-hidden="true"
      />
      <div>
        <h3 className="text-[12px] font-normal leading-6 text-white/95">
          {title}
        </h3>
        <p className="text-[12px] leading-6 text-white/85">{children}</p>
      </div>
    </div>
  );
}
