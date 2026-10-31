import { normalizeDigits } from "./StringHelper";

export const mobileRules = {
  required: "شماره موبایل را وارد کنید.",
  setValueAs: (value: string) => normalizeDigits(value).trim(),
  validate: (value: string) =>
    /^09\d{9}$/.test(value) ||
    "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.",
};

export const nationalCodeRules = {
  required: "کد ملی را وارد کنید.",
  setValueAs: (value: string) => normalizeDigits(value).trim(),
  validate: (value: string) => /^\d{10}$/.test(value) || "کد ملی باید ۱۰ رقم باشد.",
};
