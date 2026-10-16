import { useRef, useState } from "react";
import { registerAccount, verifyRegistrationCode } from "../services";
import { getErrorMessage } from "../services/masterService";

export default function useRegistration() {
  const [step, setStep] = useState("details");
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const requestInFlight = useRef(false);

  async function run(action) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      await action();
    } catch (error) {
      setFeedback({ kind: "error", message: getErrorMessage(error) });
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  function requestCode(values) {
    return run(async () => {
      const result = await registerAccount(values);
      // Keep the role and permit from this exact registration for OTP verification.
      setPendingRegistration({ ...values });
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید ارسال شد.",
      });
      setStep("otp");
    });
  }

  function verifyCode({ code }) {
    return run(async () => {
      const result = await verifyRegistrationCode({
        ...pendingRegistration,
        code,
      });
      setFeedback({
        kind: "success",
        message: result.message || "کد تأیید با موفقیت تأیید شد.",
      });
      setStep("complete");
      setPendingRegistration(null);
      // Verification is confirmed by the server. Session/token behavior is not yet documented.
    });
  }

  function editDetails() {
    if (requestInFlight.current) return;
    setStep("details");
    setFeedback(null);
    setPendingRegistration(null);
  }

  return {
    step,
    pendingRegistration,
    feedback,
    busy,
    requestCode,
    verifyCode,
    editDetails,
  };
}
