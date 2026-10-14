import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  UserRound,
  Camera,
  BriefcaseBusiness,
  FileText,
  Check,
  RotateCcw,
} from "lucide-react";
import Btn from "../../UI/Btn";
import Alert from "../../UI/Alert";
import TextArea from "../../UI/TextArea";
import ProfileSection from "../../components/profile/ProfileSection";
import ProfilePhoto from "../../components/profile/ProfilePhoto";
import IdentityFields from "../../components/profile/IdentityFields";
import ProfessionalFields from "../../components/profile/ProfessionalFields";
import ProfileSummary from "../../components/profile/ProfileSummary";
import useProfilePhoto from "../../hooks/useProfilePhoto";
import usePageTitle from "../../hooks/usePageTitle";

export default function Profile() {
  usePageTitle("پروفایل من");
  const selectedRole = useSelector((state) => state.main.selectedRole);
  const defaults = {
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
    specialties: [],
    bio: "",
  };
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaults, shouldUnregister: true });
  const values = watch();
  const photo = useProfilePhoto();
  const [reviewed, setReviewed] = useState(null);
  const [feedback, setFeedback] = useState(null);
  function preview(data) {
    setReviewed({ ...data });
    setFeedback(
      "اطلاعات فرم بررسی شد و پیش‌نمایش به‌روز است. این اطلاعات هنوز روی سرور ذخیره نشده‌اند.",
    );
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
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs text-muted">حساب کاربری / پروفایل من</p>
          <h1 className="text-2xl font-bold text-ink">
            پروفایل خود را تکمیل کنید
          </h1>
          <p className="mt-3 text-xs leading-7 text-muted">
            اطلاعات شما، اولین قدم برای یک ارتباط حرفه‌ای و مطمئن است.
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-4 py-2 text-[11px] text-muted">
          پیش‌نمایش · اتصال سرور در انتظار API
        </span>
      </div>
      <div className="mb-7">
        <Alert kind="info">
          این فرم فعلاً برای آماده‌سازی پروفایل است. اطلاعات و عکس فقط در حافظه
          همین صفحه هستند و با بازخوانی صفحه پاک می‌شوند.
        </Alert>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <form
          noValidate
          onSubmit={handleSubmit(preview)}
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
              busy={photo.busy}
              onChoose={(file) => {
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
          <ProfileSection
            icon={UserRound}
            title="اطلاعات هویتی و تماس"
            description="نام، نام خانوادگی، موبایل، کد ملی و شهر الزامی هستند."
          >
            <IdentityFields register={register} errors={errors} />
          </ProfileSection>
          {values.role === "lawyer" && (
            <ProfileSection
              icon={BriefcaseBusiness}
              title="اطلاعات حرفه‌ای"
              description="پروانه، سابقه و تحصیلات خود را تکمیل کنید."
            >
              <ProfessionalFields
                register={register}
                errors={errors}
                specialtyCount={values.specialties?.length || 0}
              />
            </ProfileSection>
          )}
          <ProfileSection
            icon={FileText}
            title="درباره من"
            description="معرفی کوتاه خود را بنویسید؛ اطلاعات تماس را در این بخش قرار ندهید."
          >
            <TextArea
              label="معرفی کوتاه (اختیاری)"
              placeholder="درباره زمینه فعالیت و تجربه خود بنویسید…"
              hint="حداکثر ۱۰۰۰ نویسه"
              maxLength={1000}
              {...register("bio", {
                maxLength: {
                  value: 1000,
                  message: "معرفی نباید بیشتر از ۱۰۰۰ نویسه باشد.",
                },
              })}
              error={errors.bio?.message}
            />
          </ProfileSection>
          {feedback && <Alert kind="info">{feedback}</Alert>}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5">
            <p className="text-[11px] text-muted">
              ذخیره روی سرور پس از اتصال API فعال می‌شود.
            </p>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={clear}>
                <RotateCcw size={15} />
                پاک‌کردن فرم
              </Btn>
              <Btn type="submit" disabled={photo.busy}>
                <Check size={16} />
                بررسی و پیش‌نمایش
              </Btn>
            </div>
          </div>
        </form>
        <ProfileSummary
          values={summary}
          photo={photo.photo}
          previewed={Boolean(reviewed)}
        />
      </div>
    </>
  );
}
