import Btn from "../../UI/Btn";

export default function OtpResend({ onResend, secondsLeft, busy }) {
  return (
    <div className="space-y-3 border-t border-line pt-4 text-center">
      <p className="text-xs leading-7 text-muted">
        پیامک نرسیده است؟ شماره را بررسی کنید یا پس از پایان زمان انتظار، ارسال
        مجدد را بزنید.
      </p>
      <Btn
        variant="outline"
        className="w-full"
        disabled={busy || secondsLeft > 0}
        onClick={onResend}
      >
        {secondsLeft > 0
          ? `ارسال مجدد تا ${secondsLeft.toLocaleString("fa-IR")} ثانیه دیگر`
          : "ارسال مجدد کد"}
      </Btn>
    </div>
  );
}
