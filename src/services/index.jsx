import { postAuth, postMultipart, bearerOptions } from "../masterService";
import {
  createAttachmentPayload,
  createProfilePayload,
} from "../utils/profileContract";
import {
  createRegisterPayload,
  createVerifyPayload,
  createLoginPayload,
  createLoginVerifyPayload,
} from "../utils/authContract";
import { readAuthResult, readVerificationResult } from "../utils/authResponse";
import { getAccessToken } from "../utils/authSession";

export const login = async (values, options) =>
  readAuthResult(
    await postAuth("/api/Users/login", createLoginPayload(values), options),
  );
export const verifyLoginCode = async (values, options) =>
  readVerificationResult(
    await postAuth(
      "/api/Users/verifyLoginCode",
      createLoginVerifyPayload(values),
      options,
    ),
  );

export const registerAccount = async (values, options) =>
  readAuthResult(
    await postAuth(
      "/api/Users/register",
      createRegisterPayload(values),
      options,
    ),
  );
export const verifyRegistrationCode = async (values, options) =>
  readVerificationResult(
    await postAuth(
      "/api/Users/verifySignUpCode",
      createVerifyPayload(values),
      options,
    ),
  );

export const createProfile = async (
  payload,
  token = getAccessToken(),
  options = {},
) => {
  const response = await post(
    "/api/Profile/createProfile", // یا روت مدنظر پروژه
    payload,
    bearerOptions(token, options),
  );

  const data = response?.data ?? response;

  // بررسی شرایط خطا بر اساس ساختار پاسخ بک‌اند:
  // اگر code صفر نبود یا success فالس بود یا اروری وجود داشت
  const isFailed =
    data?.code !== 0 || data?.success === false || data?.isSuccess === false;

  if (isFailed) {
    // دریافت متن خطا مستقیماً از کلید message سرور
    const errorMessage =
      data?.message ||
      data?.errors?.[0] ||
      data?.title ||
      "خطایی در ثبت پروفایل رخ داد.";

    throw new Error(errorMessage);
  }

  return data;
};

export const createAttachment = async (
  files,
  metadata = {},
  token = getAccessToken(),
  options = {},
) => {
  const formData = new FormData();

  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach((file) => {
    formData.append("FormFiles", file);
  });

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // حذف readAuthResult و بازگرداندن مستقیم نتیجه postMultipart
  const response = await postMultipart(
    "/api/Attachment/createAttachment",
    formData,
    bearerOptions(token, options),
  );

  // معمولاً پاسخ یا در response.data است یا اگر masterService دیتا را آنپک کرده خود response است
  return response?.data ?? response;
};

const extractAttachmentId = (res) => {
  const items = res?.result ?? res?.data?.result ?? res?.data ?? res;
  if (Array.isArray(items) && items.length > 0) {
    return items[0]?.attachmentId ?? items[0]?.AttachmentId ?? items[0]?.id;
  }
  return items?.attachmentId ?? items?.AttachmentId ?? items?.id;
};

const defaultReadAttachmentId = (res) => {
  const items = res?.data ?? res?.result ?? res;
  if (Array.isArray(items) && items.length > 0) {
    return items[0]?.AttachmentId ?? items[0]?.id;
  }
  return items?.AttachmentId ?? items?.id;
};

export async function saveProfile(
  values,
  {
    photo = null,
    attachmentMetadata = { AttachmentType: "profile" },
    token = getAccessToken(),
    signal,
  } = {},
) {
  let attachmentId = 0;

  if (photo) {
    const uploadRes = await createAttachment(photo, attachmentMetadata, token, {
      signal,
    });

    const items = uploadRes?.result ?? uploadRes?.data?.result ?? uploadRes;
    if (Array.isArray(items) && items.length > 0) {
      attachmentId = items[0]?.attachmentId ?? items[0]?.id;
    } else {
      attachmentId = items?.attachmentId ?? items?.id;
    }
  }

  const payload = createProfilePayload({
    ...values,
    profileAttachmentId: Number(attachmentId) || 0,
  });

  const profileRes = await createProfile(payload, token, { signal });

  if (profileRes?.success === false || profileRes?.isSuccess === false) {
    throw new Error(profileRes?.message || "اطلاعات ارسالی نامعتبر است.");
  }

  return profileRes;
}
