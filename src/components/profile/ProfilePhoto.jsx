import { useId, useRef } from "react";
import { Camera, Upload, UserRound, Trash2 } from "lucide-react";
import Btn from "../../UI/Btn";

export default function ProfilePhoto({
  photo,
  error,
  busy,
  onChoose,
  onRemove,
}) {
  const input = useRef(null);
  const id = useId();
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#eaf0f6] text-muted shadow-sm">
          {photo ? (
            <img
              src={photo.url}
              alt="پیش‌نمایش عکس پروفایل"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={42} strokeWidth={1.2} />
          )}
        </div>
        <span className="absolute bottom-0 left-0 rounded-full bg-navy p-2 text-white">
          <Camera size={15} />
        </span>
      </div>
      <div className="text-center sm:text-right">
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Btn
            variant="outline"
            loading={busy}
            onClick={() => input.current?.click()}
            aria-describedby={`${id}-help`}
          >
            <Upload size={16} />
            {photo ? "تغییر عکس" : "انتخاب عکس"}
          </Btn>
          {photo && (
            <Btn
              variant="ghost"
              onClick={onRemove}
              aria-label="حذف عکس انتخاب‌شده"
            >
              <Trash2 size={17} />
            </Btn>
          )}
        </div>
        <input
          id={id}
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="انتخاب فایل عکس پروفایل"
          onChange={(event) => {
            onChoose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <p id={`${id}-help`} className="mt-3 text-[11px] leading-6 text-muted">
          JPG، PNG یا WebP · حداکثر ۵ مگابایت
          <br />
          عکس فعلاً فقط روی همین صفحه پیش‌نمایش می‌شود.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
