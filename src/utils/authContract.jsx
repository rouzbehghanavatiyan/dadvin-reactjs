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
    phoneNumber: normalizeDigits(values.phoneNumber || "").trim(),
    code: normalizeDigits(values.code || "").trim(),
    registrationPermit: permitFor(values),
  };
}
