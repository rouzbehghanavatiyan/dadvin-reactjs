import useOtpLogin from "../../hooks/useOtpLogin";
import MobileLoginForm from "./MobileLoginForm";
import OtpForm from "./OtpForm";
import { useLocation } from "react-router-dom";
export default function LoginForm() {
  const location = useLocation();
  const initialMobile = /^09\d{9}$/.test(location.state?.mobile || "")
    ? location.state.mobile
    : "";
  const flow = useOtpLogin();
  if (flow.mobile)
    return (
      <OtpForm
        key={flow.challengeVersion}
        resendCode={flow.resendCode}
        secondsLeft={flow.secondsLeft}
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
      defaultMobile={flow.draftMobile || initialMobile}
    />
  );
}
