import { useEffect, type ReactNode } from "react";
import { setOtpSession } from "../hooks/slices/mainReducer";
import { useAppDispatch } from "../hooks/store/store";
import type { UserProfile } from "../types/domain";

export default function AuthInitializer({ children }: { children?: ReactNode }) {
  const dispatch = useAppDispatch();

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
