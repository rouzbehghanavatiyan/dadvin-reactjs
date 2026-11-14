import { useState, type FormEvent } from "react";
import { Download, UserRound } from "lucide-react";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";
import type { IncomingClientRequest } from "../../services/requestSocket";
import { domainLabel } from "../../utils/requestDomains";

const fileBaseUrl = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

function requestFileUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${fileBaseUrl}/${path.replace(/^\/+/, "")}`;
}

function requestFileName(path: string) {
  return path.split(/[/\\]/).filter(Boolean).pop() || "فایل-موکل";
}

function saveBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

type ClientMessage = {
  id: string;
  name: string;
  text: string;
  status: "pending" | "rejected" | "sent";
  request: string;
  filePath?: string | null;
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

export default function ClientWindow({
  roomName,
  incoming = [],
}: {
  roomName: string | null;
  incoming?: IncomingClientRequest[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const liveMessages: ClientMessage[] = incoming.map((request) => ({
    id: `live-${request.id}`,
    name: `موکل ${request.userId} · ${domainLabel(request.domainId)}`,
    text: request.requestText,
    status: "pending",
    request: "",
    filePath: request.filePath,
  }));
  const visibleMessages = [...liveMessages, ...messages];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadErrorId, setDownloadErrorId] = useState<string | null>(null);

  async function downloadClientFile(message: ClientMessage) {
    const path = message.filePath?.trim();
    if (!path) return;
    setDownloadingId(message.id);
    setDownloadErrorId(null);
    const fileName = requestFileName(path);
    const url = requestFileUrl(path);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("download failed");
      saveBlob(await response.blob(), fileName);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadErrorId(message.id);
    } finally {
      setDownloadingId(null);
    }
  }

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
        {visibleMessages.map((message) => (
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
            {(message.status === "pending" || message.filePath) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {message.status === "pending" && (
                  <>
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
                  </>
                )}
                {message.filePath && (
                  <Btn
                    variant="outline"
                    className="!px-4 !py-2.5 !text-xs"
                    loading={downloadingId === message.id}
                    onClick={() => downloadClientFile(message)}
                  >
                    <Download size={14} aria-hidden="true" />
                    دانلود فایل موکل
                  </Btn>
                )}
              </div>
            )}
            {downloadErrorId === message.id && (
              <p className="mt-2 text-xs text-red-700">دانلود مستقیم انجام نشد. فایل در صفحه جدید باز شد.</p>
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
