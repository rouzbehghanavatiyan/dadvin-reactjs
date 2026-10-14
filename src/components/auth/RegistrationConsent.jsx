import { Link } from "react-router-dom";
import Checkbox from "../../UI/Checkbox";

export default function RegistrationConsent({ register, error }) {
  return (
    <Checkbox
      {...register("terms", {
        required: "برای ادامه، شرایط استفاده را بپذیرید.",
      })}
      error={error}
    >
      <Link
        to="/terms"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-navy underline underline-offset-4"
      >
        شرایط استفاده
      </Link>{" "}
      و{" "}
      <Link
        to="/privacy"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-navy underline underline-offset-4"
      >
        حریم خصوصی
      </Link>{" "}
      دادوین را می‌پذیرم.
    </Checkbox>
  );
}
