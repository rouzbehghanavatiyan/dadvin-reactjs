import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  Layers,
  MessageCircle,
  UserRound,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { isClientAccount, isLawyerAccount, profileRecord } from "../../utils/clientAccount";

function renewalDaysLeft(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(created);
  renewal.setHours(0, 0, 0, 0);
  while (renewal < today) renewal.setFullYear(renewal.getFullYear() + 1);
  return Math.round((renewal.getTime() - today.getTime()) / 86_400_000);
}

const shortcuts = [
  {
    to: "/profile",
    title: "پروفایل",
    text: "نام، تماس، ایمیل و عکس حساب",
    icon: UserRound,
    audience: "all",
  },
  {
    to: "/requests",
    title: "درخواست‌ها",
    text: "ثبت درخواست در خانواده، کیفری یا حقوق",
    icon: FileText,
    audience: "client",
  },
  {
    to: "/receipts",
    title: "دریافتی‌ها",
    text: "پیام‌ها و پیشنهاد وکلا",
    icon: BadgeCheck,
    audience: "client",
  },
  {
    to: "/chat",
    title: "گفتگو",
    text: "اتاق گفتگو با وکلا",
    icon: MessageCircle,
    audience: "client",
  },
  {
    to: "/channels",
    title: "کانال‌ها",
    text: "حوزه‌ها، اتاق‌ها و پیام موکل‌ها",
    icon: Layers,
    audience: "lawyer",
  },
] as const;

export default function Panel() {
  usePageTitle("داشبورد");
  const mobile = useAppSelector((state) => state.main.verifiedMobile);
  const profile = profileRecord(useAppSelector((state) => state.main.userProfile));
  const isClient = isClientAccount(profile);
  const isLawyer = isLawyerAccount(profile);
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();
  const parsedScore = Number(profile?.score);
  const score = Number.isFinite(parsedScore) ? parsedScore : 0;
  const renewalDays = profile?.id != null ? renewalDaysLeft(profile.createdAt) : null;
  const visible = shortcuts.filter((item) => {
    if (item.audience === "client") return isClient;
    if (item.audience === "lawyer") return isLawyer;
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-2 text-2xl font-bold text-ink">{name}</h1>
          </div>
          {profile?.id != null && (
            <p className="rounded-full bg-[#fff4d6] px-3 py-1 text-sm font-medium text-[#8a5a00]">
              امتیاز:{score.toLocaleString("fa-IR")}
            </p>
          )}
        </div>
        <p className="mt-3 text-sm leading-7 text-muted">
          {isLawyer ? "حساب وکیل" : isClient ? "حساب موکل" : "حساب کاربری"}
          {mobile ? (
            <>
              {" "}
              با شماره <bdi>{mobile}</bdi> وارد شده است.
            </>
          ) : (
            " فعال است."
          )}
        </p>
        {renewalDays != null && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#d5e2f2] bg-[#eef4fb] px-4 py-3.5">
            <span className="flex items-center gap-2 text-sm font-medium text-navy">
              <CalendarDays size={18} aria-hidden="true" />
              تمدید
            </span>
            <span className="text-lg font-bold text-ink">
              {renewalDays === 0
                ? "امروز موعد تمدید است"
                : `${renewalDays.toLocaleString("fa-IR")} روز مانده`}
            </span>
          </div>
        )}
      </section>

      <section aria-label="بخش‌های دادوین">
        <h2 className="mb-3 text-base font-medium text-ink">بخش‌ها</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8eef6] text-navy">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-medium text-ink">{item.title}</span>
                    <span className="mt-1 block text-sm leading-7 text-muted">{item.text}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
