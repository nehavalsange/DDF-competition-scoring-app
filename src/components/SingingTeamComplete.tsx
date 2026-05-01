"use client";

import { useState, useTransition } from "react";
import { markTeamAttended } from "@/app/actions/scoring";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mic, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  teamId: string;
  currentStatus: string;
}

export function SingingTeamComplete({ teamId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(currentStatus === "COMPLETED");

  function handleComplete() {
    startTransition(async () => {
      await markTeamAttended(teamId);
      setIsCompleted(true);
      setTimeout(() => router.push("/judge"), 900);
    });
  }

  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-4">
        <Mic className="w-8 h-8 text-fuchsia-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">Singing Performance</h3>
      <p className="text-white/50 text-sm mb-2">This team is in the Singing category.</p>
      <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Scoring parameters are not applicable. Once you have witnessed their performance, mark it as attended.
      </p>

      {isCompleted ? (
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
          <CheckCircle className="w-5 h-5" />
          Marked as attended
        </div>
      ) : (
        <Button
          onClick={handleComplete}
          disabled={isPending}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Marking...</>
          ) : (
            <><CheckCircle className="w-4 h-4 mr-2" />Mark as Attended</>
          )}
        </Button>
      )}
    </div>
  );
}
