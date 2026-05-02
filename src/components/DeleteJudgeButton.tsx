"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteJudgeAccount } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { UserX, AlertTriangle, Loader2, X } from "lucide-react";

export function DeleteJudgeButton({
  userId,
  competitionId,
  judgeName,
}: {
  userId: string;
  competitionId: string;
  judgeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteJudgeAccount(userId, competitionId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white/30 hover:text-red-400 transition-colors"
        title="Delete judge account"
      >
        <UserX className="w-3.5 h-3.5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div
            className="relative z-10 w-full max-w-sm bg-[#130824] border border-white/15 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Delete Judge Account</h3>
                  <p className="text-white/40 text-xs">This cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} disabled={isPending} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-white/60 text-sm">
                Delete <span className="text-white font-medium">{judgeName}</span>? Their account, all scores, and progress records will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Deleting…</> : <><UserX className="w-4 h-4 mr-1.5" />Delete</>}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
