import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, SendHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Btn from "../../UI/Btn";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import {
  getChatMessages,
  getChats,
  sendChat,
  type ChatContact,
  type ChatMessage,
} from "../../services";
import { connectChatHub } from "../../services/chatSocket";
import { getErrorMessage } from "../../services/masterService";
import { expireSession, isUnauthorizedResponse } from "../../utils/authSession";
import { profileRecord } from "../../utils/clientAccount";

const chatTime = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
});

const chatDate = new Intl.DateTimeFormat("fa-IR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay ? chatTime.format(date) : chatDate.format(date);
}

export default function ChatPage() {
  usePageTitle("گفتگو");
  const { userId: userIdParam } = useParams();
  const selectedId = Number(userIdParam) || 0;
  const navigate = useNavigate();
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const myId = Number(profile?.id) || 0;

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<number>());
  const selectedIdRef = useRef(selectedId);
  const myIdRef = useRef(myId);

  const selected = contacts.find((item) => item.userId === selectedId) ?? null;

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  useEffect(() => {
    let active = true;
    getChats()
      .then((items) => {
        if (active) setContacts(items);
      })
      .catch((err) => {
        if (!active) return;
        setContacts([]);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoadingContacts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let active = true;
    setLoadingMessages(true);
    setError("");

    getChatMessages(selectedId)
      .then((items) => {
        if (!active) return;
        items.forEach((item) => seenIds.current.add(item.id));
        setMessages(items);
        setContacts((current) =>
          current.map((item) =>
            item.userId === selectedId ? { ...item, unreadCount: 0 } : item,
          ),
        );
      })
      .catch((err) => {
        if (!active) return;
        setMessages([]);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    const connection = connectChatHub((message) => {
      if (seenIds.current.has(message.id)) return;
      seenIds.current.add(message.id);

      const mine = message.senderId === myIdRef.current;
      const otherId = mine ? message.receiveId : message.senderId;
      const open = otherId === selectedIdRef.current;

      if (open) {
        setMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message],
        );
      }

      setContacts((current) => {
        const next = current.map((item) => {
          if (item.userId !== otherId) return item;
          return {
            ...item,
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            unreadCount: open || mine ? 0 : item.unreadCount + 1,
          };
        });
        return next.sort((a, b) => {
          const left = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const right = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return right - left;
        });
      });
    });
    if (!connection) return;

    let stopped = false;
    connection.onclose((socketError) => {
      if (!stopped && socketError && isUnauthorizedResponse(undefined, null, socketError.message)) {
        expireSession();
      }
    });
    connection.start().catch((socketError: unknown) => {
      if (stopped) return;
      const message = socketError instanceof Error ? socketError.message : "";
      const status =
        socketError && typeof socketError === "object" && "statusCode" in socketError
          ? Number((socketError as { statusCode?: unknown }).statusCode)
          : undefined;
      if (isUnauthorizedResponse(status, null, message)) expireSession();
    });

    return () => {
      stopped = true;
      connection.stop();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, selectedId]);

  function placeMessage(message: ChatMessage) {
    seenIds.current.add(message.id);
    setMessages((current) =>
      current.some((item) => item.id === message.id) ? current : [...current, message],
    );
    setContacts((current) => {
      const next = current.map((item) =>
        item.userId === selectedId
          ? { ...item, lastMessage: message.text, lastMessageAt: message.createdAt, unreadCount: 0 }
          : item,
      );
      return next.sort((a, b) => {
        const left = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const right = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return right - left;
      });
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!selectedId || !text || sending) {
      if (!text) setError("پیام را بنویسید.");
      return;
    }

    setSending(true);
    setError("");
    try {
      placeMessage(await sendChat({ receiveId: selectedId, text }));
      setDraft("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-full min-h-[70vh] flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-white">
        <aside
          className={`${selectedId ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-line md:w-80 md:border-l`}
        >
          <header className="border-b border-line px-5 py-4">
            <h1 className="text-lg font-bold text-ink">گفتگو</h1>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingContacts && (
              <p className="px-5 py-6 text-sm text-muted">در حال دریافت گفتگوها...</p>
            )}
            {!loadingContacts && error && contacts.length === 0 && !selectedId && (
              <p role="alert" className="px-5 py-6 text-sm text-red-700">
                {error}
              </p>
            )}
            {!loadingContacts && !error && contacts.length === 0 && (
              <p className="px-5 py-6 text-sm leading-7 text-muted">
                هنوز گفتگویی ندارید. بعد از پذیرش درخواست، گفتگو اینجا نمایش داده می‌شود.
              </p>
            )}
            <ul>
              {contacts.map((contact) => {
                const active = contact.userId === selectedId;
                return (
                  <li key={contact.userId}>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${contact.userId}`)}
                      className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-right transition-colors hover:bg-[#f8fafc] ${
                        active ? "bg-[#f3f7f6]" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {contact.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted">
                          {contact.lastMessage || "پیامی رد و بدل نشده است"}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {contact.lastMessageAt && (
                          <span className="text-[11px] text-muted">
                            {formatWhen(contact.lastMessageAt)}
                          </span>
                        )}
                        {contact.unreadCount > 0 && (
                          <span className="rounded-full bg-navy px-2 py-0.5 text-[11px] text-white">
                            {contact.unreadCount}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className={`${selectedId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {!selectedId && (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted">
              یک گفتگو را انتخاب کنید.
            </div>
          )}
          {!!selectedId && (
            <>
              <header className="flex items-center gap-3 border-b border-line px-4 py-4">
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="inline-flex items-center gap-1 text-sm text-navy md:hidden"
                >
                  <ArrowRight size={16} />
                  بازگشت
                </button>
                <h2 className="truncate text-base font-medium text-ink">
                  {selected?.name || `کاربر ${selectedId}`}
                </h2>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] p-4" aria-live="polite">
                {loadingMessages && (
                  <p className="text-sm text-muted">در حال باز کردن گفتگو...</p>
                )}
                {!loadingMessages && messages.length === 0 && !error && (
                  <p className="text-sm text-muted">اولین پیام را بنویسید.</p>
                )}
                <ul className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const mine = message.senderId === myId;
                    return (
                      <li
                        key={message.id}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                          mine
                            ? "self-start bg-navy text-white"
                            : "self-end border border-line bg-white text-ink"
                        }`}
                      >
                        <p>{message.text}</p>
                        {message.createdAt && (
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>
                            {formatWhen(message.createdAt)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div ref={bottomRef} />
              </div>
              <form onSubmit={submit} className="border-t border-line p-4">
                {error && (
                  <p role="alert" className="mb-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <textarea
                    rows={1}
                    value={draft}
                    placeholder="پیام خود را بنویسید"
                    className="h-10 min-h-0 flex-1 resize-none rounded-xl border border-line px-4 py-2 text-sm leading-5 text-ink outline-none placeholder:text-muted/70 focus:border-navy"
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (error) setError("");
                    }}
                  />
                  <Btn
                    type="submit"
                    loading={sending}
                    disabled={!draft.trim()}
                    aria-label="ارسال"
                    className="!h-10 !w-10 !p-0"
                  >
                    {!sending && <SendHorizontal size={18} className="-scale-x-100" />}
                  </Btn>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
