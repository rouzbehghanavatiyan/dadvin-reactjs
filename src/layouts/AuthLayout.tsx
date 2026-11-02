import { Outlet } from "react-router-dom";
import BrandPanel from "../components/auth/BrandPanel";
import AuthFooter from "../components/auth/AuthFooter";
import Header from "./Header";
export default function AuthLayout() {
  return (
    <main className="flex h-full items-center justify-center overflow-hidden p-3 sm:p-6 lg:p-10 xl:p-14">
      <div className="grid h-full max-h-full w-full max-w-[1360px] overflow-hidden rounded-lg bg-white shadow-[0_22px_90px_-28px_#19395940] lg:grid-cols-2">
        <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto px-5 py-7 sm:px-10 lg:px-12 xl:px-16">
          <Header />
          <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col justify-center pt-12 pb-1">
            <Outlet />
            <AuthFooter />
          </div>
        </section>
        <BrandPanel />
      </div>
    </main>
  );
}
