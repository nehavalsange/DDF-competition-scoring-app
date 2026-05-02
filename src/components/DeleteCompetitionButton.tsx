"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteCompetitionWithAuth } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle, Loader2, X, ShieldAlert, Eye, EyeOff } from "lucide-react";

type Step = "confirm" | "verify";

export function DeleteCompetitionButton({ competitionId }: { competitionId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("confirm");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setStep("confirm");
    setUsername("");
    setPassword("");
    setError(null);
    setShowPassword(false);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
  }

  function handleContinue() {
    setError(null);
    setStep("verify");
  }

  function handleConfirm() {
    if (!username.trim() || !password) {
      setError("Both username and password are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCompetitionWithAuth(competitionId, username.trim(), password);
      if (result?.error) setError(result.error);
      // on success the action redirects, so no need to close
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
        onClick={handleOpen}
      >
        <Trash2 className="w-4 h-4" /> Delete
      </Button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          <div
            className="relative z-10 w-full max-w-sm bg-[#130824] border border-white/15 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step === "confirm" ? "bg-red-500/15" : "bg-red-500/20"
                }`}>
                  {step === "confirm"
                    ? <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                    : <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
                  }
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Delete Competition</h3>
                  <p className="text-white/40 text-xs">
                    {step === "confirm" ? "This action cannot be undone" : "Admin verification required"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isPending} className="text-white/30 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {step === "confirm" ? (
                <p className="text-white/60 text-sm">
                  All teams, scores, judge assignments, and submissions for this competition will be
                  permanently deleted. Are you sure you want to continue?
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/60 text-sm">
                    Enter your admin credentials to confirm this destructive action.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Admin username"
                      autoComplete="username"
                      disabled={isPending}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                        placeholder="Admin password"
                        autoComplete="current-password"
                        disabled={isPending}
                        className="h-9 text-sm pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-5">
              {step === "confirm" ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setStep("confirm"); setError(null); }}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                    onClick={handleConfirm}
                    disabled={isPending}
                  >
                    {isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Deleting…</>
                      : <><Trash2 className="w-4 h-4 mr-1.5" />Delete</>
                    }
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
