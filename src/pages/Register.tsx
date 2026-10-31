import MainTitle from "../UI/MainTitle";
import AuthTabs from "../components/auth/AuthTabs";
import RegisterForm from "../components/auth/RegisterForm";
import usePageTitle from "../hooks/usePageTitle";

export default function Register() {
  usePageTitle("ثبت‌نام در دادوین");
  return (
    <>
      <MainTitle title="به جمع دادوین بپیوندید">
        اولین قدم برای یک ارتباط حقوقی مطمئن را بردارید.
      </MainTitle>
      <AuthTabs />
      <RegisterForm />
    </>
  );
}
