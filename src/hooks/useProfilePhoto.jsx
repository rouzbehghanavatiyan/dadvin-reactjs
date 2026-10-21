import { useEffect, useRef, useState } from "react";
import { validateProfilePhoto } from "../utils/profilePhoto";

export default function useProfilePhoto() {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selection = useRef(0);
  useEffect(
    () => () => {
      selection.current += 1;
    },
    [],
  );
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url);
    },
    [photo],
  );
  async function choose(file) {
    if (!file) return;
    const current = ++selection.current;
    setPhoto(null);
    setBusy(false);
    setError("");
    const problem = validateProfilePhoto(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (current !== selection.current) {
        URL.revokeObjectURL(url);
        return;
      }
      setPhoto({ file, url });
    } catch {
      URL.revokeObjectURL(url);
      if (current === selection.current)
        setError("فایل انتخاب‌شده یک عکس قابل نمایش نیست.");
    } finally {
      if (current === selection.current) setBusy(false);
    }
  }
  function remove() {
    selection.current += 1;
    setPhoto(null);
    setError("");
    setBusy(false);
  }
  return { photo, error, busy, choose, remove };
}
