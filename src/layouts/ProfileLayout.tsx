import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/store/store";
import { UserRound, ArrowRight, LogOut, FileText } from "lucide-react";
import Brand from "../UI/Brand";
import Btn from "../UI/Btn";
import {
  clearOtpSession,
  setUserProfile,
  setLoadingProfile,
} from "../hooks/slices/mainReducer";
import { clearVerifiedSession, getAccessToken } from "../utils/authSession";
import { getUserProfile } from "../services";

// خواندن آدرس پایه از متغیر محیطی یا مقدار پیش‌فرض سرور
const BASE_URL = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

export default function ProfileLayout() {
  const verifiedMobile = useAppSelector((state) => state.main.verifiedMobile);
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [imageError, setImageError] = useState(false);
  const isRequestsActive = location.pathname.startsWith("/requests");

  const photoPath =
    userProfile?.photoLocation ||
    userProfile?.profileAttachment?.location ||
    userProfile?.profileAttachment?.path;

  const avatarSrc = photoPath
    ? photoPath.startsWith("http")
      ? photoPath
      : `${BASE_URL}/${photoPath.replace(/^\/+/, "")}`
    : null;

  useEffect(() => {
    const token = getAccessToken();
    if (!token && !verifiedMobile) return;

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        dispatch(setLoadingProfile(true));
        const data = await getUserProfile();

        if (isMounted && data) {
          dispatch(setUserProfile(data));
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        if (isMounted) {
          dispatch(setLoadingProfile(false));
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch, verifiedMobile]);

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile?.lastName || ""}`.trim()
    : "پنل کاربری";

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to={verifiedMobile ? "/panel" : "/login"} aria-label="دادوین">
            <Brand />
          </Link>

          <div className="flex items-center gap-4 text-xs">
            {verifiedMobile ? (
              <>
                <Link
                  to="/requests"
                  className={`flex items-center gap-1.5 text-navy transition-colors hover:text-primary ${
                    isRequestsActive ? "font-bold underline" : ""
                  }`}
                >
                  <FileText size={16} />
                  <span>درخواست‌ها</span>
                </Link>

                {/* دکمه پروفایل به همراه آواتار */}
                <Link
                  to="/panel"
                  className={`flex items-center gap-2.5 rounded-full py-1 pr-1.5 pl-3 transition-colors hover:bg-slate-100 ${
                    location.pathname === "/panel"
                      ? "bg-slate-100 font-bold"
                      : "text-navy"
                  }`}
                >
                  {/* دایره آواتار */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500 shadow-xs">
                    {avatarSrc && !imageError ? (
                      <img
                        src={avatarSrc}
                        alt={displayName}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <UserRound size={17} />
                    )}
                  </div>

                  <span className="max-w-[130px] truncate">{displayName}</span>
                </Link>

                <div className="mr-1 border-r border-line pr-3">
                  <Btn
                    variant="ghost"
                    className="!p-1.5 !text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      clearVerifiedSession();
                      dispatch(clearOtpSession());
                      navigate("/login", { replace: true });
                    }}
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">خروج</span>
                  </Btn>
                </div>
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

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-white py-6 px-5 text-center text-[11px] text-muted shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]">
        دادوین · تخصص، شفافیت، اعتماد
      </footer>
    </div>
  );
}
