import useOtpLogin from "../../hooks/useOtpLogin";
import MobileLoginForm from "./MobileLoginForm";
import OtpForm from "./OtpForm";
export default function LoginForm() {
  const flow = useOtpLogin();
  if (flow.mobile)
    return (
      <OtpForm
        phoneNumber={flow.mobile}
        verifyCode={flow.verifyCode}
        editDetails={flow.editMobile}
        busy={flow.busy}
        feedback={flow.feedback}
        submitLabel="تأیید کد و ورود به پنل"
        editLabel="ویرایش شماره موبایل"
      />
    );
  return (
    <MobileLoginForm
      onSubmit={flow.requestCode}
      busy={flow.busy}
      feedback={flow.feedback}
    />
  );
}
