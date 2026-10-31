import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppSelector } from "../../hooks/store/store";
import type { ProfileFormValues } from "../../types/domain";
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
import LawyerRequiredFields from "../../components/profile/LawyerRequiredFields";
import ProfileSummary from "../../components/profile/ProfileSummary";
import useProfilePhoto from "../../hooks/useProfilePhoto";
import usePageTitle from "../../hooks/usePageTitle";
import { saveProfile } from "../../services";

export default function Profile() {
  usePageTitle("پروفایل من");
  const selectedRole = useAppSelector((state) => state.main?.selectedRole);

  const defaults: ProfileFormValues = {
    name: "",
    lastName: "",
    phoneNumber: "",
    nationalCode: "",
    email: "",
    city: "",
    role: selectedRole === "lawyer" ? "lawyer" : "client",
    registrationPermit: "",
    experienceYears: "",
    education: "",
    issuingAuthority: "",
    licenseGrade: "",
    primaryPractice: "",
    serviceMode: "",
    workHistory: "",
    languages: "",
    officeAddress: "",
    specialties: [],
    bio: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ defaultValues: defaults, shouldUnregister: true });

  const values = watch();
  const photo = useProfilePhoto();

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
    reset(defaults);
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
              title="۶ سؤال اجباری وکیل"
              description="علاوه بر اطلاعات هویتی، پاسخ به هر شش سؤال برای بررسی فرم لازم است."
            >
              <LawyerRequiredFields register={register} errors={errors} />
            </ProfileSection>
            <ProfileSection
              icon={BriefcaseBusiness}
              title="۶ سؤال اختیاری وکیل"
              description="برای معرفی کامل‌تر سوابق و حیطه کاری خود پاسخ دهید."
            >
              <LawyerOptionalFields
                register={register}
                errors={errors}
                specialtyCount={values.specialties?.length || 0}
              />
            </ProfileSection>
          </>

          {feedback && (
            <Alert kind={feedback.type === "success" ? "success" : "error"}>
              {feedback.message}
            </Alert>
          )}

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
        </form>
      </div>
    </>
  );
}
