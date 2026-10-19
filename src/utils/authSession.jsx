let accessToken = null;

// Memory only. Call this only after a successful verifyLoginCode response.
export function beginVerifiedSession(result, mobile) {
  const account = result?.token ? result : result?.result;
  const token = account?.token;
  if (typeof token !== "string" || !token || /\s/.test(token))
    throw new Error("سرور پس از تأیید کد، توکن معتبر نشست برنگرداند.");
  if (account.mobile && account.mobile !== mobile)
    throw new Error("شماره حساب تأییدشده با درخواست ورود مطابقت ندارد.");
  accessToken = token;
}

export const getAccessToken = () => accessToken;
export function clearVerifiedSession() {
  accessToken = null;
}

export function requireOtpDispatch(result) {
  if (result?.result?.token != null || result?.token != null)
    throw new Error(
      "سرور پیش از تأیید کد، توکن ورود برگرداند. برای ادامه، جریان OTP باید در بک‌اند اصلاح شود.",
    );
  return result;
}
