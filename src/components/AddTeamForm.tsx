"use client";

import { useActionState } from "react";
import { addTeam } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AddTeamForm({ competitionId }: { competitionId: string }) {
  const [state, action, isPending] = useActionState(addTeam, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setCategory("");
    }
  }, [state]);

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <input type="hidden" name="competitionId" value={competitionId} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="teamCode" className="text-xs">Team Code *</Label>
          <Input id="teamCode" name="teamCode" placeholder="MUNCH001" required className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="teamName" className="text-xs">Team Name *</Label>
          <Input id="teamName" name="teamName" placeholder="Team Name" required className="h-9 text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-xs">Category *</Label>
        <Select name="category" value={category} onValueChange={setCategory} required>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JR_KIDS">Jr Kids</SelectItem>
            <SelectItem value="SR_KIDS">Sr Kids</SelectItem>
            <SelectItem value="ADULT">Adult</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea id="description" name="description" placeholder="Optional team description..." rows={2} className="text-sm" />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20">
          Team added successfully!
        </div>
      )}

      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        {isPending ? "Adding..." : "Add Team"}
      </Button>
    </form>
  );
}
