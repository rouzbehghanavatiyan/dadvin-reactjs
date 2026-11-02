import type { UserProfile } from "../types/domain";

export function profileRecord(profile: UserProfile | null | undefined) {
  if (!profile) return null;
  if (profile.firstName || profile.mobile || profile.id != null) return profile;
  const nested = profile.result;
  if (nested && typeof nested === "object") return nested as UserProfile;
  return profile;
}

function permitText(profile: UserProfile | null | undefined) {
  const permit = profileRecord(profile)?.registrationPermit;
  return (typeof permit === "string" ? permit : "").trim();
}

export function isClientAccount(profile: UserProfile | null | undefined) {
  const record = profileRecord(profile);
  if (record?.id == null) return false;
  return permitText(profile) === "";
}

export function isLawyerAccount(profile: UserProfile | null | undefined) {
  const record = profileRecord(profile);
  if (record?.id == null) return false;
  return permitText(profile) !== "";
}
