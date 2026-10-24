import { useForm } from "react-hook-form";
import { KeyRound, ArrowRight } from "lucide-react";
import Input from "../../UI/Input";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import { normalizeDigits } from "../../utils/StringHelper";
import OtpResend from "./OtpResend";

export default function OtpForm({
  phoneNumber,
  verifyCode,
  editDetails,
  busy,
  feedback,
  resendCode,
  secondsLeft = 0,
  submitLabel = "تأیید کد و تکمیل ثبت‌نام",
  editLabel = "ویرایش مشخصات یا شماره موبایل",
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { code: "" } });
  return (
    <section className="space-y-5" aria-label="تأیید شماره موبایل">
      <h2 className="text-lg font-medium text-ink">کد تأیید را وارد کنید</h2>
      <p className="text-xs leading-7 text-muted">
        کد پیامک‌شده به{" "}
        <bdi className="font-medium text-ink">{phoneNumber}</bdi> را وارد کنید.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit(verifyCode)}
        className="space-y-4"
      >
        <Input
          label="کد تأیید"
          icon={KeyRound}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          disabled={busy}
          {...register("code", {
            required: "کد تأیید را وارد کنید.",
            setValueAs: (value) => normalizeDigits(value).trim(),
            validate: (value) =>
              /^\d+$/.test(value) || "کد تأیید را با ارقام وارد کنید.",
          })}
          error={errors.code?.message}
        />
        {feedback && <Alert kind={feedback.kind}>{feedback.message}</Alert>}
        <Btn type="submit" loading={busy} className="w-full">
          {submitLabel}
        </Btn>
      </form>
      {resendCode && (
        <OtpResend
          onResend={resendCode}
          secondsLeft={secondsLeft}
          busy={busy}
        />
      )}
      <Btn
        variant="ghost"
        onClick={editDetails}
        disabled={busy}
        className="w-full"
      >
        <ArrowRight size={16} />
        {editLabel}
      </Btn>
    </section>
  );
}
