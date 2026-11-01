import { Mail, Smartphone, UserRound } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import type { ProfileFormValues } from "../../types/domain";
import { normalizeDigits } from "../../utils/StringHelper";
import { mobileRules } from "../../utils/validation";

const nameRules = {
  required: "این فیلد را وارد کنید.",
  setValueAs: (value: string) => value.trim(),
  validate: (value: string) => value.length >= 2 || "حداقل ۲ حرف وارد کنید.",
};

const emailRules = {
  required: "آدرس ایمیل را وارد کنید.",
  setValueAs: (value: string) => value.trim(),
  validate: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "آدرس ایمیل معتبر نیست.",
};

const permitRules = {
  required: "شماره پروانه را وارد کنید.",
  setValueAs: (value: string) => normalizeDigits(value).trim(),
  validate: (value: string) => value.length > 0 || "شماره پروانه را وارد کنید.",
};

const choiceRules = { required: "یک گزینه را انتخاب کنید." };

export type LockedProfileFields = Partial<Record<keyof ProfileFormValues, boolean>>;

export default function LawyerRequiredFields({
  register,
  errors,
  locked = {},
  showLawyerFields = false,
}: {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  locked?: LockedProfileFields;
  showLawyerFields?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input
        label="۱. نام"
        icon={UserRound}
        autoComplete="given-name"
        {...register("name", nameRules)}
        disabled={locked.name}
        error={errors.name?.message}
      />
      <Input
        label="نام خانوادگی"
        icon={UserRound}
        autoComplete="family-name"
        {...register("lastName", nameRules)}
        disabled={locked.lastName}
        error={errors.lastName?.message}
      />
      <Input
        label="۲. شماره تماس"
        icon={Smartphone}
        inputMode="numeric"
        autoComplete="tel"
        placeholder="09123456789"
        {...register("phoneNumber", mobileRules)}
        disabled={locked.phoneNumber}
        error={errors.phoneNumber?.message}
      />
      <Input
        label="۳. آدرس ایمیل"
        icon={Mail}
        type="email"
        autoComplete="email"
        {...register("email", emailRules)}
        disabled={locked.email}
        error={errors.email?.message}
      />
      {showLawyerFields && (
        <>
          <Select
            label="۴. عضویت"
            {...register("membership", choiceRules)}
            disabled={locked.membership}
            error={errors.membership?.message}
          >
            <option value="">انتخاب کنید</option>
            <option value="bar">کانون وکلای دادگستری</option>
            <option value="judiciary-center">
              مرکز وکلا و مشاورین قوه قضاییه
            </option>
          </Select>
          <Input
            label="۵. شماره پروانه"
            {...register("registrationPermit", permitRules)}
            disabled={locked.registrationPermit}
            error={errors.registrationPermit?.message}
          />
          <div className="sm:col-span-2">
            <Select
              label="۶. وضعیت اشتغال"
              {...register("employmentStatus", choiceRules)}
              disabled={locked.employmentStatus}
              error={errors.employmentStatus?.message}
            >
              <option value="">انتخاب کنید</option>
              <option value="grade-one">پایه یک</option>
              <option value="trainee">کارآموز</option>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
