"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { changeJudgePassword } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, X, Loader2, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

export function ChangeJudgePasswordButton({
  userId,
  competitionId,
  judgeName,
}: {
  userId: string;
  competitionId: string;
  judgeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setPassword(""); setConfirm(""); setError(null); setSuccess(false); setShowPw(false);
    setOpen(true);
  }

  function handleSubmit() {
    if (!password) { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(null);
    startTransition(async () => {
      const result = await changeJudgePassword(userId, password, competitionId);
      if (result?.error) setError(result.error);
      else { setSuccess(true); setTimeout(() => setOpen(false), 900); }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-white/30 hover:text-amber-300 transition-colors"
        title="Change password"
      >
        <KeyRound className="w-3.5 h-3.5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div
            className="relative z-10 w-full max-w-sm bg-[#1a0f2e] border border-white/15 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
              <div>
                <h3 className="text-white font-semibold text-sm">Change Password</h3>
                <p className="text-white/40 text-xs mt-0.5">{judgeName}</p>
              </div>
              <button onClick={() => setOpen(false)} disabled={isPending} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="h-9 text-sm pr-9"
                    disabled={isPending}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Confirm password"
                  className="h-9 text-sm"
                  disabled={isPending}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />Password updated!
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <Button variant="ghost" className="flex-1 text-white/60" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleSubmit} disabled={isPending || success}>
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Saving…</> : "Update Password"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
