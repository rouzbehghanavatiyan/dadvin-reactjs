import { useEffect, type ReactNode } from "react";
import { clearOtpSession, setOtpSession } from "../hooks/slices/mainReducer";
import { setUnauthorizedHandler } from "../utils/authSession";
import { useAppDispatch } from "../hooks/store/store";
import type { UserProfile } from "../types/domain";

export default function AuthInitializer({ children }: { children?: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(clearOtpSession());
    });
    return () => setUnauthorizedHandler(null);
  }, [dispatch]);

  useEffect(() => {
    const savedUser = localStorage.getItem("userProfile");
    const savedMobile = localStorage.getItem("verifiedMobile");

    if (savedUser && savedMobile) {
      dispatch(
        setOtpSession({
          mobile: savedMobile,
          user: JSON.parse(savedUser) as UserProfile,
        }),
      );
    }
  }, [dispatch]);

  return children;
}
