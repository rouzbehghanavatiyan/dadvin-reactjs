import type { VerificationResult } from "../types/domain";

const TOKEN_KEY = "authToken";

const LEGACY_TOKEN_KEYS = [
  "token",
  "accessToken",
  "refreshToken",
  "user",
] as const;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined" || typeof localStorage.getItem !== "function")
      return null;
    return localStorage;
  } catch {
    return null;
  }
}

function session(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined" || typeof sessionStorage.getItem !== "function")
      return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function beginVerifiedSession(
  result: VerificationResult | null | undefined,
  mobile: string | null,
) {
  const token = result?.token || result?.result?.token;
  if (!token) throw new Error("توکن معتبر دریافت نشد.");
  const store = storage();
  if (!store) throw new Error("توکن معتبر دریافت نشد.");
  store.setItem(TOKEN_KEY, token);
  store.setItem("userProfile", JSON.stringify(result));
  store.setItem("verifiedMobile", mobile as string);
}

export function clearVerifiedSession() {
  const store = storage();
  store?.removeItem(TOKEN_KEY);
  store?.removeItem("userProfile");
  store?.removeItem("verifiedMobile");
  for (const key of LEGACY_TOKEN_KEYS) store?.removeItem(key);

  const temporary = session();
  temporary?.removeItem("token");
  temporary?.removeItem("accessToken");

  if (typeof document !== "undefined") {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

export function requireOtpDispatch(result: VerificationResult | null | undefined) {
  if (result?.result?.token != null || result?.token != null)
    throw new Error(
      "سرور پیش از تأیید کد، توکن ورود برگرداند. برای ادامه، جریان OTP باید در بک‌اند اصلاح شود.",
    );
  return result;
}
