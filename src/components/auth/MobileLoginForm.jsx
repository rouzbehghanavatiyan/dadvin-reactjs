import { useForm } from "react-hook-form";
import { Smartphone, ArrowLeft } from "lucide-react";
import Input from "../../UI/Input";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import { mobileRules } from "../../utils/validation";

export default function MobileLoginForm({
  onSubmit,
  busy,
  feedback,
  defaultMobile,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { mobile: defaultMobile || "" } });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="شماره موبایل"
        icon={Smartphone}
        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        required
        disabled={busy}
        {...register("mobile", mobileRules)}
        error={errors.mobile?.message}
      />
      {feedback && <Alert kind={feedback.kind}>{feedback.message}</Alert>}
      <Btn type="submit" loading={busy} className="w-full !rounded-lg !py-4">
        دریافت کد تأیید
        <ArrowLeft size={17} />
      </Btn>
      <p className="text-center text-xs leading-7 text-muted">
        کد تأیید به شماره موبایل شما پیامک می‌شود.
      </p>
    </form>
  );
}
