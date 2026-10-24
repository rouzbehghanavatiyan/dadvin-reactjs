import { useEffect, useRef, useState } from "react";
import { registerAccount, verifyRegistrationCode } from "../services";
import { getErrorMessage } from "../masterService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { beginVerifiedSession } from "../utils/authSession";
import { createLoginPayload } from "../utils/authContract";
import { setOtpSession } from "./slices/mainReducer";
import useOtpCooldown from "./useOtpCooldown";

export default function useRegistration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cooldown = useOtpCooldown();
  const [step, setStep] = useState("details");
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const requestInFlight = useRef(null);
  useEffect(
    () => () => {
      requestInFlight.current?.abort();
      requestInFlight.current = null;
    },
    [],
  );

  async function run(action) {
    if (requestInFlight.current) return;
    const request = new AbortController();
    requestInFlight.current = request;
    setBusy(true);
    setFeedback(null);
    try {
      await action(request.signal);
    } catch (error) {
      if (!request.signal.aborted)
        setFeedback({
          kind: "error",
          message: getErrorMessage(error),
          loginMobile: error.loginMobile,
        });
    } finally {
      if (requestInFlight.current === request) {
        requestInFlight.current = null;
        setBusy(false);
      }
    }
  }

  function requestCode(values) {
    return run(async (signal) => {
      let result;
      try {
        result = await registerAccount(values, { signal });
      } catch (error) {
        if (error.requiresLogin)
          error.loginMobile = createLoginPayload({
            mobile: values.phoneNumber,
          }).mobile;
        throw error;
      }
      if (signal.aborted) return;
      // Keep the role and permit from this exact registration for OTP verification.
      setPendingRegistration({ ...values });
      cooldown.start();
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید ارسال شد.",
      });
      setStep("otp");
    });
  }

  function verifyCode({ code }) {
    return run(async (signal) => {
      const result = await verifyRegistrationCode(
        {
          ...pendingRegistration,
          code,
        },
        { signal },
      );
      if (signal.aborted) return;
      const { mobile } = createLoginPayload({
        mobile: pendingRegistration.phoneNumber,
      });
      beginVerifiedSession(result, mobile);
      dispatch(setOtpSession(mobile));
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید با موفقیت تأیید شد.",
      });
      setStep("complete");
      setPendingRegistration(null);
      navigate("/panel", { replace: true });
    });
  }

  function editDetails() {
    if (requestInFlight.current) return;
    setStep("details");
    setFeedback(null);
    setPendingRegistration(null);
  }
  function resendCode() {
    if (!pendingRegistration || !cooldown.canResend()) return;
    return requestCode(pendingRegistration);
  }

  return {
    step,
    pendingRegistration,
    feedback,
    busy,
    requestCode,
    verifyCode,
    editDetails,
    resendCode,
    secondsLeft: cooldown.secondsLeft,
    challengeVersion: cooldown.challengeVersion,
  };
}
