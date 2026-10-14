import { CircleCheck, Info } from "lucide-react";

export default function Alert({ children, kind = "error" }) {
  const Icon = kind === "success" ? CircleCheck : Info;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-6 ${kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}
    >
      <Icon size={17} className="mt-1 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
