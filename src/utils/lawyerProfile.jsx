import { normalizeDigits } from "./StringHelper";

export const lawyerRequiredQuestions = [
  {
    name: "registrationPermit",
    label: "۱. شماره پروانه وکالت شما چیست؟",
    max: 80,
  },
  {
    name: "issuingAuthority",
    label: "۲. مرجع صادرکننده پروانه شما کدام است؟",
    options: [
      "کانون وکلای دادگستری",
      "مرکز وکلا، کارشناسان رسمی و مشاوران خانواده قوه قضائیه",
      "سایر مراجع",
    ],
  },
  {
    name: "licenseGrade",
    label: "۳. نوع پروانه یا وضعیت حرفه‌ای شما چیست؟",
    options: [
      "وکیل پایه یک دادگستری",
      "وکیل پایه دو دادگستری",
      "کارآموز وکالت",
      "سایر",
    ],
  },
  {
    name: "experienceYears",
    label: "۴. چند سال سابقه فعالیت حقوقی دارید؟",
    numeric: true,
  },
  {
    name: "primaryPractice",
    label: "۵. حوزه اصلی فعالیت حقوقی شما چیست؟",
    options: [
      "حقوقی و قراردادها",
      "کیفری",
      "خانواده",
      "ملکی و ثبتی",
      "تجاری و شرکت‌ها",
      "کار و تأمین اجتماعی",
      "حقوق فناوری و سایبری",
      "امور اداری و دیوان عدالت",
      "سایر",
    ],
  },
  {
    name: "serviceMode",
    label: "۶. خدمات حقوقی را چگونه ارائه می‌کنید؟",
    options: ["آنلاین", "حضوری", "آنلاین و حضوری"],
  },
];

export function lawyerQuestionRules(question) {
  return {
    required: "پاسخ این سؤال الزامی است.",
    setValueAs: (value) => normalizeDigits(String(value ?? "")).trim(),
    validate: (value) => {
      if (question.numeric)
        return (
          (/^\d+$/.test(value) && Number(value) <= 80) ||
          "سابقه را بین ۰ تا ۸۰ سال وارد کنید."
        );
      if (question.options)
        return (
          question.options.includes(value) ||
          "یکی از گزینه‌های موجود را انتخاب کنید."
        );
      return (
        (Boolean(value) && value.length <= question.max) ||
        `پاسخ را حداکثر در ${question.max} نویسه وارد کنید.`
      );
    },
  };
}
