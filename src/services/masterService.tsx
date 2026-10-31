import type { AxiosRequestConfig } from "axios";
import http from "../utils/axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getAuth<T = unknown>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.get<T>(path, config);
  return data;
}

export async function postAuth<T = unknown>(
  path: string,
  payload: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.post<T>(path, payload, config);
  return data;
}

export async function postMultipart<T = unknown>(
  path: string,
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.post<T>(path, formData, config);
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (!isRecord(error) || error.isAxiosError !== true) {
    if (isRecord(error) && typeof error.message === "string" && error.message)
      return error.message;
    return error instanceof Error && error.message
      ? error.message
      : "خطایی رخ داد.";
  }
  if (error.code === "ECONNABORTED")
    return "پاسخ سرور طول کشید. دوباره تلاش کنید.";
  if (!error.response) return "ارتباط با سرور برقرار نشد.";

  const response = isRecord(error.response) ? error.response : {};
  const body = isRecord(response.data) ? response.data : {};
  const nested = isRecord(body.data) ? body.data : undefined;
  const flatErrors = isRecord(body.errors)
    ? Object.values(body.errors)
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .filter((item): item is string => typeof item === "string")
        .join(" ")
    : "";

  return (
    (typeof body.message === "string" && body.message) ||
    (typeof nested?.message === "string" && nested.message) ||
    flatErrors ||
    "درخواست با خطا مواجه شد."
  );
}
