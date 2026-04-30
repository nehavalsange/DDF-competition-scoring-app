"use client";

import { useActionState } from "react";
import { addJudge } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

export function AddJudgeForm({ competitionId }: { competitionId: string }) {
  const [state, action, isPending] = useActionState(addJudge, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <input type="hidden" name="competitionId" value={competitionId} />

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs">Full Name *</Label>
        <Input id="name" name="name" placeholder="Judge Name" required className="h-9 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs">Username *</Label>
          <Input id="username" name="username" placeholder="judge1" required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs">Password *</Label>
          <Input id="password" name="password" type="password" placeholder="Password" required className="h-9 text-sm" />
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20">
          Judge added successfully!
        </div>
      )}

      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        {isPending ? "Adding..." : "Add Judge"}
      </Button>
    </form>
  );
}
