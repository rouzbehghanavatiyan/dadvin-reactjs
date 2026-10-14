export function readAuthResult(response) {
  if (response?.code !== 0 || response?.data?.isSuccess !== true) {
    const message = response?.data?.message || response?.message;
    throw new Error(
      typeof message === "string" && message.trim()
        ? message
        : "سرور موفقیت عملیات را تأیید نکرد. لطفاً دوباره تلاش کنید.",
    );
  }
  return response.data;
}
