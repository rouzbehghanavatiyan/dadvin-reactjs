import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { useAppSelector } from "../../hooks/store/store";
import { isLawyerAccount, profileRecord } from "../../utils/clientAccount";
import { roomsFor } from "./rooms";

export default function ChannelRoomPage() {
  const { channel = "", roomId = "" } = useParams();
  const decodedChannel = decodeURIComponent(channel);
  const decodedRoomId = decodeURIComponent(roomId);
  const userProfile = useAppSelector((state) => state.main.userProfile);
  const profile = profileRecord(userProfile);
  const isLawyer = isLawyerAccount(profile);
  const room = roomsFor(decodedChannel).find((item) => item.id === decodedRoomId);

  usePageTitle(room ? room.title : "اتاق");

  if (profile?.id != null && !isLawyer) return <Navigate to="/panel" replace />;
  if (!isLawyer) return null;

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-9">
      <Link
        to="/channels"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-navy hover:underline"
      >
        <ArrowRight size={16} />
        بازگشت به کانال‌ها
      </Link>
      {!room && <p className="text-sm text-muted">این اتاق پیدا نشد.</p>}
      {room?.full && (
        <p className="inline-flex rounded-full bg-[#fde8e8] px-3 py-1 text-sm text-[#9b2c2c]">
          ظرفیت تکمیل است
        </p>
      )}
      {room && !room.full && (
        <>
          <p className="text-xs text-muted">
            {decodedChannel} · اتاق {room.number}
          </p>
          <h1 className="mt-2 text-xl font-bold text-ink">{room.title}</h1>
          <p className="mt-4 text-sm text-navy">{room.occupancy}</p>
          <p className="mt-3 text-sm leading-7 text-emerald-700">وارد این اتاق شدید.</p>
        </>
      )}
    </section>
  );
}