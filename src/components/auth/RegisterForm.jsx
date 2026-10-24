import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import RegistrationFields from "./RegistrationFields";
import RegistrationConsent from "./RegistrationConsent";
import OtpForm from "./OtpForm";
import RegistrationComplete from "./RegistrationComplete";
import useRegistration from "../../hooks/useRegistration";
import { setSelectedRole } from "../../hooks/slices/mainReducer";
import { Link, useLocation } from "react-router-dom";

export default function RegisterForm() {
  const location = useLocation();
  const initialMobile = /^09\d{9}$/.test(location.state?.mobile || "")
    ? location.state.mobile
    : "";
  const savedRole = useSelector((state) => state.main.selectedRole);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    shouldUnregister: true,
    defaultValues: {
      name: "",
      lastName: "",
      phoneNumber: initialMobile,
      email: "",
      nationalCode: "",
      registrationPermit: "",
      role: savedRole === "lawyer" ? "lawyer" : "client",
      terms: false,
    },
  });
  const role = watch("role");
  const flow = useRegistration();
  const onSubmit = (values) => {
    dispatch(setSelectedRole(values.role));
    return flow.requestCode(values);
  };
  if (flow.step === "otp")
    return (
      <OtpForm
        phoneNumber={flow.pendingRegistration.phoneNumber}
        verifyCode={flow.verifyCode}
        editDetails={() => {
          reset(flow.pendingRegistration);
          flow.editDetails();
        }}
        busy={flow.busy}
        feedback={flow.feedback}
      />
    );
  if (flow.step === "complete")
    return <RegistrationComplete feedback={flow.feedback} />;
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <fieldset disabled={flow.busy} className="space-y-4">
        <RegistrationFields register={register} errors={errors} role={role} />
        <RegistrationConsent
          register={register}
          error={errors.terms?.message}
        />
      </fieldset>
      {flow.feedback && (
        <Alert kind={flow.feedback.kind}>{flow.feedback.message}</Alert>
      )}
      {flow.feedback?.loginMobile && (
        <Link
          to="/login"
          state={{ mobile: flow.feedback.loginMobile }}
          className="block rounded-xl border border-line p-3 text-center text-sm text-navy"
        >
          ورود به حساب موجود
        </Link>
      )}
      <Btn type="submit" loading={flow.busy} className="w-full">
        ارسال کد تأیید
        <ArrowLeft size={17} />
      </Btn>
      <p className="text-center text-[10px] leading-6 text-muted">
        ثبت‌نام با تأیید کد پیامک انجام می‌شود.
      </p>
    </form>
  );
}
