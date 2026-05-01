"use client";

import { useState, useTransition } from "react";
import { deleteCompetition } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function DeleteCompetitionButton({ competitionId }: { competitionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-1.5">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span className="text-red-300 text-xs whitespace-nowrap">Delete all data permanently?</span>
        <Button
          size="sm"
          className="h-6 px-2 text-xs bg-red-500 hover:bg-red-600 text-white shadow-none"
          disabled={isPending}
          onClick={() => startTransition(() => deleteCompetition(competitionId))}
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, delete"}
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
      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="w-4 h-4" /> Delete
    </Button>
  );
}
