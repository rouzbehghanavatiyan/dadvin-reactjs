import { normalizeDigits } from "./StringHelper";

export const identifierRules = {
  required: "ایمیل یا شماره موبایل را وارد کنید.",
  setValueAs: (value) => normalizeDigits(value).trim(),
  validate: (value) =>
    /^09\d{9}$/.test(value) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    "ایمیل معتبر یا شماره موبایل ۱۱ رقمی با ۰۹ وارد کنید.",
};

export const mobileRules = {
  required: "شماره موبایل را وارد کنید.",
  setValueAs: (value) => normalizeDigits(value).trim(),
  validate: (value) =>
    /^09\d{9}$/.test(value) ||
    "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.",
};
export const passwordRules = { required: "رمز عبور را وارد کنید." };
export const newPasswordRules = {
  ...passwordRules,
  minLength: { value: 8, message: "رمز عبور باید حداقل ۸ نویسه داشته باشد." },
  validate: (value) =>
    (/[A-Za-z]/.test(value) && /\d/.test(value)) ||
    "رمز عبور باید شامل حرف انگلیسی و عدد باشد.",
};
