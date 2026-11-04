import { useForm } from "react-hook-form";
import { Smartphone, ArrowLeft } from "lucide-react";
import Input from "../../UI/Input";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import { mobileRules } from "../../utils/validation";
import { Link } from "react-router-dom";
import type { FlowFeedback, LoginInput } from "../../types/domain";

type MobileLoginFormProps = {
  onSubmit: (values: LoginInput) => void | Promise<unknown>;
  busy: boolean;
  feedback: FlowFeedback | null;
  defaultMobile?: string;
};

export default function MobileLoginForm({
  onSubmit,
  busy,
  feedback,
  defaultMobile,
}: MobileLoginFormProps) {
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
      {feedback?.requiresRegistration && (
        <Link
          to="/register"
          state={{ mobile: feedback.registrationMobile }}
          className="block rounded-xl border border-line p-3 text-center text-sm text-navy"
        >
          با همین شماره ثبت‌نام کنید
        </Link>
      )}
      <Btn type="submit" loading={busy} className="w-full !rounded-lg !py-4">
        دریافت کد تأیید
        <ArrowLeft size={17} />
      </Btn>
    
    </form>
  );
}
