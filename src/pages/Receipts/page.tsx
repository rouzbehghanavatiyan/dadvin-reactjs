import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { getClientReceipts, type ClientReceiptMaster } from "../../services";
import { getErrorMessage } from "../../services/masterService";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";

const receiptDateFormat = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatReceiptDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return receiptDateFormat.format(date);
}

export default function ReceiptsPage() {
  usePageTitle("دریافتی‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [messages, setMessages] = useState<ClientReceiptMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getClientReceipts()
      .then((items) => {
        if (active) setMessages(items);
      })
      .catch((err) => {
        if (!active) return;
        setMessages([]);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
        <ul className="mt-6 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                {message.domainTitle && (
                  <span className="inline-flex rounded-full bg-[#edf2f7] px-2.5 py-0.5 text-xs text-navy">
                    {message.domainTitle}
                  </span>
                )}
                {message.userId > 0 && (
                  <span className="text-xs text-muted">شناسه شما: {message.userId}</span>
                )}
              </div>
              <p className="mt-3 text-xs text-muted">پیام شما</p>
              <p className="mt-1 text-sm leading-7 text-ink">{message.requestText}</p>
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <p className="text-xs text-muted">پاسخ‌ها</p>
                {message.items.length === 0 && (
                  <p className="text-sm text-muted">پاسخی دریافت نشده است.</p>
                )}
                {message.items.map((response) => (
                  <div key={response.id} className="rounded-xl bg-[#f8fafc] px-4 py-3">
                    {response.userId > 0 && (
                      <p className="text-xs text-muted">شناسه پاسخ: {response.userId}</p>
                    )}
                    {response.requestText && (
                      <p className="mt-1 text-sm leading-7 text-ink">{response.requestText}</p>
                    )}
                    {response.acceptDate && (
                      <p className="mt-1 text-xs text-muted">{formatReceiptDate(response.acceptDate)}</p>
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
