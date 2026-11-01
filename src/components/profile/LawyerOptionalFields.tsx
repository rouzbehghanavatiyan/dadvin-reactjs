import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import TextArea from "../../UI/TextArea";
import type { ProfileFormValues } from "../../types/domain";
import { normalizeDigits } from "../../utils/StringHelper";

const textRules = (max: number) => ({
  setValueAs: (value: string) => value.trim(),
  validate: (value: string) =>
    !value || value.length <= max || `حداکثر ${max} حرف مجاز است.`,
});

const countRules = (maxDigits: number) => ({
  setValueAs: (value: string) => normalizeDigits(value).trim(),
  validate: (value: string) =>
    !value ||
    new RegExp(`^\\d{1,${maxDigits}}$`).test(value) ||
    "فقط عدد وارد کنید.",
});

export default function LawyerOptionalFields({
  register,
  errors,
}: {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select
        label="۱. پایه علمی"
        {...register("education")}
        error={errors.education?.message}
      >
        <option value="">انتخاب کنید</option>
        <option value="bachelor">کارشناسی</option>
        <option value="master">کارشناسی ارشد</option>
        <option value="doctorate">دکترا</option>
      </Select>
      <Input
        label="۲. رشته تحصیلات تکمیلی"
        {...register("graduateField", textRules(120))}
        error={errors.graduateField?.message}
      />
      <Input
        label="۳. سنوات فعالیت"
        inputMode="numeric"
        {...register("experienceYears", countRules(2))}
        error={errors.experienceYears?.message}
      />
      <Input
        label="۴. آمار CMS"
        {...register("cmsStats", textRules(120))}
        error={errors.cmsStats?.message}
      />
      <Input
        label="۵. تعداد پرونده‌های موفق"
        inputMode="numeric"
        {...register("successfulCases", countRules(6))}
        error={errors.successfulCases?.message}
      />
      <div className="sm:col-span-2">
        <TextArea
          label="۶. نمونه آرا"
          rows={4}
          {...register("sampleVerdicts", textRules(2000))}
          error={errors.sampleVerdicts?.message}
        />
      </div>
    </div>
  );
}
