import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { receiveUserMessages, type UserMessage } from "../../services/userMessages";
import { isClientAccount, profileRecord } from "../../utils/clientAccount";
import LawyerIdentity, { lawyerName } from "./LawyerCard";

export default function ChatPage() {
  usePageTitle("گفتگو");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isClient = isClientAccount(profile);
  const [lawyers, setLawyers] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    receiveUserMessages()
      .then((items) => {
        if (active) setLawyers(items);
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
      <h1 className="text-xl font-bold text-ink">گفتگو</h1>
      {loading && <p className="mt-6 text-sm text-muted">در حال دریافت وکلا...</p>}
      {!loading && lawyers.length === 0 && (
        <p className="mt-6 text-sm text-muted">وکیلی برای گفتگو نیست.</p>
      )}
      {!!lawyers.length && (
        <ul className="mt-6 space-y-3">
          {lawyers.map((lawyer) => (
            <li key={lawyer.id}>
              <Link
                to={`/chat/${lawyer.id}`}
                aria-label={`گفتگو با ${lawyerName(lawyer)}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy"
              >
                <LawyerIdentity
                  id={lawyer.id}
                  firstName={lawyer.firstName}
                  lastName={lawyer.lastName}
                  score={lawyer.score}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
