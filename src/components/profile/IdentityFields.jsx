import { UserRound, Smartphone, Fingerprint, Mail, MapPin } from "lucide-react";
import Input from "../../UI/Input";
import Select from "../../UI/Select";
import { mobileRules, nationalCodeRules } from "../../utils/validation";

export default function IdentityFields({ register, errors }) {
  const nameRules = {
    required: "این فیلد را وارد کنید.",
    setValueAs: (value) => value.trim(),
  };
  return <div className="grid gap-5 sm:grid-cols-2">
    ddd
  </div>;
}
