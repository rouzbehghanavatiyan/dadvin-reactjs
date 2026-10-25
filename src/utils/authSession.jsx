let accessToken = null;
const expirationListeners = new Set();

// Memory only. Call only after server-confirmed login/signup OTP verification.
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

export function subscribeSessionExpiration(listener) {
  expirationListeners.add(listener);
  return () => expirationListeners.delete(listener);
}

// A delayed failure from an older request must not log out a newer session.
export function expireVerifiedSession(rejectedToken) {
  if (!accessToken || rejectedToken !== accessToken) return false;
  clearVerifiedSession();
  for (const listener of expirationListeners) listener();
  return true;
}

export function requireOtpDispatch(result) {
  if (result?.result?.token != null || result?.token != null)
    throw new Error(
      "سرور پیش از تأیید کد، توکن ورود برگرداند. برای ادامه، جریان OTP باید در بک‌اند اصلاح شود.",
    );
  return result;
}
