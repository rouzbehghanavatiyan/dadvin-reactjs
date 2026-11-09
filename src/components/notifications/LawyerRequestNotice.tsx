import { useState } from "react";
import { X } from "lucide-react";
import Btn from "../../UI/Btn";
import { useLawyerRequestSocket } from "../../hooks/useLawyerRequestSocket";
import type { IncomingClientRequest } from "../../services/requestSocket";

function domainLabel(domainId: number) {
  if (domainId === 1) return "خانواده";
  if (domainId === 2) return "کیفری";
  if (domainId === 3) return "حقوق";
  return `حوزه ${domainId}`;
}

export default function LawyerRequestNotice({ enabled }: { enabled: boolean }) {
  const requests = useLawyerRequestSocket(enabled);
  const [hidden, setHidden] = useState<number[]>([]);
  const visible = requests.filter((item) => !hidden.includes(item.id)).slice(0, 3);
  if (!visible.length) return null;

  function hide(request: IncomingClientRequest) {
    setHidden((current) => (current.includes(request.id) ? current : [...current, request.id]));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4">
      <ul className="pointer-events-auto flex w-full max-w-lg flex-col gap-2">
        {visible.map((request) => (
          <li
            key={request.id}
            className="rounded-xl border border-[#d5e2f2] bg-white px-4 py-3 shadow-lg"
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-navy">
                درخواست جدید · {domainLabel(request.domainId)}
              </p>
              <Btn
                variant="ghost"
                className="!p-1"
                aria-label="بستن پیام"
                onClick={() => hide(request)}
              >
                <X size={14} />
              </Btn>
            </div>
            <p className="mt-1 text-sm leading-7 text-ink">{request.requestText}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
