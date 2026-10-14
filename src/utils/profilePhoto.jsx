export const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
export function validateProfilePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "عکس باید با فرمت JPG، PNG یا WebP باشد.";
  if (file.size > MAX_PROFILE_PHOTO_SIZE)
    return "حجم عکس نباید بیشتر از ۵ مگابایت باشد.";
  if (!file.size) return "فایل انتخاب‌شده خالی است.";
  return null;
}
