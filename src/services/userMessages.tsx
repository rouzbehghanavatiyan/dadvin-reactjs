export type UserMessage = {
  id: string;
  firstName: string;
  lastName: string;
  petitionType: string;
  requestText: string;
  suggestedPrice: string;
  score: number;
  message: string;
  status: "pending" | "approved" | "rejected";
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function readUserMessages(payload: unknown): UserMessage[] {
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { result?: unknown }).result)
      ? (payload as { result: unknown[] }).result
      : [];

  return source.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const firstName = text(record.firstName ?? record.name);
    const lastName = text(record.lastName);
    const petitionType = text(
      record.petitionType ?? record.requestType ?? record.category,
    );
    const requestText = text(
      record.requestText ?? record.clientRequest ?? record.petitionType,
    );
    const suggestedPrice = text(record.suggestedPrice ?? record.price);
    const parsedScore = Number(record.score);
    const score = Number.isFinite(parsedScore) ? parsedScore : 0;
    const message = text(record.message ?? record.body);
    if (!firstName && !lastName && !petitionType && !message) return [];
    const id = text(record.id) || String(index + 1);
    return [
      {
        id,
        firstName,
        lastName,
        petitionType,
        requestText,
        suggestedPrice,
        score,
        message,
        status: "pending" as const,
      },
    ];
  });
}

const testUserMessages: UserMessage[] = [
  {
    id: "1",
    firstName: "نسترن",
    lastName: "کاظمی",
    petitionType: "کیفری",
    requestText: "برای شکایت سرقت از محل کارم نیاز به پیگیری دارم.",
    suggestedPrice: "۴٬۰۰۰٬۰۰۰",
    score: 95,
    message: "این پرونده را می‌پذیرم و تا صدور رأی پیگیری می‌کنم.",
    status: "pending",
  },
  {
    id: "2",
    firstName: "کامران",
    lastName: "یوسفی",
    petitionType: "کیفری",
    requestText: "برای شکایت سرقت از محل کارم نیاز به پیگیری دارم.",
    suggestedPrice: "۳٬۵۰۰٬۰۰۰",
    score: 88,
    message: "دفاع را قبول می‌کنم و مدارک را بررسی می‌کنم.",
    status: "pending",
  },
  {
    id: "3",
    firstName: "سهیل",
    lastName: "نادری",
    petitionType: "کیفری",
    requestText: "برای شکایت سرقت از محل کارم نیاز به پیگیری دارم.",
    suggestedPrice: "۵٬۰۰۰٬۰۰۰",
    score: 91,
    message: "پرونده را می‌گیرم و زمان جلسه را هماهنگ می‌کنم.",
    status: "pending",
  },
  {
    id: "4",
    firstName: "پارسا",
    lastName: "مرادی",
    petitionType: "حقوقی",
    requestText: "قرارداد مشارکت را پیش از امضا بررسی کنید.",
    suggestedPrice: "۲٬۸۰۰٬۰۰۰",
    score: 84,
    message: "قرارداد را می‌خوانم و نظر مکتوب می‌دهم.",
    status: "pending",
  },
  {
    id: "5",
    firstName: "هدیه",
    lastName: "رضایی",
    petitionType: "حقوقی",
    requestText: "قرارداد مشارکت را پیش از امضا بررسی کنید.",
    suggestedPrice: "۶٬۰۰۰٬۰۰۰",
    score: 97,
    message: "دعوی را قبول می‌کنم و دادخواست را تنظیم می‌کنم.",
    status: "pending",
  },
  {
    id: "6",
    firstName: "الهام",
    lastName: "شریفی",
    petitionType: "خانواده",
    requestText: "درباره حضانت فرزند و ملاقات می‌خواهم مشورت بگیرم.",
    suggestedPrice: "۴٬۵۰۰٬۰۰۰",
    score: 79,
    message: "موضوع حضانت را می‌پذیرم و برای توافق همراهی می‌کنم.",
    status: "pending",
  },
];

export async function receiveUserMessages(): Promise<UserMessage[]> {
  return testUserMessages.map((message) => ({ ...message }));
}
