import { ShieldCheck, UserRound } from "lucide-react";

export default function ProfileSummary({ values, photo, previewed }) {
  const displayName =
    [values.name, values.lastName].filter(Boolean).join(" ") || "پروفایل شما";
  return (
    <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-white lg:sticky lg:top-6">
      <div className="h-24 bg-[linear-gradient(120deg,#10243d,#345572)]" />
      <div className="px-6 pb-6">
        <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#eaf0f6] text-muted">
          {photo ? (
            <img
              src={photo.url}
              alt="عکس انتخابی شما"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={34} strokeWidth={1.2} />
          )}
        </div>
        <h2 className="mt-4 text-lg font-medium text-ink break-words">
          {displayName}
        </h2>
        <p className="mt-2 text-xs text-muted">
          {values.role === "lawyer" ? "وکیل" : "موکل"}
          {values.city ? ` · ${values.city}` : ""}
        </p>
        <span className="mt-4 inline-block rounded-full bg-amber-50 px-3 py-1.5 text-[10px] text-amber-800">
          {previewed ? "پیش‌نمایش بررسی‌شده" : "پیش‌نویس پروفایل"}
        </span>
        {values.bio && (
          <p className="mt-5 whitespace-pre-wrap break-words text-xs leading-7 text-muted">
            {values.bio}
          </p>
        )}
        {values.role === "lawyer" && values.specialties?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {values.specialties.map((item) => (
              <span
                key={item}
                className="rounded-md bg-[#edf2f7] px-2 py-1 text-[10px] text-navy"
              >
                {item}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-start gap-2 border-t border-line pt-4 text-[11px] leading-6 text-muted">
          <ShieldCheck size={16} className="mt-1 shrink-0" />
          <p>موبایل، کد ملی و شماره پروانه در این کارت نمایش داده نمی‌شوند.</p>
        </div>
      </div>
    </aside>
  );
}
