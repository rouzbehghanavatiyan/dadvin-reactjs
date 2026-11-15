import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Navigate } from "react-router-dom";
import Btn from "../../UI/Btn";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { isLawyerAccount, profileRecord } from "../../utils/clientAccount";
import { useLawyerRequestSocket } from "../../hooks/useLawyerRequestSocket";
import { getDomainRooms, getDomains, type DomainItem, type DomainRoomItem } from "../../services";
import { getErrorMessage } from "../../services/masterService";
import ClientWindow from "./ClientWindow";

const roomCapacity = 10;

function persianNumber(value: number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function roomIsFull(room: DomainRoomItem) {
  return room.full || room.entranceRoom === roomCapacity;
}

function roomOccupancy(room: DomainRoomItem) {
  if (roomIsFull(room)) return "ظرفیت تکمیل است";
  return `${persianNumber(room.entranceRoom)} از ${persianNumber(roomCapacity)}`;
}

let savedChannels: string[] = [];

export default function ChannelsPage() {
  usePageTitle("کانال‌ها");
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isLawyer = isLawyerAccount(profile);
  const incomingRequests = useLawyerRequestSocket(isLawyer);
  const [selected, setSelected] = useState<string[]>(savedChannels);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(savedChannels.length === 5);
  const [domainsOpen, setDomainsOpen] = useState(true);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [roomDomainId, setRoomDomainId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [domainsError, setDomainsError] = useState("");
  const [rooms, setRooms] = useState<DomainRoomItem[]>([]);
  const [roomsError, setRoomsError] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    let active = true;
    getDomains()
      .then((items) => {
        if (active) setDomains(items);
      })
      .catch((err) => {
        if (!active) return;
        setDomains([]);
        setDomainsError(getErrorMessage(err));
      });
    setLoadingRooms(true);
    getDomainRooms()
      .then((items) => {
        if (active) setRooms(items);
      })
      .catch((err) => {
        if (!active) return;
        setRooms([]);
        setRoomsError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoadingRooms(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const roomGroups = (() => {
    const groups = new Map<string, DomainRoomItem[]>();
    rooms.forEach((room) => {
      const key = room.domainTitle || domains.find((item) => item.id === room.domainId)?.title || `حوزه ${room.domainId}`;
      const current = groups.get(key) ?? [];
      current.push(room);
      groups.set(key, current);
    });
    const chosen = saved ? selected : [];
    const entries = [...groups.entries()].filter(([title]) => chosen.length === 0 || chosen.includes(title));
    return entries.length > 0 ? entries : [...groups.entries()];
  })();

  if (profile?.id != null && !isLawyer) return <Navigate to="/panel" replace />;
  if (!isLawyer) return null;

  function openRoom(room: DomainRoomItem) {
    if (roomIsFull(room)) return;
    setRoomName(room.title);
    setRoomDomainId(room.domainId);
    setSelectedRoomId(room.id);
  }

  function toggle(title: string) {
    setSaved(false);
    setError("");
    setSelected((current) => {
      if (current.includes(title)) return current.filter((item) => item !== title);
      if (current.length >= 5) return current;
      return [...current, title];
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.length !== 5) {
      setSaved(false);
      setError("پنج حوزه را انتخاب کنید.");
      return;
    }
    savedChannels = [...selected];
    setSaved(true);
    setError("");
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1.8fr)] gap-4 overflow-hidden lg:grid-rows-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,5.4fr)]">
      <div className="grid min-h-0 grid-rows-2 gap-4 overflow-hidden">
      <section className="min-h-0 overflow-y-auto rounded-2xl border border-line bg-white p-4 sm:p-5">
        <h1 className="text-xl font-bold text-ink">کانال‌ها</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          پنج حوزه را انتخاب کنید.
          <span className="mr-2 text-ink">{selected.length} از ۵</span>
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
              {domainsError && (
                <p role="alert" className="text-xs text-red-700">{domainsError}</p>
              )}
              {domains.length === 0 && !domainsError && (
                <p className="text-sm text-muted">در حال دریافت حوزه‌ها...</p>
              )}
              {domains.map((domain) => {
                const title = domain.title;
                const active = selected.includes(title);
                return (
                  <Btn
                    key={title}
                    variant="outline"
                    aria-pressed={active}
                    disabled={!active && selected.length >= 5}
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
            <Btn type="submit" disabled={selected.length !== 5}>
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
          {loadingRooms && (
            <p className="text-sm text-muted">در حال دریافت اتاق‌ها...</p>
          )}
          {roomsError && (
            <p role="alert" className="text-xs text-red-700">{roomsError}</p>
          )}
          {!loadingRooms && !roomsError && roomGroups.length === 0 && (
            <p className="text-sm leading-7 text-muted">اتاقی برای نمایش نیست.</p>
          )}
          {!loadingRooms && !roomsError && roomGroups.length > 0 && (
            <div className="space-y-6">
              {roomGroups.map(([channel, channelRooms]) => (
                <section key={channel} aria-label={`اتاق‌های ${channel}`}>
                  <h3 className="text-sm font-medium text-ink">{channel}</h3>
                  <ul className="mt-2 grid grid-cols-1 gap-1.5">
                    {channelRooms.map((room) => {
                      const full = roomIsFull(room);
                      const active = room.id === selectedRoomId;
                      return (
                        <li
                          key={room.id}
                          aria-disabled={full || undefined}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${active
                              ? "border-navy bg-[#e8eef6]"
                              : full
                                ? "cursor-not-allowed border-[#f3d0d0] bg-[#f4f7fb] text-muted"
                                : "border-line bg-[#f8fafc]"
                            }`}
                        >
                          <p className={`min-w-0 flex-1 truncate text-sm ${full ? "text-muted" : "text-ink"}`}>
                            {room.title}
                          </p>
                          {!full && (
                            <Btn
                              className="!shrink-0 !bg-emerald-600 !px-2.5 !py-1 !text-[11px] !shadow-none hover:!bg-emerald-700"
                              onClick={() => openRoom(room)}
                            >
                              ورود
                            </Btn>
                          )}
                          <p
                            className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] leading-4 ${full
                                ? "bg-[#fde8e8] text-[#9b2c2c]"
                                : "bg-[#edf2f7] text-navy"
                              }`}
                          >
                            {roomOccupancy(room)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
      <div className="h-full min-h-0">
        <ClientWindow
          roomName={roomName}
          roomId={selectedRoomId}
          domainId={roomDomainId}
          incoming={incomingRequests}
        />
      </div>
    </div>
  );
}
