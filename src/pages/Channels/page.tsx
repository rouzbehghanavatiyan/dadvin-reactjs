import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Navigate } from "react-router-dom";
import Btn from "../../UI/Btn";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { isLawyerAccount, profileRecord } from "../../utils/clientAccount";
import ClientWindow from "./ClientWindow";
import { courtChannels, roomsFor } from "./rooms";

let savedChannels: string[] = [];

export default function ChannelsPage() {
  usePageTitle("کانال‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isLawyer = isLawyerAccount(profile);
  const [selected, setSelected] = useState<string[]>(savedChannels);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(savedChannels.length === 3);
  const [domainsOpen, setDomainsOpen] = useState(true);
  const [roomName, setRoomName] = useState<string | null>(null);

  if (profile?.id != null && !isLawyer) return <Navigate to="/panel" replace />;
  if (!isLawyer) return null;

  function toggle(title: string) {
    setSaved(false);
    setError("");
    setSelected((current) => {
      if (current.includes(title)) return current.filter((item) => item !== title);
      if (current.length >= 3) return current;
      return [...current, title];
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.length !== 3) {
      setSaved(false);
      setError("سه حوزه را انتخاب کنید.");
      return;
    }
    savedChannels = [...selected];
    setSaved(true);
    setError("");
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-3 gap-4 overflow-hidden lg:grid-rows-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,4fr)]">
      <section className="min-h-0 overflow-y-auto rounded-2xl border border-line bg-white p-4 sm:p-5">
        <h1 className="text-xl font-bold text-ink">کانال‌ها</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          سه حوزه دادگاه را انتخاب کنید.
          <span className="mr-2 text-ink">{selected.length} از ۳</span>
        </p>
        <form onSubmit={submit} className="mt-6">
          <Btn
            variant="outline"
            className="w-full justify-between"
            aria-expanded={domainsOpen}
            aria-controls="court-domains"
            onClick={() => setDomainsOpen((open) => !open)}
          >
            <span>حوزه‌ها</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${domainsOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </Btn>
          {domainsOpen && (
            <div id="court-domains" className="mt-3 grid grid-cols-1 gap-3" role="group" aria-label="حوزه‌های دادگاه">
              {courtChannels.map((title) => {
                const active = selected.includes(title);
                return (
                  <Btn
                    key={title}
                    variant="outline"
                    aria-pressed={active}
                    disabled={!active && selected.length >= 3}
                    className={`w-full justify-start ${active ? "!border-navy !bg-[#e8eef6] !text-navy" : ""}`}
                    onClick={() => toggle(title)}
                  >
                    {title}
                  </Btn>
                );
              })}
            </div>
          )}
          {error && (
            <p role="alert" className="mt-4 text-xs text-red-700">
              {error}
            </p>
          )}
          {saved && (
            <p className="mt-4 text-sm leading-7 text-emerald-700">
              حوزه‌های شما ثبت شد: {selected.join("، ")}
            </p>
          )}
          <div className="mt-6">
            <Btn type="submit" disabled={selected.length !== 3}>
              ثبت کانال‌ها
            </Btn>
          </div>
        </form>
      </section>
      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <header className="border-b border-line px-4 py-4">
          <h2 className="text-base font-bold text-ink">اتاق‌ها</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {!saved && (
            <p className="text-sm leading-7 text-muted">پس از ثبت کانال‌ها، اتاق‌ها اینجا نمایش داده می‌شوند.</p>
          )}
          {saved && (
            <div className="space-y-6">
              {selected.map((channel) => (
                <section key={channel} aria-label={`اتاق‌های ${channel}`}>
                  <h3 className="text-sm font-medium text-ink">{channel}</h3>
                  <ul className="mt-2 grid grid-cols-1 gap-1.5">
                    {roomsFor(channel).map((room) => (
                      <li
                        key={room.id}
                        aria-disabled={room.full || undefined}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${room.full
                            ? "cursor-not-allowed border-[#f3d0d0] bg-[#f4f7fb] text-muted"
                            : "border-line bg-[#f8fafc]"
                          }`}
                      >
                        <p className={`min-w-0 flex-1 truncate text-sm ${room.full ? "text-muted" : "text-ink"}`}>
                          {room.id}
                        </p>
                        {!room.full && (
                          <Btn
                            className="!shrink-0 !bg-emerald-600 !px-2.5 !py-1 !text-[11px] !shadow-none hover:!bg-emerald-700"
                            onClick={() => setRoomName(room.title)}
                          >
                            ورود
                          </Btn>
                        )}
                        <p
                          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] leading-4 ${room.full
                              ? "bg-[#fde8e8] text-[#9b2c2c]"
                              : "bg-[#edf2f7] text-navy"
                            }`}
                        >
                          {room.occupancy}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="h-full min-h-0">
        <ClientWindow roomName={roomName} />
      </div>
    </div>
  );
}
