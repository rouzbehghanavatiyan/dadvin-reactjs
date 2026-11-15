import type { AxiosRequestConfig } from "axios";
import { postAuth, postMultipart, getAuth } from "./masterService";
import { endpoints } from "./endpoints";
import { createProfilePayload } from "../utils/profileContract";
import { validateRequestFile } from "../utils/requestFile";
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

export async function createReqClient(
  values: { domainId: number; requestText: string; file?: File | null },
  config?: AxiosRequestConfig,
) {
  const domainId = Number(values.domainId);
  const requestText = values.requestText.trim();
  if (!Number.isInteger(domainId) || domainId <= 0) {
    throw new Error("شناسه حوزه الزامی است.");
  }
  if (!requestText) throw new Error("متن درخواست الزامی است.");

  const file = values.file ?? null;
  if (file) {
    const problem = validateRequestFile(file);
    if (problem) throw new Error(problem);
  }

  const formData = new FormData();
  formData.append("domainId", String(domainId));
  formData.append("requestText", requestText);
  if (file) formData.append("file", file);

  const response = await postMultipart<ApiEnvelope>(
    endpoints.createReqClient,
    formData,
    config,
  );
  readEnvelope(response);
  return response;
}

export type ClientRequestFile = {
  attachmentId: number;
  filePath: string;
};

export type ClientRequestItem = {
  id: number;
  userId: number;
  clientName: string;
  domainId: number;
  requestText: string;
  files: ClientRequestFile[];
  createDate: string;
};

const readRequestItem = (value: unknown): ClientRequestItem | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const userId = Number(record.userId ?? record.UserId);
  const domainId = Number(record.domainId ?? record.DomainId);
  const clientName = record.clientName ?? record.ClientName;
  const requestText = String(record.requestText ?? record.RequestText ?? "").trim();
  const createDate = String(record.createDate ?? record.CreateDate ?? "");
  if (!id || !domainId || !requestText || !createDate) return null;
  return {
    id,
    userId: Number.isFinite(userId) ? userId : 0,
    clientName: typeof clientName === "string" ? clientName.trim() : "",
    domainId,
    requestText,
    files: readRequestFiles(record.files ?? record.Files, record.filePath ?? record.FilePath),
    createDate,
  };
};

const readRequestFiles = (value: unknown, legacyPath: unknown): ClientRequestFile[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const file = item as Record<string, unknown>;
      const attachmentId = Number(file.attachmentId ?? file.AttachmentId);
      const filePath = file.filePath ?? file.FilePath;
      if (!attachmentId || typeof filePath !== "string" || !filePath) return [];
      return [{ attachmentId, filePath }];
    });
  }
  return typeof legacyPath === "string" && legacyPath
    ? [{ attachmentId: 0, filePath: legacyPath }]
    : [];
};

export type DomainItem = {
  id: number;
  title: string;
};

const readDomainItem = (value: unknown): DomainItem | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const title = record.title ?? record.Title;
  if (!id || typeof title !== "string" || !title.trim()) return null;
  return { id, title };
};

export async function getDomains(
  config?: AxiosRequestConfig,
): Promise<DomainItem[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getDomains, config);
  const data = readEnvelope(response);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return list.flatMap((item) => {
    const domain = readDomainItem(item);
    return domain ? [domain] : [];
  });
}

export type DomainRoomItem = {
  id: number;
  domainId: number;
  domainTitle: string;
  title: string;
  entranceRoom: number;
  full: boolean;
};

const readList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const nested = record.data ?? record.Data ?? record.result ?? record.Result ?? record.$values;
  return Array.isArray(nested) ? nested : [];
};

const readDomainRoom = (value: unknown): DomainRoomItem | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const domainId = Number(record.domainId ?? record.DomainId);
  const entranceRoom = Number(record.entranceRoom ?? record.EntranceRoom);
  const title = record.title ?? record.Title;
  const domainTitle = record.domainTitle ?? record.DomainTitle;
  const fullValue = record.full ?? record.Full;
  if (!id || !domainId || typeof title !== "string" || !title.trim()) return null;
  const full = typeof fullValue === "boolean" ? fullValue : entranceRoom === 10;
  return {
    id,
    domainId,
    domainTitle: typeof domainTitle === "string" ? domainTitle : "",
    title,
    entranceRoom: Number.isFinite(entranceRoom) ? entranceRoom : 0,
    full,
  };
};

export async function getDomainRooms(
  config?: AxiosRequestConfig,
): Promise<DomainRoomItem[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getDomainRooms, config);
  const data = readEnvelope(response);
  const list = readList(data).length > 0 ? readList(data) : readList(response);
  return list.flatMap((item) => {
    const room = readDomainRoom(item);
    return room ? [room] : [];
  });
}

export async function getRequestsByDomain(
  domainId: number,
  id: number,
  config?: AxiosRequestConfig,
): Promise<ClientRequestItem[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getRequestsByDomain, {
    ...config,
    params: { domainId, id, ...config?.params },
  });
  const data = readEnvelope(response);
  const list = readList(data).length > 0 ? readList(data) : readList(response);
  return list.flatMap((item) => {
    const request = readRequestItem(item);
    return request ? [request] : [];
  });
}

export type ClientReceiptResponse = {
  id: number;
  requestId: number;
  userId: number;
  requestText: string;
  acceptDate: string;
};

export type ClientReceiptMaster = {
  id: number;
  userId: number;
  requestText: string;
  domainId: number;
  domainTitle: string;
  items: ClientReceiptResponse[];
};

const readReceiptResponse = (value: unknown): ClientReceiptResponse | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const requestId = Number(record.requestId ?? record.RequestId);
  const userId = Number(record.userId ?? record.UserId);
  const requestText = String(record.requestText ?? record.RequestText ?? "").trim();
  const acceptDate = String(record.acceptDate ?? record.AcceptDate ?? "");
  if (!id || !requestId) return null;
  return {
    id,
    requestId,
    userId: Number.isFinite(userId) ? userId : 0,
    requestText,
    acceptDate,
  };
};

export async function registerClientAccept(
  values: { requestId: number; requestText: string; file?: File | null },
  config?: AxiosRequestConfig,
) {
  const formData = new FormData();
  formData.append("requestId", String(values.requestId));
  formData.append("requestText", values.requestText);
  if (values.file) formData.append("file", values.file);
  const response = await postMultipart<ApiEnvelope>(
    endpoints.registerClientAccept,
    formData,
    config,
  );
  return readEnvelope(response);
}

const readReceiptMaster = (value: unknown): ClientReceiptMaster | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const userId = Number(record.userId ?? record.UserId);
  const domainId = Number(record.domainId ?? record.DomainId);
  const requestText = String(record.requestText ?? record.RequestText ?? "").trim();
  const domainTitle = record.domainTitle ?? record.DomainTitle;
  const items = readList(record.items ?? record.Items).flatMap((item) => {
    const response = readReceiptResponse(item);
    return response ? [response] : [];
  });
  if (!id || !requestText) return null;
  return {
    id,
    userId: Number.isFinite(userId) ? userId : 0,
    requestText,
    domainId: Number.isFinite(domainId) ? domainId : 0,
    domainTitle: typeof domainTitle === "string" ? domainTitle : "",
    items,
  };
};

export type ChatContact = {
  userId: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: number;
  senderId: number;
  receiveId: number;
  text: string;
  isRead: boolean;
  createdAt: string;
};

const readChatContact = (value: unknown): ChatContact | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const userId = Number(record.userId ?? record.UserId);
  const name = String(record.name ?? record.Name ?? "").trim();
  const lastMessage = String(record.lastMessage ?? record.LastMessage ?? "").trim();
  const lastMessageAt = String(record.lastMessageAt ?? record.LastMessageAt ?? "");
  const unreadCount = Number(record.unreadCount ?? record.UnreadCount);
  if (!userId) return null;
  return {
    userId,
    name: name || `کاربر ${userId}`,
    lastMessage,
    lastMessageAt,
    unreadCount: Number.isFinite(unreadCount) ? unreadCount : 0,
  };
};

const readChatMessage = (value: unknown): ChatMessage | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const senderId = Number(record.senderId ?? record.SenderId);
  const receiveId = Number(record.receiveId ?? record.ReceiveId);
  const text = String(record.text ?? record.Text ?? "").trim();
  const createdAt = String(record.createdAt ?? record.CreatedAt ?? "");
  const isRead = Boolean(record.isRead ?? record.IsRead);
  if (!id || !senderId || !text) return null;
  return { id, senderId, receiveId, text, isRead, createdAt };
};

export async function getChats(config?: AxiosRequestConfig): Promise<ChatContact[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getChats, config);
  const data = readEnvelope(response);
  const list = readList(data).length > 0 ? readList(data) : readList(response);
  return list.flatMap((item) => {
    const contact = readChatContact(item);
    return contact ? [contact] : [];
  });
}

export async function getChatMessages(
  userId: number,
  config?: AxiosRequestConfig,
): Promise<ChatMessage[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getChatMessages, {
    ...config,
    params: { userId, ...config?.params },
  });
  const data = readEnvelope(response);
  const list = readList(data).length > 0 ? readList(data) : readList(response);
  return list.flatMap((item) => {
    const message = readChatMessage(item);
    return message ? [message] : [];
  });
}

export async function sendChat(
  values: { receiveId: number; text: string },
  config?: AxiosRequestConfig,
): Promise<ChatMessage> {
  const response = await postAuth<ApiEnvelope>(endpoints.sendChat, values, config);
  const data = readEnvelope(response);
  const message = readChatMessage(data);
  if (!message) throw new Error("پیام ارسال شد ولی پاسخ سرور خوانده نشد.");
  return message;
}

export async function getClientReceipts(
  config?: AxiosRequestConfig,
): Promise<ClientReceiptMaster[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getClientReceipts, config);
  const data = readEnvelope(response);
  const list = readList(data).length > 0 ? readList(data) : readList(response);
  return list.flatMap((item) => {
    const receipt = readReceiptMaster(item);
    return receipt ? [receipt] : [];
  });
}

export async function getReqClient(
  config?: AxiosRequestConfig,
): Promise<ClientRequestItem[]> {
  const response = await getAuth<ApiEnvelope>(endpoints.getReqClient, config);
  const data = readEnvelope(response);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return list.flatMap((item) => {
    const request = readRequestItem(item);
    return request ? [request] : [];
  });
}

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
