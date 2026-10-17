import Input from "../../UI/Input";
import Select from "../../UI/Select";
import TextArea from "../../UI/TextArea";
import SpecialtySelector from "./SpecialtySelector";

const textRules = (max) => ({
  setValueAs: (value) => value.trim(),
  maxLength: { value: max, message: `حداکثر ${max} نویسه وارد کنید.` },
});

export default function LawyerOptionalFields({
  register,
  errors,
  specialtyCount,
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs leading-7 text-muted">
        می‌توانید همه این سؤال‌ها را خالی بگذارید. در سوابق، نام موکل یا اطلاعات
        محرمانه پرونده‌ها را ننویسید.
      </p>
      <Select
        label="۱. بالاترین مقطع تحصیلی شما چیست؟ (اختیاری)"
        {...register("education")}
        error={errors.education?.message}
      >
        <option value="">انتخاب کنید</option>
        <option value="bachelor">کارشناسی</option>
        <option value="master">کارشناسی ارشد</option>
        <option value="doctorate">دکتری</option>
        <option value="other">سایر</option>
      </Select>
      <SpecialtySelector
        label="۲. در چه حوزه‌های دیگری فعالیت دارید؟ (اختیاری)"
        register={register}
        count={specialtyCount}
        error={errors.specialties?.message}
      />
      <TextArea
        label="۳. مهم‌ترین سوابق حرفه‌ای شما چیست؟ (اختیاری)"
        hint="تا ۱۰۰۰ نویسه؛ مانند همکاری‌های حرفه‌ای، تدریس یا پژوهش"
        maxLength={1000}
        {...register("workHistory", textRules(1000))}
        error={errors.workHistory?.message}
      />
      <Input
        label="۴. به چه زبان‌هایی خدمات ارائه می‌کنید؟ (اختیاری)"
        placeholder="مثلاً فارسی، انگلیسی و عربی"
        maxLength={150}
        {...register("languages", textRules(150))}
        error={errors.languages?.message}
      />
      <TextArea
        label="۵. نشانی دفتر یا محل ملاقات حرفه‌ای شما کجاست؟ (اختیاری)"
        maxLength={500}
        {...register("officeAddress", textRules(500))}
        error={errors.officeAddress?.message}
      />
      <TextArea
        label="۶. رویکرد کاری خود را چطور معرفی می‌کنید؟ (اختیاری)"
        hint="حداکثر ۱۰۰۰ نویسه؛ این متن در پیش‌نمایش معرفی شما نمایش داده می‌شود."
        maxLength={1000}
        {...register("bio", textRules(1000))}
        error={errors.bio?.message}
      />
    </div>
  );
}
