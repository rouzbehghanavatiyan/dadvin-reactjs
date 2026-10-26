let accessToken = null;

export function beginVerifiedSession(result, mobile) {
  const token = result?.token || result?.result?.token;
  if (!token) throw new Error("توکن معتبر دریافت نشد.");
  localStorage.setItem("authToken", token);
  localStorage.setItem("userProfile", JSON.stringify(result));
  localStorage.setItem("verifiedMobile", mobile);
}

export function getAccessToken() {
  return localStorage.getItem("authToken");
}

export function clearVerifiedSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("verifiedMobile");
  accessToken = null;
}

export function requireOtpDispatch(result) {
  if (result?.result?.token != null || result?.token != null)
    throw new Error(
      "سرور پیش از تأیید کد، توکن ورود برگرداند. برای ادامه، جریان OTP باید در بک‌اند اصلاح شود.",
    );
  return result;
}
