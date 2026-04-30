"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { saveScores } from "@/app/actions/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Save, CheckCircle, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ScoringFormProps {
  teamId: string;
  competitionId: string;
  categories: string[];
  existingScores: Record<string, number>;
  currentStatus: string;
}

export function ScoringForm({
  teamId,
  competitionId,
  categories,
  existingScores,
  currentStatus,
}: ScoringFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(existingScores);
  const [state, action, isPending] = useActionState(saveScores, null);
  const [markComplete, setMarkComplete] = useState(currentStatus === "COMPLETED");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const allScored = categories.every((c) => scores[c] >= 1);

  // Autosave after 3s of inactivity
  useEffect(() => {
    if (Object.keys(scores).length === 0) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (allScored) {
        setAutoSaveStatus("saving");
        formRef.current?.requestSubmit();
        setTimeout(() => setAutoSaveStatus("saved"), 1000);
      }
    }, 3000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [scores, allScored]);

  useEffect(() => {
    if (state?.success) {
      setAutoSaveStatus("saved");
      if (markComplete) {
        router.push("/judge");
      }
    }
  }, [state, markComplete, router]);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="markComplete" value={markComplete.toString()} />

      {/* Autosave status */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>Tap a star to score each category (1–5)</span>
        {autoSaveStatus === "saving" && (
          <span className="flex items-center gap-1 text-amber-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </span>
        )}
        {autoSaveStatus === "saved" && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Saved
          </span>
        )}
      </div>

      {/* Score inputs */}
      <div className="space-y-3">
        {categories.map((category) => {
          const current = scores[category] ?? 0;
          return (
            <Card key={category}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{category}</p>
                    <p className="text-white/30 text-xs mt-0.5">Score 1–5</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [category]: val }))}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-150 ${
                          current >= val
                            ? "bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-md shadow-fuchsia-500/30 scale-105"
                            : "bg-white/5 text-white/30 hover:bg-white/15 hover:text-white/60"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Hidden input for form submission */}
                {current > 0 && (
                  <input
                    type="hidden"
                    name={`score_${category}`}
                    value={current}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total & validation */}
      {Object.keys(scores).length > 0 && (
        <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-white/50 text-sm">Total Score</span>
          <span className="text-white font-bold text-xl">{totalScore}</span>
        </div>
      )}

      {!allScored && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Score all categories before marking as complete.
        </div>
      )}

      {state?.error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state.error}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="submit"
          variant="outline"
          disabled={isPending || !allScored}
          onClick={() => setMarkComplete(false)}
        >
          {isPending && !markComplete ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Draft
        </Button>
        <Button
          type="submit"
          variant="success"
          disabled={isPending || !allScored}
          onClick={() => setMarkComplete(true)}
        >
          {isPending && markComplete ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Mark Complete
        </Button>
      </div>
    </form>
  );
}
