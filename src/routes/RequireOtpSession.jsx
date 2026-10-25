import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "../utils/authSession";

export default function RequireOtpSession() {
  const verifiedMobile = useSelector((state) => state.main.verifiedMobile);
  return verifiedMobile && getAccessToken() ? <Outlet /> : <Navigate to="/login" replace />;
}
