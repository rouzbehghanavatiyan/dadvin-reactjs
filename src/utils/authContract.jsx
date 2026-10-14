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
  return {
    registrationPermit: permitFor(values),
    name: values.name?.trim() || null,
    lastName: values.lastName?.trim() || null,
    email: values.email?.trim() || null,
    nationalCode: normalizeDigits(values.nationalCode || "").trim() || null,
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
