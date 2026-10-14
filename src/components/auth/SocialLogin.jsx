import Btn from "../../UI/Btn";
import Divider from "../../UI/Divider";
import ProviderIcon from "../../UI/ProviderIcon";
export default function SocialLogin() {
  return (
    <div className="mt-7">
      <Divider>یا</Divider>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          ["linkedin", "لینکدین"],
          ["google", "گوگل"],
        ].map(([provider, label]) => (
          <Btn
            key={provider}
            variant="outline"
            disabled
            title="پس از فعال‌شدن سرویس ورود اجتماعی در دسترس خواهد بود"
            className="!rounded-lg !px-2 !py-2.5 !text-xs disabled:!opacity-75"
          >
            <span>ورود با {label}</span>
            <ProviderIcon provider={provider} />
          </Btn>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-muted">
        ورود با گوگل و لینکدین به‌زودی فعال می‌شود.
      </p>
    </div>
  );
}
