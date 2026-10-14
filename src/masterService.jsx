import http from "./utils/axios";

export async function postAuth(path, payload) {
  if (!path)
    throw new Error(
      "سرویس احراز هویت هنوز فعال نشده است. لطفاً پس از راه‌اندازی سرویس دوباره تلاش کنید.",
    );
  const { data } = await http.post(path, payload);
  return data;
}

export function getErrorMessage(error) {
  if (!error.isAxiosError)
    return error.message || "خطایی رخ داد. دوباره تلاش کنید.";
  if (error.code === "ECONNABORTED")
    return "پاسخ سرور طول کشید. لطفاً دوباره تلاش کنید.";
  if (!error.response)
    return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.";
  const body = error.response.data;
  const serverMessage = body?.data?.message || body?.message;
  if (typeof serverMessage === "string" && serverMessage.trim())
    return serverMessage;
  if (body?.errors && typeof body.errors === "object") {
    const messages = Object.values(body.errors)
      .flat()
      .filter((value) => typeof value === "string");
    if (messages.length) return messages.join(" ");
  }
  if (error.response.status === 401)
    return "شماره موبایل یا رمز عبور نادرست است.";
  if (error.response.status === 429)
    return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.";
  return "درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.";
}
