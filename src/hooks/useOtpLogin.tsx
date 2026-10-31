import { useEffect, useRef, useState } from "react";
import { login, verifyLoginCode } from "../services";
import { createLoginPayload } from "../utils/authContract";
import { setOtpSession } from "./slices/mainReducer";
import { beginVerifiedSession, requireOtpDispatch } from "../utils/authSession";
import useOtpCooldown from "./useOtpCooldown";
import { getErrorMessage } from "../services/masterService";
import { useAppDispatch } from "./store/store";
import {
  toAuthFlowError,
  type FlowFeedback,
  type LoginInput,
  type UserProfile,
} from "../types/domain";

export default function useOtpLogin() {
  const [mobile, setMobile] = useState<string | null>(null);
  const [draftMobile, setDraftMobile] = useState("");
  const cooldown = useOtpCooldown();
  const [feedback, setFeedback] = useState<FlowFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
    },
    [],
  );

  async function run(action: (signal: AbortSignal) => Promise<void>) {
    if (activeRequest.current) return;
    const request = new AbortController();
    activeRequest.current = request;
    setBusy(true);
    setFeedback(null);
    try {
      await action(request.signal);
    } catch (error) {
      if (!request.signal.aborted) {
        const failure = toAuthFlowError(error);
        setFeedback({
          kind: "error",
          message:
            getErrorMessage(error) || failure.message || "خطایی رخ داده است.",
          requiresRegistration: failure.requiresRegistration === true,
          registrationMobile: failure.registrationMobile,
        });
      }
    } finally {
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setBusy(false);
      }
    }
  }

  function requestCode(values: LoginInput) {
    return run(async (signal) => {
      const payload = createLoginPayload(values);
      let result;
      try {
        const response = await login(payload, { signal });
        result = requireOtpDispatch(response);
      } catch (error) {
        const failure = toAuthFlowError(error);
        if (failure.requiresRegistration)
          failure.registrationMobile = payload.mobile;
        throw failure;
      }
      if (signal.aborted) return;
      setDraftMobile(payload.mobile);
      setMobile(payload.mobile);
      cooldown.start();
      setFeedback({
        kind: "success",
        message: result?.message || "کد تأیید ارسال شد.",
      });
    });
  }

  function verifyCode({ code }: { code: string }) {
    return run(async (signal) => {
      const response = await verifyLoginCode({ mobile, code }, { signal });

      // بررسی اینکه آیا توکن برگشته است یا خیر
      if (!response?.token) {
        throw new Error(
          response?.message || "خطا در تأیید کد یا عدم دریافت توکن.",
        );
      }
      console.log("rrrrrrrrrrrrrr", response);

      if (!signal.aborted) {
        beginVerifiedSession(response, mobile);
        console.log("VVVVVVVVVVVVVVVVVVVv", response);

        dispatch(
          setOtpSession({
            mobile: mobile || response.mobile || null,
            user: response as UserProfile,
          }),
        );

        setFeedback({
          kind: "success",
          message: response?.message || "ورود با موفقیت انجام شد.",
        });
      }
    });
  }

  function editMobile() {
    if (activeRequest.current) return;
    setMobile(null);
    setFeedback(null);
  }

  function resendCode() {
    if (!mobile || !cooldown.canResend()) return;
    return requestCode({ mobile });
  }

  return {
    mobile,
    draftMobile,
    feedback,
    busy,
    requestCode,
    verifyCode,
    editMobile,
    resendCode,
    secondsLeft: cooldown.secondsLeft,
    challengeVersion: cooldown.challengeVersion,
  };
}
