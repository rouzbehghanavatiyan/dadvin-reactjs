import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireOtpSession() {
  const verifiedMobile = useSelector((state) => state.main.verifiedMobile);
  return verifiedMobile ? <Outlet /> : <Navigate to="/login" replace />;
}
