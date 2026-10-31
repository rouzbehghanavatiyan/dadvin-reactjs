import Checkbox from "../../UI/Checkbox";
import type { ReactNode } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { ProfileFormValues } from "../../types/domain";

export const specialties = [
  "حقوقی",
  "کیفری",
  "خانواده",
  "ثبتی",
  "تجاری",
  "ملکی",
  "سایبری",
  "بیمه و تصادفات",
  "اداری",
  "دیوان",
];
export default function SpecialtySelector({
  register,
  error,
  count,
  label = "حوزه‌های تخصصی",
}: {
  register: UseFormRegister<ProfileFormValues>;
  error?: string;
  count: number;
  label?: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[13px] font-medium text-ink">
        {label}{" "}
        <span className="mr-2 text-xs font-normal text-muted">
          {count} از ۳
        </span>
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {specialties.map((title) => (
          <Checkbox
            key={title}
            value={title}
            {...register("specialties", {
              validate: (value: string[]) =>
                (value || []).length <= 3 ||
                "حداکثر سه حوزه تخصصی انتخاب کنید.",
            })}
          >
            {title}
          </Checkbox>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
