import { validateProfilePhoto } from "./profilePhoto";
import type { AttachmentMetadata, ProfileFormInput } from "../types/domain";

const int32 = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= -2147483648 &&
  value <= 2147483647;

const membershipIds = { bar: 1, "judiciary-center": 2 } as const;
const employmentIds = { "grade-one": 1, trainee: 2 } as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionId(
  map: Record<string, number>,
  value: unknown,
) {
  const key = text(value);
  return key && map[key] ? map[key] : null;
}

function labelFor(map: Record<number, string>, value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) ? map[id] ?? "" : "";
}

function optionalRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function createProfilePayload(formValues: ProfileFormInput = {}) {
  const isLawyer =
    text(formValues.registrationPermit) !== "" || formValues.role === "lawyer";
  const attachment = Number(formValues.profileAttachmentId);
  const optionalUser = {
    scientificBasis: text(formValues.education),
    postgraduateStudy: text(formValues.graduateField),
    yearsActivity: text(formValues.experienceYears),
    cms: text(formValues.cmsStats),
    successfulCases: text(formValues.successfulCases),
    sampleRulings: text(formValues.sampleVerdicts),
  };

  return {
    score: Number(formValues.score) || 0,
    profileAttachmentId: Number.isInteger(attachment) && attachment > 0 ? attachment : null,
    membership: isLawyer ? optionId(membershipIds, formValues.membership) : null,
    employmentStatus: isLawyer
      ? optionId(employmentIds, formValues.employmentStatus)
      : null,
    optionalUser: isLawyer ? optionalUser : null,
  };
}

export function readProfileAnswers(profile: {
  membership?: unknown;
  employmentStatus?: unknown;
  optionalUser?: unknown;
} | null | undefined) {
  const optional = optionalRecord(profile?.optionalUser);
  return {
    membership: labelFor(
      { 1: "bar", 2: "judiciary-center" },
      profile?.membership,
    ),
    employmentStatus: labelFor(
      { 1: "grade-one", 2: "trainee" },
      profile?.employmentStatus,
    ),
    education: text(optional.scientificBasis),
    graduateField: text(optional.postgraduateStudy),
    experienceYears: text(optional.yearsActivity),
    cmsStats: text(optional.cms),
    successfulCases: text(optional.successfulCases),
    sampleVerdicts: text(optional.sampleRulings),
  };
}

export function createAttachmentPayload(
  file: File,
  metadata: AttachmentMetadata = {},
) {
  const problem = validateProfilePhoto(file);
  if (problem) throw new Error(problem);
  const fields: Record<string, unknown> = {
    ...createProfilePhotoMetadata(file),
    ...metadata,
  };
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
export function createProfilePhotoMetadata(file: File) {
  const problem = validateProfilePhoto(file);
  if (problem) throw new Error(problem);
  const extensions: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
  };
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowed = extensions[file.type];
  if (!ext || !allowed?.includes(ext))
    throw new Error("پسوند فایل با نوع عکس مطابقت ندارد.");
  return { AttachmentType: "pf", FileName: file.name, Ext: ext };
}
