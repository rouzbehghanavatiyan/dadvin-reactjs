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

// Paths and request field names verified against Swagger on 2026-10-21.
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

// Transport adapters only: the UI must not submit proposed text answers as option IDs.
// Enable saving after the question catalog, score and successful response contracts are supplied.
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
  metadata,
  token = getAccessToken(),
  options,
) => {
  const payload = createAttachmentPayload(file, metadata);
  return readAuthResult(
    await postMultipart(
      "/api/Attachment/createAttachment",
      payload,
      bearerOptions(token, options),
    ),
  );
};

export async function saveProfile(
  values,
  {
    photo = null,
    attachmentMetadata = {},
    readAttachmentId,
    token = getAccessToken(),
    signal,
  } = {},
) {
  const payload = createProfilePayload(values);
  bearerOptions(token); // Fail before uploading if there is no verified session.
  if (photo) {
    createAttachmentPayload(photo, attachmentMetadata);
    // Swagger has no response schema. Bind this reader only to a confirmed response.
    if (typeof readAttachmentId !== "function")
      throw new Error("قرارداد شناسه برگشتی عکس هنوز مشخص نشده است.");
    const upload = await createAttachment(photo, attachmentMetadata, token, {
      signal,
    });
    const attachmentId = readAttachmentId(upload);
    if (
      !Number.isInteger(attachmentId) ||
      attachmentId <= 0 ||
      attachmentId > 2147483647
    )
      throw new Error("سرور شناسه معتبر عکس برنگرداند؛ پروفایل ذخیره نشد.");
    payload.profileAttachmentId = attachmentId;
  }
  if (signal?.aborted) throw new Error("ذخیره پروفایل لغو شد.");
  return createProfile(payload, token, { signal });
}
