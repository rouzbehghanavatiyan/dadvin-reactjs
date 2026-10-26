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
  values,
  token = getAccessToken(),
  options,
) => {
  const payload = createProfilePayload(values);
  return readAuthResult(
    await postAuth(
      "/api/Users/createProfile",
      payload,
      bearerOptions(token, options),
    ),
  );
};

export const createAttachment = async (
  file,
  metadata = {},
  token = getAccessToken(),
  options = {},
) => {
  const formData = new FormData();
  formData.append("formFile", file);
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return readAuthResult(
    await postMultipart(
      "/api/Attachment/createAttachment",
      formData,
      bearerOptions(token, options),
    ),
  );
};

export async function saveProfile(
  values,
  {
    photo = null,
    attachmentMetadata = {},
    readAttachmentId = (res) => res?.data?.id ?? res?.id,
    token = getAccessToken(),
    signal,
  } = {},
) {
  let attachmentId = 0;

  if (photo) {
    createAttachmentPayload(photo, attachmentMetadata);

    const uploadRes = await createAttachment(photo, attachmentMetadata, token, {
      signal,
    });

    attachmentId = readAttachmentId(uploadRes);

    if (
      !Number.isInteger(Number(attachmentId)) ||
      Number(attachmentId) <= 0 ||
      Number(attachmentId) > 2147483647
    ) {
      throw new Error("سرور شناسه معتبر عکس برنگرداند؛ پروفایل ذخیره نشد.");
    }
  }

  if (signal?.aborted) throw new Error("عملیات ذخیره لغو شد.");

  const payload = createProfilePayload({
    ...values,
    profileAttachmentId: Number(attachmentId),
  });

  return createProfile(payload, token, { signal });
}
