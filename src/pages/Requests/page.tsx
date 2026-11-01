import { useEffect, useState, type FormEvent } from "react";
import { Gavel, Scale, Users } from "lucide-react";
import { Navigate, useSearchParams } from "react-router-dom";
import Btn from "../../UI/Btn";
import TextArea from "../../UI/TextArea";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";

const categories = [
  { id: "family", label: "خانواده", icon: Users },
  { id: "criminal", label: "کیفری", icon: Gavel },
  { id: "law", label: "حقوق", icon: Scale },
] as const;

export default function RequestsPage() {
  usePageTitle("درخواست‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [params, setParams] = useSearchParams();
  const selected = categories.find((item) => item.id === params.get("category"));
  const [requestText, setRequestText] = useState("");
  const [error, setError] = useState("");
  const [sentText, setSentText] = useState("");

  useEffect(() => {
    setRequestText("");
    setError("");
    setSentText("");
  }, [selected?.id]);

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = requestText.trim();
    if (!value) {
      setError("درخواست خود را وارد کنید.");
      return;
    }
    setError("");
    setSentText(value);
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
            onChange={(event) => {
              setRequestText(event.target.value);
              setError("");
            }}
            error={error}
            placeholder="درخواست خود را بنویسید"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn type="submit">ارسال درخواست</Btn>
            <Btn variant="ghost" onClick={() => setParams({})}>
              تغییر دسته
            </Btn>
          </div>
        </form>
      )}
    </section>
  );
}
