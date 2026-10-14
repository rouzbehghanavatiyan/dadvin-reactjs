import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowRight, Smartphone } from "lucide-react";
import MainTitle from "../UI/MainTitle";
import Input from "../UI/Input";
import Btn from "../UI/Btn";
import Alert from "../UI/Alert";
import { mobileRules } from "../utils/validation";
import { recoverPassword } from "../services";
import useAuthForm from "../hooks/useAuthForm";
import usePageTitle from "../hooks/usePageTitle";

export default function ForgotPassword() {
  usePageTitle("بازیابی رمز عبور");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { submit, feedback } = useAuthForm(recoverPassword);
  return (
    <>
      <MainTitle
        eyebrow="RECOVER YOUR ACCOUNT"
        title="رمزتان را فراموش کرده‌اید؟"
      >
        شماره موبایل حساب خود را برای درخواست بازیابی وارد کنید.
      </MainTitle>
      <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
        <Input
          label="شماره موبایل"
          icon={Smartphone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
          {...register("mobile", mobileRules)}
          error={errors.mobile?.message}
        />
        {feedback && <Alert kind={feedback.kind}>{feedback.message}</Alert>}
        <Btn type="submit" loading={isSubmitting} className="w-full">
          درخواست بازیابی رمز عبور
        </Btn>
      </form>
      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-2 text-xs text-navy"
      >
        <ArrowRight size={16} />
        بازگشت به ورود
      </Link>
    </>
  );
}
