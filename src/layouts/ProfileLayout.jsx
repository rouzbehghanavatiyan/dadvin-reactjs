import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserRound, ArrowRight, LogOut } from "lucide-react";
import Brand from "../UI/Brand";
import Btn from "../UI/Btn";
import { clearOtpSession } from "../hooks/slices/mainReducer";

export default function ProfileLayout() {
  const verifiedMobile = useSelector((state) => state.main.verifiedMobile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 sm:px-8">
          <Link to={verifiedMobile ? "/panel" : "/login"} aria-label="دادوین">
            <Brand />
          </Link>
          <div className="flex items-center gap-5 text-xs">
            <span className="hidden items-center gap-2 text-muted sm:flex">
              <UserRound size={16} />
              {location.pathname === "/panel" ? "پنل کاربری" : "پروفایل من"}
            </span>
            {verifiedMobile ? (
              <>
                <Link to="/panel" className="text-navy">
                  پنل کاربری
                </Link>
                <Btn
                  variant="ghost"
                  className="!p-2 !text-xs"
                  onClick={() => {
                    dispatch(clearOtpSession());
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut size={16} />
                  خروج
                </Btn>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-navy">
                <ArrowRight size={15} />
                صفحه ورود
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
      <footer className="px-5 pb-8 text-center text-[11px] text-muted">
        دادوین · تخصص، شفافیت، اعتماد
      </footer>
    </div>
  );
}
