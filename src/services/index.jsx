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

// Paths and request field names verified against Swagger on 2026-10-19.
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
      "/api/Users/verifyLoginCode",
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
