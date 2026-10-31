import Select from "../../UI/Select";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProfileFormValues } from "../../types/domain";

export default function LawyerRequiredFields({
  register,
  errors,
}: {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}) {
  const requiredRule = { required: "پاسخ به این سوال الزامی است." };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select
        label="۱. پایه پروانه وکالت"
        error={errors.q1?.message}
        {...register("q1", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="11">پایه یک دادگستری</option>
        <option value="12">پایه دو دادگستری</option>
        <option value="13">کارآموز وکالت</option>
      </Select>

      <Select
        label="۲. مرجع صدور پروانه"
        error={errors.q2?.message}
        {...register("q2", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="21">کانون وکلای دادگستری (اسکودا)</option>
        <option value="22">مرکز وکلا و کارشناسان قوه قضاییه</option>
      </Select>

      <Select
        label="۳. سابقه وکالت موثر"
        error={errors.q3?.message}
        {...register("q3", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="31">کمتر از ۳ سال</option>
        <option value="32">بین ۳ تا ۷ سال</option>
        <option value="33">بین ۷ تا ۱۵ سال</option>
        <option value="34">بیش از ۱۵ سال</option>
      </Select>

      <Select
        label="۴. حوزه تخصصی اصلی پرونده‌ها"
        error={errors.q4?.message}
        {...register("q4", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="41">دعاوی کیفری و جرایم اقتصادی</option>
        <option value="42">دعاوی ملکی و ثبتی</option>
        <option value="43">حقوقی، قراردادها و شرکت‌های تجاری</option>
        <option value="44">دعاوی خانواده و انحصار وراثت</option>
      </Select>

      <Select
        label="۵. شیوه ارائه خدمات"
        error={errors.q5?.message}
        {...register("q5", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="51">حضوری در دفتر</option>
        <option value="52">مشاوره آنلاین / تلفنی</option>
        <option value="53">هر دو روش</option>
      </Select>

      <Select
        label="۶. آخرین مدرک تحصیلی مرتبط"
        error={errors.q6?.message}
        {...register("q6", requiredRule)}
      >
        <option value="">انتخاب کنید</option>
        <option value="61">کارشناسی حقوق / فقه و مبانی</option>
        <option value="62">کارشناسی ارشد حقوق</option>
        <option value="63">دکتری تخصصی حقوق (PhD)</option>
      </Select>
    </div>
  );
}
