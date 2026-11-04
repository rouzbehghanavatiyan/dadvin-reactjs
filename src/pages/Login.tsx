import MainTitle from "../UI/MainTitle";
import AuthTabs from "../components/auth/AuthTabs";
import LoginForm from "../components/auth/LoginForm";
import { useAppSelector } from "../hooks/store/store";
import { Navigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
export default function Login() {
  usePageTitle("ورود");
  const verifiedMobile = useAppSelector((state) => state.main.verifiedMobile);
  if (verifiedMobile) return <Navigate to="/panel" replace />;
  return (
    <>
      <MainTitle title="به دادوین خوش آمدید">
      </MainTitle>
      <AuthTabs />
      <LoginForm />
    </>
  );
}
