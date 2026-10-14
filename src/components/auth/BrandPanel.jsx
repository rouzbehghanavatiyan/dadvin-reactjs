import { UsersRound, Files, ShieldCheck } from "lucide-react";
import Brand from "../../UI/Brand";
import TrustItem from "./TrustItem";
export default function BrandPanel() {
  return (
    <aside
      className="brand-panel relative hidden min-h-[850px] flex-col overflow-hidden text-white lg:flex"
      dir="rtl"
    >
      <div className="relative z-10 flex h-full flex-1 flex-col px-10 py-12 xl:px-14">
        <div className="text-left">
          <Brand light />
        </div>
        <div className="ml-0 mr-auto mt-16 w-full max-w-[300px] text-right xl:mt-20">
          <h2 className="text-[29px] font-bold leading-[1.8] xl:text-[32px]">
            آینده خدمات حقوقی
            <br />
            در دستان شماست
          </h2>
          <p className="mt-5 text-[13px] leading-7 text-white/90">
            با دادوین به دنیای جدیدی از خدمات حقوقی، شفاف و مطمئن وارد شوید.
          </p>
          <div className="mt-8 grid max-w-[270px] gap-6">
            <TrustItem icon={UsersRound} title="دسترسی به وکلای متخصص">
              و داوران حرفه‌ای
            </TrustItem>
            <TrustItem icon={Files} title="مدیریت یکپارچه پرونده‌ها">
              در یک بستر تخصصی
            </TrustItem>
            <TrustItem icon={ShieldCheck} title="ارتباط امن و شفاف">
              با اعضای اکوسیستم
            </TrustItem>
          </div>
        </div>
        <div className="mt-auto pt-44 text-left text-[13px] leading-7 text-white/90">
          <span className="mb-3 ml-0 mr-auto block h-px w-10 bg-gold" />
          <p className="text-gold">خدمات حقوقی بهتر.</p>
          <p>آینده‌ای مطمئن‌تر.</p>
        </div>
      </div>
    </aside>
  );
}
