import { useEffect, useState, type FormEvent } from "react";
import { Download, UserRound } from "lucide-react";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";
import { getRequestsByDomain, registerClientAccept, type ClientRequestItem } from "../../services";
import { getErrorMessage } from "../../services/masterService";
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
  userId: number;
  name: string;
  text: string;
  status: "pending" | "sent";
  request: string;
  filePath?: string | null;
};

function requestMessage(item: ClientRequestItem): ClientMessage {
  const name = item.clientName || `موکل ${item.userId}`;
  return {
    id: String(item.id),
    userId: item.userId,
    name: `${name} · ${domainLabel(item.domainId)}`,
    text: item.requestText,
    status: "pending",
    request: "",
    filePath: item.files[0]?.filePath ?? null,
  };
}

function liveMessage(request: IncomingClientRequest): ClientMessage {
  return {
    id: String(request.id),
    userId: request.userId,
    name: `موکل ${request.userId} · ${domainLabel(request.domainId)}`,
    text: request.requestText,
    status: "pending",
    request: "",
    filePath: request.filePath,
  };
}

export default function ClientWindow({
  roomName,
  roomId = null,
  domainId = null,
  incoming = [],
}: {
  roomName: string | null;
  roomId?: number | null;
  domainId?: number | null;
  incoming?: IncomingClientRequest[];
}) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadErrorId, setDownloadErrorId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const liveMessages = incoming
    .filter((request) => domainId != null && request.domainId === domainId)
    .filter((request) => !messages.some((message) => message.id === String(request.id)))
    .map(liveMessage);
  const visibleMessages = [...liveMessages, ...messages];

  useEffect(() => {
    setActiveId(null);
    setDraft("");
    setReplyFile(null);
    setError("");

    if (!domainId || !roomId) {
      setMessages([]);
      setLoadError("");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setLoadError("");
    setMessages([]);
    getRequestsByDomain(domainId, roomId)
      .then((items) => {
        if (active) setMessages(items.map(requestMessage));
      })
      .catch((err) => {
        if (!active) return;
        setMessages([]);
        setLoadError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [domainId, roomId]);

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

  function openRequest(id: string) {
    setActiveId(id);
    setDraft("");
    setReplyFile(null);
    setError("");
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    const requestId = Number(activeId);
    if (!activeId || !requestId || !text) {
      setError("درخواست را بنویسید.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await registerClientAccept({ requestId, requestText: text, file: replyFile });
      setMessages((current) =>
        current.map((message) =>
          message.id === activeId
            ? { ...message, status: "sent", request: text, text }
            : message,
        ),
      );
      setActiveId(null);
      setDraft("");
      setReplyFile(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-bold text-ink">{roomName ?? "پیام موکل‌ها"}</h2>
      </header>
      <ul className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {(!domainId || !roomId) && (
          <li className="text-sm leading-7 text-muted">برای دیدن درخواست موکل‌ها یک اتاق را انتخاب کنید.</li>
        )}
        {domainId && roomId && loading && (
          <li className="text-sm text-muted">در حال دریافت درخواست‌ها...</li>
        )}
        {loadError && (
          <li role="alert" className="text-xs text-red-700">{loadError}</li>
        )}
        {domainId && roomId && !loading && !loadError && visibleMessages.length === 0 && (
          <li className="text-sm leading-7 text-muted">برای این حوزه درخواستی ثبت نشده است.</li>
        )}
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
                  <Btn
                    className="!px-4 !py-2.5 !text-xs"
                    onClick={() => openRequest(message.id)}
                  >
                    درخواست دادن
                  </Btn>
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
                <label className="mt-3 block text-xs text-muted">
                  فایل پیوست
                  <input
                    type="file"
                    className="mt-2 block w-full text-sm text-ink"
                    onChange={(event) => setReplyFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="mt-3">
                  <Btn type="submit" loading={sending}>ارسال درخواست</Btn>
                </div>
              </form>
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
