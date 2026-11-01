import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { appendClientMessage, openThread, type ChatLine } from "../../services/chatThread";
import { receiveUserMessages, type UserMessage } from "../../services/userMessages";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";
import LawyerIdentity, { lawyerName } from "./LawyerCard";

export default function ChatRoomPage() {
  const { lawyerId = "" } = useParams();
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [lawyer, setLawyer] = useState<UserMessage | null>(null);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  usePageTitle(lawyer ? `گفتگو با ${lawyerName(lawyer)}` : "گفتگو");

  useEffect(() => {
    let active = true;
    receiveUserMessages()
      .then((items) => {
        if (!active) return;
        const found = items.find((item) => item.id === lawyerId) ?? null;
        setLawyer(found);
        if (found) setLines(openThread(found.id, found.message));
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [lawyerId]);

  if (profile?.id != null && !isClient) return <Navigate to="/panel" replace />;
  if (!isClient) return null;

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!lawyer || !text) {
      setError("پیام را بنویسید.");
      return;
    }
    setLines(appendClientMessage(lawyer.id, text));
    setDraft("");
    setError("");
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      <Link
        to="/chat"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-navy hover:underline"
      >
        <ArrowRight size={16} />
        بازگشت به گفتگو
      </Link>
      {!ready && <p className="text-sm text-muted">در حال باز کردن اتاق گفتگو...</p>}
      {ready && !lawyer && (
        <p className="text-sm text-muted">این گفتگو پیدا نشد.</p>
      )}
      {lawyer && (
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-line p-5">
            <LawyerIdentity
              id={lawyer.id}
              firstName={lawyer.firstName}
              lastName={lawyer.lastName}
              score={lawyer.score}
            />
          </header>
          <ul className="flex flex-1 flex-col gap-3 bg-[#f8fafc] p-5" aria-live="polite">
            {lines.map((line) => (
              <li
                key={line.id}
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                  line.from === "client"
                    ? "self-start bg-navy text-white"
                    : "self-end border border-line bg-white text-ink"
                }`}
              >
                {line.text}
              </li>
            ))}
          </ul>
          <form onSubmit={send} className="border-t border-line p-4">
            <TextArea
              label="پیام شما"
              rows={2}
              value={draft}
              error={error}
              placeholder="پیام خود را بنویسید"
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError("");
              }}
            />
            <div className="mt-3 flex justify-end">
              <Btn type="submit">ارسال</Btn>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
