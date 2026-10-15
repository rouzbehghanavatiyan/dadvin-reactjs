import { normalizeDigits } from "./StringHelper";

function permitFor(values) {
  if (values.role === "client") return null;
  if (values.role !== "lawyer")
    throw new Error("این نقش هنوز در سرویس ثبت‌نام پشتیبانی نمی‌شود.");
  const permit = normalizeDigits(values.registrationPermit || "").trim();
  if (!permit) throw new Error("شماره پروانه وکالت را وارد کنید.");
  return permit;
}

export function createRegisterPayload(values) {
  const nationalCode = normalizeDigits(values.nationalCode || "").trim();
  if (!/^\d{10}$/.test(nationalCode))
    throw new Error("کد ملی ۱۰ رقمی را وارد کنید.");
  return {
    registrationPermit: permitFor(values),
    name: values.name?.trim() || null,
    lastName: values.lastName?.trim() || null,
    email: values.email?.trim() || null,
    nationalCode,
    phoneNumber: normalizeDigits(values.phoneNumber || "").trim(),
  };
}

export function createVerifyPayload(values) {
  return {
    mobile: normalizeDigits(values.phoneNumber || "").trim(),
    code: normalizeDigits(values.code || "").trim(),
    firstName: values.name?.trim() || null,
    lastName: values.lastName?.trim() || null,
    email: values.email?.trim() || null,
    nationalCode: normalizeDigits(values.nationalCode || "").trim() || null,
    registrationPermit: permitFor(values),
  };
}

export function createLoginPayload(values) {
  const mobile = normalizeDigits(values.mobile || "").trim();
  if (!/^09\d{9}$/.test(mobile))
    throw new Error("شماره موبایل ۱۱ رقمی با ۰۹ وارد کنید.");
  return { mobile };
}

export function createLoginVerifyPayload(values) {
  const { mobile } = createLoginPayload(values);
  const code = normalizeDigits(values.code || "").trim();
  if (!/^\d+$/.test(code)) throw new Error("کد تأیید را با ارقام وارد کنید.");
  return { mobile, code };
}
