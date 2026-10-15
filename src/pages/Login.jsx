import MainTitle from "../UI/MainTitle";
import AuthTabs from "../components/auth/AuthTabs";
import LoginForm from "../components/auth/LoginForm";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
export default function Login() {
  usePageTitle("ورود");
  const verifiedMobile = useSelector((state) => state.main.verifiedMobile);
  if (verifiedMobile) return <Navigate to="/panel" replace />;
  return (
    <>
      <MainTitle title="به دادوین خوش آمدید">
        شماره موبایل خود را وارد کنید تا کد تأیید برای شما ارسال شود.
      </MainTitle>
      <AuthTabs />
      <LoginForm />
    </>
  );
}
