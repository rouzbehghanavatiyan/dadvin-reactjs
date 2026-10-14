import { Link } from "react-router-dom";
import MainTitle from "../UI/MainTitle";
import Alert from "../UI/Alert";
import usePageTitle from "../hooks/usePageTitle";

export default function Policy({ privacy = false }) {
  const title = privacy ? "حریم خصوصی" : "شرایط استفاده";
  usePageTitle(title);
  return (
    <>
      <MainTitle eyebrow="دادوین · TRUST & TRANSPARENCY" title={title}>
        شفافیت، پایه ارتباط ما با شماست.
      </MainTitle>
      <Alert kind="info">
        این صفحه پیش‌نویس محصول است. متن نهایی {title} باید پیش از آغاز ثبت‌نام
        واقعی، توسط تیم حقوقی تدوین و تأیید شود.
      </Alert>
      <div className="mt-6 space-y-4 text-sm leading-8 text-muted">
        {privacy ? (
          <>
            <p>
              در طراحی دادوین، اطلاعات تماس کاربران محرمانه است و تبادل آن با
              متخصص، پس از انتخاب و تأیید کاربر انجام می‌شود.
            </p>
            <p>
              جزئیات نگهداری، پردازش و حذف اطلاعات در نسخه نهایی سیاست حریم
              خصوصی اعلام خواهد شد.
            </p>
          </>
        ) : (
          <>
            <p>
              دادوین بستری برای معرفی متخصصان و دریافت و مقایسه پیشنهادهای
              حرفه‌ای حقوقی است.
            </p>
            <p>
              پیشنهاد اولیه، به‌معنای پذیرش قطعی وکالت یا داوری و تضمین نتیجه
              پرونده نیست. همکاری نهایی تابع توافق مستقل طرفین خواهد بود.
            </p>
          </>
        )}
      </div>
      <Link
        to="/register"
        className="mt-8 inline-block text-sm text-navy underline underline-offset-4"
      >
        بازگشت به ثبت‌نام
      </Link>
    </>
  );
}
