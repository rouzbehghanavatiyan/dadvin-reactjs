import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { login, verifyLoginCode } from "../services";
import { createLoginPayload } from "../utils/authContract";
import { getErrorMessage } from "../services/masterService";
import { setOtpSession } from "./slices/mainReducer";

export default function useOtpLogin() {
  const [mobile, setMobile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const activeRequest = useRef(null);
  const dispatch = useDispatch();
  useEffect(
    () => () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
    },
    [],
  );
  async function run(action) {
    if (activeRequest.current) return;
    const request = new AbortController();
    activeRequest.current = request;
    setBusy(true);
    setFeedback(null);
    try {
      await action(request.signal);
    } catch (error) {
      if (!request.signal.aborted)
        setFeedback({ kind: "error", message: getErrorMessage(error) });
    } finally {
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setBusy(false);
      }
    }
  }
  function requestCode(values) {
    return run(async (signal) => {
      const payload = createLoginPayload(values);
      const result = await login(payload, { signal });
      if (signal.aborted) return;
      setMobile(payload.mobile);
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید ارسال شد.",
      });
    });
  }
  function verifyCode({ code }) {
    return run(async (signal) => {
      await verifyLoginCode({ mobile, code }, { signal });
      if (!signal.aborted) dispatch(setOtpSession(mobile));
    });
  }
  function editMobile() {
    if (activeRequest.current) return;
    setMobile(null);
    setFeedback(null);
  }
  return { mobile, feedback, busy, requestCode, verifyCode, editMobile };
}
