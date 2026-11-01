import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Navigate } from "react-router-dom";
import Btn from "../../UI/Btn";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import {
  receiveUserMessages,
  type UserMessage,
} from "../../services/userMessages";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";

const avatarTones = [
  "bg-[#e8eef6] text-navy",
  "bg-[#e7f5ee] text-emerald-800",
  "bg-[#f8efe4] text-amber-800",
  "bg-[#f3e8f5] text-purple-800",
  "bg-[#e7f1f8] text-sky-800",
  "bg-[#f8e8e8] text-red-800",
];

const topicOrder = ["کیفری", "حقوقی", "خانواده"];

function messagesByTopic(messages: UserMessage[]) {
  const grouped = new Map<string, UserMessage[]>();
  for (const message of messages) {
    const items = grouped.get(message.requestText) ?? [];
    items.push(message);
    grouped.set(message.requestText, items);
  }
  return [...grouped.entries()]
    .sort((left, right) => {
      const leftTopic = topicOrder.indexOf(left[1][0]?.petitionType ?? "");
      const rightTopic = topicOrder.indexOf(right[1][0]?.petitionType ?? "");
      return (leftTopic === -1 ? topicOrder.length : leftTopic) -
        (rightTopic === -1 ? topicOrder.length : rightTopic);
    })
    .map(([requestText, items]) => ({
      requestText,
      topic: items[0]?.petitionType ?? "",
      items,
    }));
}

export default function ReceiptsPage() {
  usePageTitle("دریافتی‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    receiveUserMessages()
      .then((items) => {
        if (active) setMessages(items);
      })
      .catch(() => {
        if (!active) return;
        setError("پیام‌ها دریافت نشد.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function decide(id: string, status: UserMessage["status"]) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, status } : message,
      ),
    );
  }

  if (profile?.id != null && !isClient) return <Navigate to="/panel" replace />;
  if (!isClient) return null;

  return (
    <section className="mx-auto max-w-2xl">
     
      {loading && (
        <p className="mt-6 text-sm text-muted">در حال دریافت پیام‌ها...</p>
      )}
      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}
      {!loading && !error && messages.length === 0 && (
        <p className="mt-6 text-sm text-muted">پیامی دریافت نشد.</p>
      )}
      {!!messages.length && (
        <div className="mt-6 space-y-8">
          {messagesByTopic(messages).map((group) => (
            <section key={group.requestText} aria-label={group.requestText}>
              <h2 className="mb-1 text-base font-medium leading-7 text-ink">
                {group.requestText}
              </h2>
             
              <ul className="space-y-3">
                {group.items.map((message) => (
                  <li
                    key={message.id}
                    className="rounded-2xl border border-line bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${avatarTones[Number(message.id) - 1] || avatarTones[0]}`}
                          aria-hidden="true"
                        >
                          <UserRound size={22} strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-medium text-ink">
                            {`${message.firstName} ${message.lastName}`.trim()}
                          </h3>
                          <span className="mt-1 inline-flex rounded-full bg-[#edf2f7] px-2.5 py-0.5 text-xs text-navy">
                            {message.petitionType}
                          </span>
                        </div>
                      </div>
                      <p className="shrink-0 rounded-full bg-[#fff4d6] px-3 py-1 text-sm text-[#8a5a00]">
                        امتیاز:{message.score}
                      </p>
                    </div>
                    <p className="mt-4 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">قیمت پیشنهادی</span>
                      <span className="font-medium text-ink">{message.suggestedPrice}</span>
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink">{message.message}</p>
                    {message.status === "pending" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Btn
                          className="!px-4 !py-2.5 !text-xs"
                          onClick={() => decide(message.id, "approved")}
                        >
                          تأیید
                        </Btn>
                        <Btn
                          variant="outline"
                          className="!px-4 !py-2.5 !text-xs"
                          onClick={() => decide(message.id, "rejected")}
                        >
                          رد درخواست
                        </Btn>
                      </div>
                    ) : (
                      <p
                        className={`mt-4 text-xs ${
                          message.status === "approved"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {message.status === "approved" ? "تأیید شد" : "رد شد"}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
