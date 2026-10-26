import { validateProfilePhoto } from "./profilePhoto";

const int32 = (value) =>
  Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;

function answersFor(values, required) {
  if (
    !Array.isArray(values) ||
    (required ? values.length !== 6 : values.length > 6)
  )
    throw new Error(
      required
        ? "دقیقاً شش پاسخ اجباری لازم است."
        : "حداکثر شش پاسخ اختیاری مجاز است.",
    );
  return values.map((answer) => {
    if (!int32(answer?.questionId) || answer.questionId <= 0)
      throw new Error("شناسه سؤال باید از فهرست تأییدشده سرور انتخاب شود.");
    if (
      answer.selectedOptionId != null &&
      (!int32(answer.selectedOptionId) || answer.selectedOptionId <= 0)
    )
      throw new Error("شناسه گزینه نامعتبر است.");
    if (required && answer.selectedOptionId == null)
      throw new Error("پاسخ تمام سؤال‌های اجباری را انتخاب کنید.");
    return {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId ?? null,
    };
  });
}

export function createProfilePayload(formValues = {}) {
  const mandatoryAnswers = [
    { questionId: 1, selectedOptionId: Number(formValues.q1) || 0 },
    { questionId: 2, selectedOptionId: Number(formValues.q2) || 0 },
    { questionId: 3, selectedOptionId: Number(formValues.q3) || 0 },
    { questionId: 4, selectedOptionId: Number(formValues.q4) || 0 },
    { questionId: 5, selectedOptionId: Number(formValues.q5) || 0 },
    { questionId: 6, selectedOptionId: Number(formValues.q6) || 0 },
  ];

  const optionalAnswers = Array.isArray(formValues.optionalAnswers)
    ? formValues.optionalAnswers
    : [];

  return {
    mandatoryAnswers,
    optionalAnswers,
    score: Number(formValues.score) || 0,
    profileAttachmentId: Number(formValues.profileAttachmentId) || 0,
  };
}

export function createAttachmentPayload(file, metadata = {}) {
  const problem = validateProfilePhoto(file);
  if (problem) throw new Error(problem);
  const fields = { ...createProfilePhotoMetadata(file), ...metadata };
  const payload = new FormData();
  payload.append("FormFiles", file, file.name);
  for (const key of ["AttachmentType", "FileName", "Ext"]) {
    if (fields[key] != null) {
      if (typeof fields[key] !== "string")
        throw new Error("مشخصات فایل نامعتبر است.");
      payload.append(key, fields[key]);
    }
  }
  if (metadata.AttachmentId != null) {
    if (!int32(metadata.AttachmentId))
      throw new Error("شناسه پیوست نامعتبر است.");
    payload.append("AttachmentId", String(metadata.AttachmentId));
  }
  return payload;
}

// Profile-photo metadata confirmed by the backend maintainer on 2026-10-24.
export function createProfilePhotoMetadata(file) {
  const problem = validateProfilePhoto(file);
  if (problem) throw new Error(problem);
  const extensions = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
  };
  const ext = file.name?.split(".").pop().toLowerCase();
  if (!extensions[file.type].includes(ext))
    throw new Error("پسوند فایل با نوع عکس مطابقت ندارد.");
  return { AttachmentType: "pf", FileName: file.name, Ext: ext };
}
