export function readAuthResult(response) {
  const data = response?.data;
  // The updated server uses data.success; the previous version used isSuccess.
  // An explicit failure must never be overridden by the outer envelope's message.
  const confirmed =
    data?.success === undefined
      ? data?.isSuccess === true
      : data.success === true;
  if (
    response?.code !== 0 ||
    !confirmed ||
    data?.isSuccess === false ||
    (data?.code !== undefined && data.code !== 0)
  ) {
    const message = response?.data?.message || response?.message;
    throw new Error(
      typeof message === "string" && message.trim()
        ? message
        : "سرور موفقیت عملیات را تأیید نکرد. لطفاً دوباره تلاش کنید.",
    );
  }
  return response.data;
}

// Observed on verifyLoginCode on 2026-10-19: {code:0, data:{token, mobile, ...}}.
// This exception is for verification only; it is never proof of OTP dispatch.
export function readVerificationResult(response) {
  const data = response?.data;
  if (
    response?.code === 0 &&
    typeof data?.token === "string" &&
    data.token.length > 0 &&
    !/\s/.test(data.token) &&
    data.success !== false &&
    data.isSuccess !== false &&
    (data.code === undefined || data.code === 0)
  )
    return data;
  return readAuthResult(response);
}
