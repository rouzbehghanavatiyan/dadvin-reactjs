import MainTitle from "../UI/MainTitle";
import AuthTabs from "../components/auth/AuthTabs";
import LoginForm from "../components/auth/LoginForm";
import SocialLogin from "../components/auth/SocialLogin";
import usePageTitle from "../hooks/usePageTitle";
export default function Login() {
  usePageTitle("ورود");
  return (
    <>
      <MainTitle title="به دادوین خوش آمدید">
        برای دسترسی به خدمات حقوقی، وارد حساب کاربری خود شوید.
      </MainTitle>
      <AuthTabs />
      <LoginForm />
      <SocialLogin />
    </>
  );
}
