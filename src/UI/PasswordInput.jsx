import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Input from "./Input";
import Btn from "./Btn";

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      icon={LockKeyhole}
      endAdornment={
        <Btn
          variant="ghost"
          className="!px-3 !py-2.5"
          aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </Btn>
      }
    />
  );
}
