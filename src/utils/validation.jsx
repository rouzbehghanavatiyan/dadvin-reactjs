import { normalizeDigits } from "./StringHelper";

export const mobileRules = {
  required: "شماره موبایل را وارد کنید.",
  setValueAs: (value) => normalizeDigits(value).trim(),
  validate: (value) =>
    /^09\d{9}$/.test(value) ||
    "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.",
};

export const nationalCodeRules = {
  required: "کد ملی را وارد کنید.",
  setValueAs: (value) => normalizeDigits(value).trim(),
  validate: (value) => /^\d{10}$/.test(value) || "کد ملی باید ۱۰ رقم باشد.",
};
