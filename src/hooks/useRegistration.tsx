import { useEffect, useRef, useState } from "react";
import { registerAccount, verifyRegistrationCode } from "../services";
import { useNavigate } from "react-router-dom";
import { beginVerifiedSession } from "../utils/authSession";
import { createLoginPayload } from "../utils/authContract";
import { setOtpSession } from "./slices/mainReducer";
import useOtpCooldown from "./useOtpCooldown";
import { getErrorMessage } from "../services/masterService";
import { useAppDispatch } from "./store/store";
import {
  toAuthFlowError,
  type FlowFeedback,
  type RegistrationFormValues,
  type UserProfile,
} from "../types/domain";

export default function useRegistration() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cooldown = useOtpCooldown();
  const [step, setStep] = useState<"details" | "otp" | "complete">("details");
  const [pendingRegistration, setPendingRegistration] =
    useState<RegistrationFormValues | null>(null);
  const [feedback, setFeedback] = useState<FlowFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const requestInFlight = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      requestInFlight.current?.abort();
      requestInFlight.current = null;
    },
    [],
  );

  async function run(action: (signal: AbortSignal) => Promise<void>) {
    if (requestInFlight.current) return;
    const request = new AbortController();
    requestInFlight.current = request;
    setBusy(true);
    setFeedback(null);
    try {
      await action(request.signal);
    } catch (error) {
      if (!request.signal.aborted) {
        const failure = toAuthFlowError(error);
        setFeedback({
          kind: "error",
          message: getErrorMessage(error),
          loginMobile: failure.loginMobile,
        });
      }
    } finally {
      if (requestInFlight.current === request) {
        requestInFlight.current = null;
        setBusy(false);
      }
    }
  }

  function requestCode(values: RegistrationFormValues) {
    return run(async (signal) => {
      let result;
      try {
        result = await registerAccount(values, { signal });
      } catch (error) {
        const failure = toAuthFlowError(error);
        if (failure.requiresLogin)
          failure.loginMobile = createLoginPayload({
            mobile: values.phoneNumber,
          }).mobile;
        throw failure;
      }
      if (signal.aborted) return;
      setPendingRegistration({ ...values });
      cooldown.start();
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید ارسال شد.",
      });
      setStep("otp");
    });
  }

  function verifyCode({ code }: { code: string }) {
    return run(async (signal) => {
      if (!pendingRegistration) return;
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
      dispatch(setOtpSession({ mobile, user: result as UserProfile }));
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
