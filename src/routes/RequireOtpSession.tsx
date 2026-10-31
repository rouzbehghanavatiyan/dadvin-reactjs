import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/store/store";

export default function RequireOtpSession() {
  const verifiedMobile = useAppSelector((state) => state.main.verifiedMobile);
  return verifiedMobile ? <Outlet /> : <Navigate to="/login" replace />;
}
