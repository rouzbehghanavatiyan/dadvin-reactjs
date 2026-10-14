import { BriefcaseBusiness, UserRound, Check } from "lucide-react";

const roles = [
  { value: "client", title: "موکل", Icon: UserRound },
  { value: "lawyer", title: "وکیل", Icon: BriefcaseBusiness },
];
export default function RoleSelector({ register }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[13px] font-medium text-ink">
        با چه نقشی همراه ما هستید؟
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {roles.map(({ value, title, Icon }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              {...register("role")}
              type="radio"
              value={value}
              className="peer sr-only"
            />
            <span className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white py-3 text-xs text-muted transition peer-checked:border-navy peer-checked:bg-navy/5 peer-checked:text-navy peer-focus-visible:ring-2 peer-focus-visible:ring-navy">
              <Icon size={21} strokeWidth={1.6} />
              {title}
            </span>
            <Check
              size={12}
              className="absolute right-2 top-2 hidden text-navy peer-checked:block"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
