import MainTitle from "../UI/MainTitle";
import AuthTabs from "../components/auth/AuthTabs";
import LoginForm from "../components/auth/LoginForm";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Alert from "../UI/Alert";
import usePageTitle from "../hooks/usePageTitle";
export default function Login() {
  usePageTitle("ورود");
  const location = useLocation();
  const verifiedMobile = useSelector((state) => state.main.verifiedMobile);
  if (verifiedMobile) return <Navigate to="/panel" replace />;
  return (
    <>
      <MainTitle title="به دادوین خوش آمدید">
        شماره موبایل خود را وارد کنید تا کد تأیید برای شما ارسال شود.
      </MainTitle>
      <AuthTabs />
      {location.state?.sessionExpired && <Alert>نشست شما منقضی شده یا معتبر نیست. لطفاً دوباره وارد شوید.</Alert>}
      <LoginForm />
    </>
  );
}
