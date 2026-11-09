import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Gavel, Paperclip, Scale, Trash2, Users } from "lucide-react";
import { Navigate, useSearchParams } from "react-router-dom";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { createReqClient, getReqClient, type ClientRequestItem } from "../../services";
import { getErrorMessage } from "../../services/masterService";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";
import { requestFileAccept, validateRequestFile } from "../../utils/requestFile";

const fileBaseUrl = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

const requestDateFormat = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatRequestDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return requestDateFormat.format(date);
}

function requestFileUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${fileBaseUrl}/${path.replace(/^\/+/, "")}`;
}

function requestFileName(path: string) {
  return path.split("/").filter(Boolean).pop() || "فایل";
}

const categories = [
  { id: "family", label: "خانواده", domainId: 1, icon: Users },
  { id: "criminal", label: "کیفری", domainId: 2, icon: Gavel },
  { id: "law", label: "حقوق", domainId: 3, icon: Scale },
] as const;

export default function RequestsPage() {
  usePageTitle("درخواست‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [params, setParams] = useSearchParams();
  const selected = categories.find((item) => item.id === params.get("category"));
  const [requestText, setRequestText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [sentText, setSentText] = useState("");
  const [sentFileName, setSentFileName] = useState("");
  const [sending, setSending] = useState(false);
  const [requests, setRequests] = useState<ClientRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const domainId = selected?.domainId;

  const loadRequests = useCallback(async () => {
    if (!domainId) return;
    setLoadingRequests(true);
    setRequestsError("");
    try {
      const items = await getReqClient();
      setRequests(items.filter((item) => item.domainId === domainId));
    } catch (err) {
      setRequests([]);
      setRequestsError(getErrorMessage(err));
    } finally {
      setLoadingRequests(false);
    }
  }, [domainId]);

  useEffect(() => {
    setRequestText("");
    setFile(null);
    setError("");
    setSentText("");
    setSentFileName("");
  }, [selected?.id]);

  useEffect(() => {
    if (!isClient || !domainId) return;
    void loadRequests();
  }, [isClient, domainId, loadRequests]);

  if (profile?.id != null && !isClient) return <Navigate to="/panel" replace />;
  if (!isClient) return null;

  if (!selected) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-6 sm:p-9">
        <h1 className="text-xl font-bold text-ink">
          کدام دسته می‌خواهی وارد شوی؟
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          برای ادامه، یکی از دسته‌های زیر را انتخاب کنید.
        </p>
        <div className="mt-6 grid gap-3" role="group" aria-label="دسته‌های درخواست">
          {categories.map(({ id, label, icon: Icon }) => (
            <Btn
              key={id}
              variant="outline"
              className="w-full justify-start py-4"
              onClick={() => setParams({ category: id })}
            >
              <Icon size={18} className="text-navy" aria-hidden="true" />
              {label}
            </Btn>
          ))}
        </div>
      </section>
    );
  }

  const SelectedIcon = selected.icon;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const value = requestText.trim();
    if (!value) {
      setError("درخواست خود را وارد کنید.");
      return;
    }
    if (file) {
      const problem = validateRequestFile(file);
      if (problem) {
        setError(problem);
        return;
      }
    }
    setSending(true);
    setError("");
    try {
      await createReqClient({
        domainId: selected.domainId,
        requestText: value,
        file,
      });
      setSentText(value);
      setSentFileName(file?.name ?? "");
      setFile(null);
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-6 sm:p-9">
      <p className="text-xs text-muted">دسته انتخاب‌شده</p>
      <h1 className="mt-2 flex items-center gap-2 text-xl font-bold text-ink">
        <SelectedIcon size={22} className="text-navy" aria-hidden="true" />
        {selected.label}
      </h1>
      {sentText ? (
        <div className="mt-6">
          <p className="text-sm leading-7 text-emerald-700">درخواست شما ارسال شد.</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{sentText}</p>
          {sentFileName && (
            <p className="mt-2 text-sm text-muted">
              فایل: <bdi>{sentFileName}</bdi>
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => setSentText("")}>
              درخواست دیگر
            </Btn>
            <Btn variant="ghost" onClick={() => setParams({})}>
              تغییر دسته
            </Btn>
          </div>
        </div>
      ) : (
        <form className="mt-6" noValidate onSubmit={submit}>
          <TextArea
            label="درخواست شما"
            rows={6}
            value={requestText}
            disabled={sending}
            onChange={(event) => {
              setRequestText(event.target.value);
              setError("");
            }}
            error={error}
            placeholder="درخواست خود را بنویسید"
          />
          <div className="mt-4">
            <p className="mb-2.5 text-[13px] font-medium text-ink">فایل پیوست (اختیاری)</p>
            <p className="mb-2.5 text-xs leading-6 text-muted">عکس، اکسل یا PDF، حداکثر ۱۰ مگابایت.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Btn
                variant="outline"
                disabled={sending}
                onClick={() => fileInput.current?.click()}
              >
                <Paperclip size={16} />
                {file ? "تغییر فایل" : "انتخاب فایل"}
              </Btn>
              {file && (
                <Btn
                  variant="ghost"
                  disabled={sending}
                  aria-label="حذف فایل انتخاب‌شده"
                  onClick={() => setFile(null)}
                >
                  <Trash2 size={16} />
                </Btn>
              )}
              {file && <p className="min-w-0 truncate text-sm text-muted"><bdi>{file.name}</bdi></p>}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept={requestFileAccept}
              className="sr-only"
              disabled={sending}
              aria-label="انتخاب فایل درخواست"
              onChange={(event) => {
                const next = event.target.files?.[0];
                event.target.value = "";
                if (!next) return;
                const problem = validateRequestFile(next);
                if (problem) {
                  setFile(null);
                  setError(problem);
                  return;
                }
                setError("");
                setFile(next);
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn type="submit" loading={sending} disabled={sending}>
              ارسال درخواست
            </Btn>
            <Btn variant="ghost" onClick={() => setParams({})}>
              تغییر دسته
            </Btn>
          </div>
        </form>
      )}
      <div className="mt-8 border-t border-line pt-6">
        <h2 className="text-sm font-bold text-ink">درخواست‌های ثبت‌شده</h2>
        {loadingRequests && (
          <p className="mt-3 text-sm text-muted">در حال دریافت درخواست‌ها...</p>
        )}
        {requestsError && (
          <p className="mt-3 text-sm text-red-600" role="alert">{requestsError}</p>
        )}
        {!loadingRequests && !requestsError && requests.length === 0 && (
          <p className="mt-3 text-sm leading-7 text-muted">
            هنوز درخواستی در این دسته ثبت نشده است.
          </p>
        )}
        {requests.length > 0 && (
          <ul className="mt-4 grid gap-3">
            {requests.map((item) => (
              <li key={item.id} className="rounded-xl border border-line p-4">
                <p className="text-xs text-muted">{formatRequestDate(item.createDate)}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">{item.requestText}</p>
                {item.filePath ? (
                  <a
                    className="mt-2 inline-block text-sm text-navy underline"
                    href={requestFileUrl(item.filePath)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    فایل: <bdi>{requestFileName(item.filePath)}</bdi>
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-muted">بدون فایل</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
