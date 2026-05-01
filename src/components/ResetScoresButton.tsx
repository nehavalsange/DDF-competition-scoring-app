"use client";

import { useState, useTransition } from "react";
import { resetCompetitionScores } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertTriangle, Loader2, X } from "lucide-react";

export function ResetScoresButton({ competitionId }: { competitionId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="w-4 h-4" /> Reset Scores
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-sm bg-[#130824] border border-white/15 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Reset Competition Scores</h3>
                <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-white/60 text-sm mb-6">
              All scores, progress records, and judge submissions for this competition will be permanently cleared. Judge accounts and teams will remain.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black shadow-none"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await resetCompetitionScores(competitionId);
                    setOpen(false);
                  })
                }
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                {isPending ? "Resetting…" : "Yes, Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
