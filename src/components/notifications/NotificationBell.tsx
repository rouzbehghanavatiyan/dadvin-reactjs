import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { receiveUserMessages } from "../../services/userMessages";

export default function NotificationBell() {
  const location = useLocation();
  const active = location.pathname.startsWith("/receipts");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let activeRequest = true;
    receiveUserMessages()
      .then((items) => {
        if (!activeRequest) return;
        setPendingCount(items.filter((item) => item.status === "pending").length);
      })
      .catch(() => {
        if (activeRequest) setPendingCount(0);
      });
    return () => {
      activeRequest = false;
    };
  }, []);

  return (
    <Link
      to="/receipts"
      aria-label="دریافتی‌ها"
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center justify-center rounded-xl p-2 text-navy transition-colors hover:bg-navy/5 ${
        active ? "bg-slate-100" : ""
      }`}
    >
      <Bell size={18} />
      {pendingCount > 0 && (
        <span className="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none text-white">
          {pendingCount}
        </span>
      )}
    </Link>
  );
}
