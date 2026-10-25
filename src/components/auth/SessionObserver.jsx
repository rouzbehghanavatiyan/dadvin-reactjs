import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { subscribeSessionExpiration } from "../../utils/authSession";
import { clearOtpSession } from "../../hooks/slices/mainReducer";

export default function SessionObserver() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => subscribeSessionExpiration(() => {
    dispatch(clearOtpSession());
    navigate("/login", { replace: true, state: { sessionExpired: true } });
  }), [dispatch, navigate]);
  return null;
}
