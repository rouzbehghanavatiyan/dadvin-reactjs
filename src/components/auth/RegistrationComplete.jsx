import { CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Alert from "../../UI/Alert";

export default function RegistrationComplete({ feedback }) {
  return (
    <section
      className="space-y-5 text-center"
      aria-label="نتیجه تأیید شماره موبایل"
    >
      <CircleCheck
        size={48}
        className="mx-auto text-emerald-600"
        aria-hidden="true"
      />
      <h2 className="text-xl font-medium text-ink">شماره موبایل تأیید شد</h2>
      {feedback && <Alert kind={feedback.kind}>{feedback.message}</Alert>}
      <p className="text-xs leading-7 text-muted">
        تأیید کد توسط سرور انجام شد. تأیید صلاحیت حرفه‌ای وکیل مرحله‌ای جداگانه
        است.
      </p>
      <Link
        to="/login"
        className="inline-block rounded-xl border border-line px-6 py-3 text-sm text-navy"
      >
        بازگشت به صفحه ورود
      </Link>
    </section>
  );
}
