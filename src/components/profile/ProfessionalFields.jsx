import { BadgeCheck, CalendarDays } from "lucide-react";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import SpecialtySelector from "./SpecialtySelector";
import { normalizeDigits } from "../../utils/StringHelper";

export default function ProfessionalFields({
  register,
  errors,
  specialtyCount,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="شماره پروانه وکالت"
          icon={BadgeCheck}
          required
          {...register("registrationPermit", {
            required: "شماره پروانه را وارد کنید.",
            setValueAs: (value) => normalizeDigits(value).trim(),
          })}
          error={errors.registrationPermit?.message}
        />
        <Input
          label="سابقه فعالیت (سال)"
          icon={CalendarDays}
          required
          inputMode="numeric"
          {...register("experienceYears", {
            required: "سابقه فعالیت را وارد کنید.",
            setValueAs: (value) => normalizeDigits(value).trim(),
            validate: (value) =>
              (/^\d+$/.test(value) && Number(value) <= 80) ||
              "تعداد سال را بین ۰ تا ۸۰ وارد کنید.",
          })}
          error={errors.experienceYears?.message}
        />
        <Select
          label="مقطع تحصیلی"
          required
          {...register("education", {
            required: "مقطع تحصیلی را انتخاب کنید.",
          })}
          error={errors.education?.message}
        >
          <option value="">انتخاب کنید</option>
          <option value="bachelor">کارشناسی</option>
          <option value="master">کارشناسی ارشد</option>
          <option value="doctorate">دکتری</option>
        </Select>
      </div>
      <SpecialtySelector
        register={register}
        count={specialtyCount}
        error={errors.specialties?.message}
      />
    </div>
  );
}
