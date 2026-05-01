"use client";

import { useState, useTransition } from "react";
import { resetCompetitionScores } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";

export function ResetScoresButton({ competitionId }: { competitionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-amber-300 text-xs whitespace-nowrap">Reset all judge scores?</span>
        <Button
          size="sm"
          className="h-6 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-black shadow-none"
          disabled={isPending}
          onClick={() => startTransition(() => resetCompetitionScores(competitionId))}
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, reset"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-white/60 hover:text-white"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
      onClick={() => setConfirming(true)}
    >
      <RotateCcw className="w-4 h-4" /> Reset Scores
    </Button>
  );
}
