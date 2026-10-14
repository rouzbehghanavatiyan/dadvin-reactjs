import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import Input from "../../UI/Input";
import PasswordInput from "../../UI/PasswordInput";
import Checkbox from "../../UI/Checkbox";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import { identifierRules, passwordRules } from "../../utils/validation";
import { login } from "../../services";
import useAuthForm from "../../hooks/useAuthForm";
export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });
  const { feedback, submit } = useAuthForm(login);
  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
      <Input
        label="ایمیل یا شماره موبایل"
        icon={Mail}
        placeholder="example@email.com"
        dir="ltr"
        autoComplete="username"
        {...register("identifier", identifierRules)}
        error={errors.identifier?.message}
      />
      <PasswordInput
        label="رمز عبور"
        placeholder="رمز عبور خود را وارد کنید"
        autoComplete="current-password"
        {...register("password", passwordRules)}
        error={errors.password?.message}
      />
      <div className="flex items-center justify-between gap-3">
        <Checkbox {...register("rememberMe")}>مرا به خاطر بسپار</Checkbox>
        <Link
          to="/forgot-password"
          className="text-[11px] text-ink hover:underline"
        >
          فراموشی رمز عبور؟
        </Link>
      </div>
      {feedback && <Alert kind={feedback.kind}>{feedback.message}</Alert>}
      <Btn
        type="submit"
        loading={isSubmitting}
        className="w-full !rounded-lg !py-4"
      >
        <ArrowRight size={18} />
        ورود
      </Btn>
    </form>
  );
}
