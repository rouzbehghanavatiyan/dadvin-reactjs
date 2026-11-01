import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppSelector } from "../../hooks/store/store";
import type { ProfileFormValues, UserProfile } from "../../types/domain";
import {
  Camera,
  BriefcaseBusiness,
  FileText,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import TextArea from "../../UI/TextArea";
import ProfileSection from "../../components/profile/ProfileSection";
import ProfilePhoto from "../../components/profile/ProfilePhoto";
import IdentityFields from "../../components/profile/IdentityFields";
import LawyerOptionalFields from "../../components/profile/LawyerOptionalFields";
import LawyerRequiredFields, {
  type LockedProfileFields,
} from "../../components/profile/LawyerRequiredFields";
import ProfileSummary from "../../components/profile/ProfileSummary";
import useProfilePhoto from "../../hooks/useProfilePhoto";
import usePageTitle from "../../hooks/usePageTitle";
import { saveProfile } from "../../services";

const apiOrigin = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

function text(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function savedProfile(profile: UserProfile | null | undefined) {
  if (!profile) return null;
  if (profile.firstName || profile.mobile || profile.id != null) return profile;
  const nested = profile.result;
  if (nested && typeof nested === "object") return nested as UserProfile;
  return profile;
}

function profilePhotoUrl(profile: UserProfile | null) {
  const path =
    profile?.photoLocation ||
    profile?.profileAttachment?.location ||
    profile?.profileAttachment?.path;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${apiOrigin}/${path.replace(/^\/+/, "")}`;
}

function valuesFromProfile(
  profile: UserProfile | null,
  role: string,
): ProfileFormValues {
  return {
    name: text(profile?.firstName),
    lastName: text(profile?.lastName),
    phoneNumber: text(profile?.mobile),
    nationalCode: text(profile?.nationalCode),
    email: text(profile?.email),
    city: "",
    role: role === "lawyer" ? "lawyer" : "client",
    registrationPermit: text(profile?.registrationPermit),
    membership: "",
    employmentStatus: "",
    education: "",
    graduateField: "",
    experienceYears: "",
    cmsStats: "",
    successfulCases: "",
    sampleVerdicts: "",
    specialties: [],
    bio: "",
  };
}

const lockableFields = [
  "name",
  "lastName",
  "phoneNumber",
  "email",
  "registrationPermit",
  "membership",
  "employmentStatus",
  "education",
  "graduateField",
  "experienceYears",
  "cmsStats",
  "successfulCases",
  "sampleVerdicts",
] as const satisfies readonly (keyof ProfileFormValues)[];

const clientFields = ["name", "lastName", "phoneNumber", "email"] as const;

function locksFromValues(values: ProfileFormValues): LockedProfileFields {
  return Object.fromEntries(
    lockableFields.map((field) => [field, values[field].trim() !== ""]),
  );
}

export default function Profile() {
  usePageTitle("پروفایل من");
  const selectedRole = useAppSelector((state) => state.main?.selectedRole);
  const userProfile = savedProfile(
    useAppSelector((state) => state.main.userProfile),
  );
  const savedPhoto = profilePhotoUrl(userProfile);
  const isClient = text(userProfile?.registrationPermit).trim() === "";

  const defaults: ProfileFormValues = valuesFromProfile(null, selectedRole);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ defaultValues: defaults, shouldUnregister: true });

  const appliedProfileId = useRef("");
  const [locked, setLocked] = useState<LockedProfileFields>({});
  const [savedValues, setSavedValues] = useState<ProfileFormValues | null>(null);
  useEffect(() => {
    const id = userProfile?.id;
    if (id == null) return;
    const key = String(id);
    if (appliedProfileId.current === key) return;
    appliedProfileId.current = key;
    const next = valuesFromProfile(userProfile, selectedRole);
    setSavedValues(next);
    setLocked(locksFromValues(next));
    reset(next);
  }, [reset, selectedRole, userProfile]);

  const values = watch();
  const photo = useProfilePhoto();
  const visibleFields = isClient ? clientFields : lockableFields;
  const profileSaved =
    savedValues != null &&
    Boolean(savedPhoto) &&
    visibleFields.every((field) => savedValues[field].trim() !== "");

  const [reviewed, setReviewed] = useState<ProfileFormValues | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const rawFile = photo.photo?.file;

      const response = await saveProfile(data, {
        photo: rawFile,
        attachmentMetadata: { AttachmentType: "profile" },
      });

      const isFailed =
        response?.success === false ||
        response?.isSuccess === false ||
        (response?.code !== undefined &&
          response?.code !== 0 &&
          response?.code !== 200);

      if (isFailed) {
        setFeedback({
          type: "error",
          message:
            response?.message || "گزینه‌های اجباری انتخاب‌شده نامعتبر است.",
        });
        return;
      }

      setReviewed({ ...data });
      setFeedback({
        type: "success",
        message:
          response?.message || "تصویر و اطلاعات پروفایل با موفقیت ثبت شدند.",
      });
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        data?: { message?: string };
        message?: string;
      };
      const serverMessage =
        error.response?.data?.message ||
        error.data?.message ||
        error.message ||
        "خطایی در ذخیره اطلاعات رخ داد.";

      setFeedback({
        type: "error",
        message: serverMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function clear() {
    reset(savedValues ?? defaults);
    photo.remove();
    setReviewed(null);
    setFeedback(null);
  }

  const summary = reviewed || values;

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          onChange={() => {
            setReviewed(null);
            setFeedback(null);
          }}
          className="min-w-0 space-y-5"
        >
          <ProfileSection
            icon={Camera}
            title="عکس پروفایل"
            description="یک عکس واضح و مناسب برای معرفی خود انتخاب کنید."
          >
            <ProfilePhoto
              photo={photo.photo}
              savedUrl={savedPhoto}
              locked={Boolean(savedPhoto)}
              error={photo.error}
              busy={photo.busy || isSubmitting}
              onChoose={(file?: File) => {
                photo.choose(file);
                setFeedback(null);
                setReviewed(null);
              }}
              onRemove={() => {
                photo.remove();
                setReviewed(null);
                setFeedback(null);
              }}
            />
          </ProfileSection>
          <>
            <ProfileSection
              icon={BriefcaseBusiness}
              title="گزینه‌های ضروری"
              description={
                isClient
                  ? "تکمیل نام، تماس و ایمیل لازم است."
                  : "تکمیل نام، تماس، ایمیل، عضویت، شماره پروانه و وضعیت اشتغال لازم است."
              }
            >
              <LawyerRequiredFields
                register={register}
                errors={errors}
                locked={locked}
                showLawyerFields={!isClient}
              />
            </ProfileSection>
            {!isClient && (
              <ProfileSection
                icon={BriefcaseBusiness}
                title="گزینه‌های اختیاری"
                description="پایه علمی، رشته، سنوات، آمار و نمونه آرا را در صورت تمایل وارد کنید."
              >
                <LawyerOptionalFields
                  register={register}
                  errors={errors}
                  locked={locked}
                />
              </ProfileSection>
            )}
          </>

          {feedback && (
            <Alert kind={feedback.type === "success" ? "success" : "error"}>
              {feedback.message}
            </Alert>
          )}

          {!profileSaved && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5">
              <p className="text-[11px] text-muted">
                پس از تایید، تصویر آپلود شده و پروفایل شما ثبت نهایی می‌شود.
              </p>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={clear} disabled={isSubmitting}>
                  <RotateCcw size={15} />
                  پاک‌کردن فرم
                </Btn>
                <Btn
                  type="submit"
                  disabled={photo.busy || Boolean(photo.error) || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      ثبت و ذخیره پروفایل
                    </>
                  )}
                </Btn>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
