import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
export default function AuthFooter() {
  return (
    <footer className="mt-6">
      <div className="flex items-center gap-4 rounded-lg bg-[#f3f7fb] px-5 py-4">
        <ShieldCheck
          size={21}
          strokeWidth={1.5}
          className="shrink-0 text-ink/80"
        />
        <div className="text-[10px] leading-6 text-muted">
          <p>حفظ محرمانگی اطلاعات شما، اولویت ماست.</p>
          <p>ما به حریم خصوصی شما احترام می‌گذاریم.</p>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-5 text-[10px] text-muted">
        <Link to="/privacy" className="hover:text-ink">
          حریم خصوصی
        </Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-ink">
          شرایط استفاده
        </Link>
        <span>·</span>
        <span>© دادوین ۱۴۰۵</span>
      </div>
    </footer>
  );
}
