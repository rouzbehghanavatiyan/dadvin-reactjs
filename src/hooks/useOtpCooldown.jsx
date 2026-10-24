import { useEffect, useRef, useState } from "react";

export default function useOtpCooldown() {
  const deadline = useRef(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const waiting = secondsLeft > 0;
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => {
      setSecondsLeft(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [waiting]);
  function start() {
    deadline.current = Date.now() + 60000;
    setSecondsLeft(60);
    setChallengeVersion((version) => version + 1);
  }
  return {
    secondsLeft,
    challengeVersion,
    start,
    canResend: () => Date.now() >= deadline.current,
  };
}
