import { Outlet, Link } from "react-router-dom";
import { UserRound, ArrowRight } from "lucide-react";
import Brand from "../UI/Brand";

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 sm:px-8">
          <Link to="/login" aria-label="دادوین، صفحه ورود">
            <Brand />
          </Link>
          <div className="flex items-center gap-5 text-xs">
            <span className="hidden items-center gap-2 text-muted sm:flex">
              <UserRound size={16} />
              پروفایل من
            </span>
            <Link to="/login" className="flex items-center gap-2 text-navy">
              <ArrowRight size={15} />
              صفحه ورود
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
      <footer className="px-5 pb-8 text-center text-[11px] text-muted">
        دادوین · تخصص، شفافیت، اعتماد
      </footer>
    </div>
  );
}
