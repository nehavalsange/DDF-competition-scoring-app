"use client";

import { submitFinalScores } from "@/app/actions/scoring";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Send, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function SubmitFinalButton({ competitionId }: { competitionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await submitFinalScores(competitionId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="success" className="w-full" size="lg">
            <Send className="w-4 h-4" />
            Submit Final Scores
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Submit Final Scores?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your final scores?
              <strong className="text-white/80 block mt-2">You cannot edit your scores after submission.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Submitting..." : "Yes, Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
