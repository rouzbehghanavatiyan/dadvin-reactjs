import { UserRound } from "lucide-react";

const avatarTones = [
  "bg-[#e8eef6] text-navy",
  "bg-[#e7f5ee] text-emerald-800",
  "bg-[#f8efe4] text-amber-800",
  "bg-[#f3e8f5] text-purple-800",
  "bg-[#e7f1f8] text-sky-800",
  "bg-[#f8e8e8] text-red-800",
];

type LawyerIdentityProps = {
  id: string;
  firstName: string;
  lastName: string;
  score: number;
};

export function lawyerName(lawyer: { firstName: string; lastName: string }) {
  return `${lawyer.firstName} ${lawyer.lastName}`.trim();
}

export default function LawyerIdentity({
  id,
  firstName,
  lastName,
  score,
}: LawyerIdentityProps) {
  const name = lawyerName({ firstName, lastName });
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${avatarTones[Number(id) - 1] || avatarTones[0]}`}
          aria-hidden="true"
        >
          <UserRound size={22} strokeWidth={1.6} />
        </span>
        <h2 className="truncate text-base font-medium text-ink">{name}</h2>
      </div>
      <p className="shrink-0 rounded-full bg-[#fff4d6] px-3 py-1 text-sm text-[#8a5a00]">
        امتیاز:{score}
      </p>
    </>
  );
}
