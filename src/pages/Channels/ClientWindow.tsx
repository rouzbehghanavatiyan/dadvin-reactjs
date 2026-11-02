import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";

type ClientMessage = {
  id: string;
  name: string;
  text: string;
  status: "pending" | "rejected" | "sent";
  request: string;
};

const initialMessages: ClientMessage[] = [
  {
    id: "1",
    name: "سارا احمدی",
    text: "برای مهریه و نفقه نیاز به پیگیری دارم.",
    status: "pending",
    request: "",
  },
  {
    id: "2",
    name: "رضا مرادی",
    text: "کارفرما حقوق سه ماه را پرداخت نکرده است.",
    status: "pending",
    request: "",
  },
  {
    id: "3",
    name: "مریم حسینی",
    text: "بعد از تصادف، بیمه خسارت را پرداخت نمی‌کند.",
    status: "pending",
    request: "",
  },
  {
    id: "4",
    name: "علی کریمی",
    text: "قرارداد مشارکت را پیش از امضا بررسی کنید.",
    status: "pending",
    request: "",
  },
  {
    id: "5",
    name: "نازنین رضایی",
    text: "برای شکایت سرقت از مغازه‌ام وکیل می‌خواهم.",
    status: "pending",
    request: "",
  },
];

export default function ClientWindow({ roomName }: { roomName: string | null }) {
  const [messages, setMessages] = useState(initialMessages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function reject(id: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, status: "rejected" } : message,
      ),
    );
    if (activeId === id) {
      setActiveId(null);
      setDraft("");
      setError("");
    }
  }

  function openRequest(id: string) {
    setActiveId(id);
    setDraft("");
    setError("");
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!activeId || !text) {
      setError("درخواست را بنویسید.");
      return;
    }
    setMessages((current) =>
      current.map((message) =>
        message.id === activeId
          ? { ...message, status: "sent", request: text }
          : message,
      ),
    );
    setActiveId(null);
    setDraft("");
    setError("");
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-bold text-ink">{roomName ?? "پیام موکل‌ها"}</h2>
      </header>
      <ul className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl border border-line bg-[#f8fafc] p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8eef6] text-navy"
                aria-hidden="true"
              >
                <UserRound size={18} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{message.name}</p>
                <p className="mt-2 text-sm leading-7 text-ink">{message.text}</p>
              </div>
            </div>
            {message.status === "pending" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn
                  variant="outline"
                  className="!px-4 !py-2.5 !text-xs"
                  onClick={() => reject(message.id)}
                >
                  رد کردن
                </Btn>
                <Btn
                  className="!px-4 !py-2.5 !text-xs"
                  onClick={() => openRequest(message.id)}
                >
                  درخواست دادن
                </Btn>
              </div>
            )}
            {message.status === "pending" && activeId === message.id && (
              <form onSubmit={send} className="mt-4">
                <TextArea
                  label="درخواست شما"
                  rows={3}
                  value={draft}
                  error={error}
                  placeholder="درخواست را برای موکل بنویسید"
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (error) setError("");
                  }}
                />
                <div className="mt-3">
                  <Btn type="submit">ارسال درخواست</Btn>
                </div>
              </form>
            )}
            {message.status === "rejected" && (
              <p className="mt-4 text-xs text-red-700">رد شد</p>
            )}
            {message.status === "sent" && (
              <div className="mt-4">
                <p className="text-sm text-emerald-700">درخواست ارسال شد.</p>
                <p className="mt-2 text-sm leading-7 text-ink">{message.request}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
