"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { softLogout } from "@/app/actions/auth";

const TIMEOUT_MS = 12 * 60 * 1000;   // 12 minutes
const WARNING_MS = 11 * 60 * 1000;   // warn at 11 minutes

export function InactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    function reset() {
      setShowWarning(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => setShowWarning(true), WARNING_MS);
      timeoutRef.current = setTimeout(async () => {
        await softLogout();
        router.push("/login");
      }, TIMEOUT_MS);
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [router]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-xs bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-amber-300 text-sm font-semibold">Session expiring soon</p>
      <p className="text-amber-200/70 text-xs mt-0.5">You will be logged out in 1 minute due to inactivity.</p>
    </div>
  );
}
