import { UserRound, Smartphone, Fingerprint, Mail, MapPin } from "lucide-react";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import { mobileRules, nationalCodeRules } from "../../utils/validation";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProfileFormValues } from "../../types/domain";

export default function IdentityFields({
  register,
  errors,
}: {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}) {
  const nameRules = {
    required: "این فیلد را وارد کنید.",
    setValueAs: (value: string) => value.trim(),
  };
  void nameRules;
  return <div className="grid gap-5 sm:grid-cols-2">
    ddd
  </div>;
}
