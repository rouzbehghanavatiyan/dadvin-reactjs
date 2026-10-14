import { NavLink } from "react-router-dom";
export default function AuthTabs() {
  return (
    <nav
      aria-label="ورود و عضویت"
      className="mb-9 grid grid-cols-2 overflow-hidden rounded-lg border border-line"
    >
      {[
        ["/login", "ورود"],
        ["/register", "ثبت نام"],
      ].map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `rounded-[7px] py-3.5 text-center text-sm transition ${isActive ? "bg-navy font-medium text-white shadow-sm" : "text-ink hover:bg-slate-50"}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
