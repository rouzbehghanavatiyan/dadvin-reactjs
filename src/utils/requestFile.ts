export const MAX_REQUEST_FILE_SIZE = 10 * 1024 * 1024;

const allowedExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "xls",
  "xlsx",
]);

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const requestFileAccept = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  ".pdf",
  ".xls",
  ".xlsx",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

function extensionOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return name.includes(".") ? ext : "";
}

export function validateRequestFile(file: { name: string; type: string; size: number }) {
  if (!file.size) return "فایل انتخاب‌شده خالی است.";
  if (file.size > MAX_REQUEST_FILE_SIZE) return "حجم فایل باید حداکثر ۱۰ مگابایت باشد.";
  const ext = extensionOf(file.name);
  const type = file.type.toLowerCase();
  const extensionAllowed = allowedExtensions.has(ext);
  const typeAllowed = type !== "" && type !== "application/octet-stream" && allowedTypes.has(type);
  if (!extensionAllowed && !typeAllowed) return "فقط عکس، اکسل یا PDF مجاز است.";
  if (type && type !== "application/octet-stream" && !allowedTypes.has(type)) {
    return "فقط عکس، اکسل یا PDF مجاز است.";
  }
  return null;
}
