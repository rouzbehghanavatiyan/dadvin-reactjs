import {
  UserRound,
  Smartphone,
  Mail,
  BadgeCheck,
  Fingerprint,
} from "lucide-react";
import Input from "../../UI/Input";
import RoleSelector from "./RoleSelector";
import { mobileRules } from "../../utils/validation";
import { normalizeDigits } from "../../utils/StringHelper";

export default function RegistrationFields({ register, errors, role }) {
  const nameRules = {
    required: "این فیلد را وارد کنید.",
    setValueAs: (value) => value.trim(),
  };
  return (
    <>
      <RoleSelector register={register} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="نام"
          icon={UserRound}
          autoComplete="given-name"
          {...register("name", nameRules)}
          error={errors.name?.message}
        />
        <Input
          label="نام خانوادگی"
          icon={UserRound}
          autoComplete="family-name"
          {...register("lastName", nameRules)}
          error={errors.lastName?.message}
        />
      </div>
      <Input
        label="شماره موبایل"
        icon={Smartphone}
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
        {...register("phoneNumber", mobileRules)}
        error={errors.phoneNumber?.message}
      />
      <Input
        label="ایمیل (اختیاری)"
        icon={Mail}
        type="email"
        dir="ltr"
        autoComplete="email"
        placeholder="example@email.com"
        {...register("email", {
          setValueAs: (value) => value.trim(),
          validate: (value) =>
            !value ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
            "ایمیل معتبر وارد کنید.",
        })}
        error={errors.email?.message}
      />
      <Input
        label="کد ملی (اختیاری)"
        icon={Fingerprint}
        inputMode="numeric"
        dir="ltr"
        {...register("nationalCode", {
          setValueAs: (value) => normalizeDigits(value).trim(),
          validate: (value) =>
            !value || /^\d{10}$/.test(value) || "کد ملی باید ۱۰ رقم باشد.",
        })}
        error={errors.nationalCode?.message}
      />
      {role === "lawyer" && (
        <Input
          label="شماره پروانه وکالت"
          icon={BadgeCheck}
          {...register("registrationPermit", {
            required: "شماره پروانه وکالت را وارد کنید.",
            setValueAs: (value) => normalizeDigits(value).trim(),
          })}
          error={errors.registrationPermit?.message}
        />
      )}
    </>
  );
}
