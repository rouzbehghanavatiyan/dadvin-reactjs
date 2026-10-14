import { useState } from "react";
import { getErrorMessage } from "../masterService";

export default function useAuthForm(action) {
  const [feedback, setFeedback] = useState(null);
  async function submit(values) {
    setFeedback(null);
    try {
      await action(values);
      // Do not infer authenticated state or persist unknown tokens before the API contract exists.
      setFeedback({
        kind: "success",
        message:
          "پاسخ سرور دریافت شد. تکمیل این مرحله به فعال‌شدن فرایند احراز هویت وابسته است.",
      });
    } catch (error) {
      setFeedback({ kind: "error", message: getErrorMessage(error) });
    }
  }
  return { feedback, submit };
}
