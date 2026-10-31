import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Brand from "../UI/Brand";
export default function Header() {
  const isRegister = useLocation().pathname === "/register";
  return (
    <header className="flex items-center justify-between gap-3 lg:justify-start">
      <div className="lg:hidden">
        <Brand />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted">
        <span className="hidden sm:inline">
          {isRegister ? "حساب کاربری دارید؟" : "حساب کاربری ندارید؟"}
        </span>
        <Link
          to={isRegister ? "/login" : "/register"}
          className="flex items-center gap-2 font-medium text-ink hover:underline"
        >
          {isRegister ? "وارد شوید" : "ثبت نام کنید"}
          <ArrowLeft size={12} />
        </Link>
      </div>
    </header>
  );
}
