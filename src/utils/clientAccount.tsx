import type { UserProfile } from "../types/domain";

export function profileRecord(profile: UserProfile | null | undefined) {
  if (!profile) return null;
  if (profile.firstName || profile.mobile || profile.id != null) return profile;
  const nested = profile.result;
  if (nested && typeof nested === "object") return nested as UserProfile;
  return profile;
}

export function isClientAccount(profile: UserProfile | null | undefined) {
  const record = profileRecord(profile);
  if (record?.id == null) return false;
  const permit = record.registrationPermit;
  return (typeof permit === "string" ? permit : "").trim() === "";
}
