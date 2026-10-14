import { UserRound, Smartphone, Fingerprint, Mail, MapPin } from "lucide-react";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import { mobileRules, nationalCodeRules } from "../../utils/validation";

export default function IdentityFields({ register, errors }) {
  const nameRules = {
    required: "این فیلد را وارد کنید.",
    setValueAs: (value) => value.trim(),
  };
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input
        label="نام"
        icon={UserRound}
        required
        autoComplete="given-name"
        {...register("name", nameRules)}
        error={errors.name?.message}
      />
      <Input
        label="نام خانوادگی"
        icon={UserRound}
        required
        autoComplete="family-name"
        {...register("lastName", nameRules)}
        error={errors.lastName?.message}
      />
      <Input
        label="شماره موبایل"
        icon={Smartphone}
        required
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        {...register("phoneNumber", mobileRules)}
        error={errors.phoneNumber?.message}
      />
      <Input
        label="کد ملی"
        icon={Fingerprint}
        required
        inputMode="numeric"
        dir="ltr"
        {...register("nationalCode", nationalCodeRules)}
        error={errors.nationalCode?.message}
      />
      <Input
        label="ایمیل (اختیاری)"
        icon={Mail}
        type="email"
        dir="ltr"
        autoComplete="email"
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
        label="شهر محل فعالیت یا سکونت"
        icon={MapPin}
        required
        autoComplete="address-level2"
        {...register("city", {
          required: "شهر را وارد کنید.",
          setValueAs: (value) => value.trim(),
        })}
        error={errors.city?.message}
      />
      <Select label="نقش شما در دادوین" {...register("role")}>
        <option value="client">موکل</option>
        <option value="lawyer">وکیل</option>
      </Select>
    </div>
  );
}
