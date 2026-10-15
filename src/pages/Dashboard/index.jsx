import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BadgeCheck, UserRound, ArrowLeft } from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";

export default function Panel() {
  usePageTitle("پنل کاربری");
  const mobile = useSelector((state) => state.main.verifiedMobile);
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-xs text-muted">حساب کاربری / پنل من</p>
        <h1 className="text-2xl font-bold text-ink">به پنل دادوین خوش آمدید</h1>
      </div>
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-9">
        <div className="flex items-center gap-3">
          <BadgeCheck className="text-emerald-600" size={28} />
          <h2 className="font-medium text-ink">شماره موبایل شما تأیید شد</h2>
        </div>
        <p className="mt-4 text-sm leading-8 text-muted">
          ورود با شماره <bdi>{mobile}</bdi> انجام شد.
        </p>
      </section>
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-9">
        <UserRound size={26} className="mb-4 text-navy" />
        <h2 className="text-lg font-medium text-ink">
          پروفایل خود را تکمیل کنید
        </h2>
        <p className="mt-3 text-sm leading-8 text-muted">
          فرم پروفایل برای تکمیل اطلاعات و انتخاب عکس آماده است. ذخیره اطلاعات
          روی سرور پس از اتصال سرویس پروفایل فعال می‌شود.
        </p>
        <Link
          to="/profile"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm text-white"
        >
          مشاهده فرم پروفایل
          <ArrowLeft size={16} />
        </Link>
      </section>
    </div>
  );
}
