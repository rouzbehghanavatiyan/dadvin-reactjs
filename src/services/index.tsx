import type { AxiosRequestConfig } from "axios";
import { postAuth, postMultipart, getAuth } from "./masterService";
import { endpoints } from "./endpoints";
import { createProfilePayload } from "../utils/profileContract";
import {
  createRegisterPayload,
  createVerifyPayload,
  createLoginPayload,
  createLoginVerifyPayload,
} from "../utils/authContract";
import { readAuthResult, readVerificationResult } from "../utils/authResponse";
import type {
  LoginInput,
  ProfileFormInput,
  RegisterInput,
  UserProfile,
} from "../types/domain";

export type SaveProfileOptions = {
  photo?: File | Blob | null;
  attachmentMetadata?: Record<string, string>;
  signal?: AbortSignal;
};

type ApiEnvelope = {
  data?: ApiEnvelope | null;
  result?: unknown;
  code?: number;
  success?: boolean;
  isSuccess?: boolean;
  message?: string;
  errors?: Array<{ message?: string } | string>;
  title?: string;
};

const readEnvelope = (response: ApiEnvelope) => {
  const data = response?.data ?? response;
  const isFailed =
    data?.code !== 0 &&
    data?.code !== 200 &&
    (data?.success === false || data?.isSuccess === false);

  if (isFailed) {
    const errorMessage =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.errors?.[0] === "string" ? data.errors[0] : undefined) ||
      data?.title ||
      "خطایی در ثبت پروفایل رخ داد.";
    throw new Error(errorMessage);
  }

  return data;
};

export const login = async (values: LoginInput, config?: AxiosRequestConfig) =>
  readAuthResult(
    await postAuth(endpoints.login, createLoginPayload(values), config),
  );

export const verifyLoginCode = async (
  values: LoginInput,
  config?: AxiosRequestConfig,
) =>
  readVerificationResult(
    await postAuth(
      endpoints.verifyLoginCode,
      createLoginVerifyPayload(values),
      config,
    ),
  );

export const registerAccount = async (
  values: RegisterInput,
  config?: AxiosRequestConfig,
) =>
  readAuthResult(
    await postAuth(endpoints.register, createRegisterPayload(values), config),
  );

export const verifyRegistrationCode = async (
  values: RegisterInput & LoginInput,
  config?: AxiosRequestConfig,
) =>
  readVerificationResult(
    await postAuth(
      endpoints.verifySignUpCode,
      createVerifyPayload(values),
      config,
    ),
  );

export const createProfile = async (
  payload: ProfileFormInput,
  config?: AxiosRequestConfig,
) => readEnvelope(await postAuth<ApiEnvelope>(endpoints.createProfile, payload, config));

export const createAttachment = async (
  files: File | Blob | Array<File | Blob>,
  metadata: Record<string, unknown> = {},
  config?: AxiosRequestConfig,
) => {
  const formData = new FormData();
  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach((file) => {
    formData.append("FormFiles", file);
  });

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof Blob ? value : String(value));
    }
  });

  const response = await postMultipart<ApiEnvelope>(
    endpoints.createAttachment,
    formData,
    config,
  );
  return response?.data ?? response;
};

const readId = (source: unknown) => {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  return record.attachmentId ?? record.AttachmentId ?? record.id;
};

const extractAttachmentId = (res: unknown) => {
  const record =
    res && typeof res === "object" ? (res as Record<string, unknown>) : {};
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;
  const items = record.result ?? data?.result ?? record.data ?? res;
  if (Array.isArray(items) && items.length > 0) return readId(items[0]);
  return readId(items);
};

export async function saveProfile(
  values: ProfileFormInput,
  {
    photo = null,
    attachmentMetadata = { AttachmentType: "profile" },
    signal,
  }: SaveProfileOptions = {},
) {
  let attachmentId = Number(values.profileAttachmentId) || 0;

  if (photo) {
    const uploadRes = await createAttachment(photo, attachmentMetadata, { signal });
    const upload =
      uploadRes && typeof uploadRes === "object"
        ? (uploadRes as Record<string, unknown>)
        : {};
    if (upload.success === false || upload.isSuccess === false) {
      throw new Error(
        typeof upload.message === "string" ? upload.message : "آپلود تصویر ناموفق بود.",
      );
    }
    attachmentId = Number(extractAttachmentId(uploadRes)) || 0;
    if (!attachmentId) throw new Error("شناسه تصویر دریافت نشد.");
  }

  const payload = createProfilePayload({
    ...values,
    profileAttachmentId: attachmentId || null,
  });

  const profileRes = await createProfile(payload, { signal });

  if (profileRes?.success === false || profileRes?.isSuccess === false) {
    throw new Error(profileRes?.message || "اطلاعات ارسالی نامعتبر است.");
  }

  return profileRes;
}

export const getUserProfile = async (
  config?: AxiosRequestConfig,
): Promise<UserProfile> => {
  const response = await getAuth<ApiEnvelope>(endpoints.getUserProfile, config);
  const data = readEnvelope(response);
  return (data?.result ?? data) as UserProfile;
};
