export type UserProfile = {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  token?: string;
  message?: string;
  photoLocation?: string;
  profileAttachment?: {
    location?: string;
    path?: string;
  } | null;
  [key: string]: unknown;
};

export type MainState = {
  selectedRole: string;
  verifiedMobile: string | null;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
};

export type AuthFlowError = Error & {
  requiresRegistration?: boolean;
  requiresLogin?: boolean;
  registrationMobile?: string;
  loginMobile?: string;
};

export type AuthEnvelope = {
  code?: number;
  message?: string;
  success?: boolean;
  token?: string | null;
  data?: {
    success?: boolean;
    isSuccess?: boolean;
    message?: string;
    code?: number;
    token?: string;
    mobile?: string;
    result?: { token?: string | null; mobile?: string } | null;
  } | null;
  result?: { token?: string | null; mobile?: string } | null;
};

export type VerificationResult = {
  token?: string;
  mobile?: string;
  message?: string;
  success?: boolean;
  isSuccess?: boolean;
  code?: number;
  result?: { token?: string | null; mobile?: string } | null;
};

export type RegisterInput = {
  role?: string | null;
  name?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  nationalCode?: string | null;
  registrationPermit?: string | null;
  [key: string]: unknown;
};

export type LoginInput = {
  mobile?: string | null;
  code?: string | null;
  [key: string]: unknown;
};

export type RegistrationFormValues = {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  nationalCode: string;
  registrationPermit: string;
  role: string;
  terms: boolean;
};

export type ProfileFormValues = {
  name: string;
  lastName: string;
  phoneNumber: string;
  nationalCode: string;
  email: string;
  city: string;
  role: string;
  registrationPermit: string;
  experienceYears: string;
  education: string;
  issuingAuthority: string;
  licenseGrade: string;
  primaryPractice: string;
  serviceMode: string;
  workHistory: string;
  languages: string;
  officeAddress: string;
  specialties: string[];
  bio: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
};

export type ProfileFormInput = {
  q1?: unknown;
  q2?: unknown;
  q3?: unknown;
  q4?: unknown;
  q5?: unknown;
  q6?: unknown;
  optionalAnswers?: unknown;
  score?: unknown;
  profileAttachmentId?: unknown;
  mandatoryAnswers?: unknown;
  mobile?: unknown;
  token?: unknown;
  [key: string]: unknown;
};

export type FlowFeedback = {
  kind: "error" | "success";
  message: string;
  requiresRegistration?: boolean;
  registrationMobile?: string;
  loginMobile?: string;
};

export type ProfilePhotoSelection = {
  file: File;
  url: string;
};

export type AuthLocationState = {
  mobile?: string;
};

export type LawyerQuestion = {
  name: string;
  label: string;
  max?: number;
  options?: string[];
  numeric?: boolean;
};

export type AttachmentMetadata = {
  AttachmentId?: number | null;
  AttachmentType?: string;
  FileName?: string;
  Ext?: string;
  [key: string]: string | number | null | undefined;
};

export function toAuthFlowError(error: unknown): AuthFlowError {
  if (error instanceof Error) return error as AuthFlowError;
  return new Error("خطایی رخ داد.") as AuthFlowError;
}
