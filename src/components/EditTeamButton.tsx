"use client";

import { useState, useTransition } from "react";
import { updateTeam } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamCategory, PerformanceType } from "@/generated/prisma";
import { Edit2, X, AlertCircle, Loader2, Check } from "lucide-react";

interface Props {
  teamId: string;
  competitionId: string;
  initialData: {
    teamCode: string;
    teamName: string;
    category: string;
    performanceType: string;
    description: string;
  };
}

export function EditTeamButton({ teamId, competitionId, initialData }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [teamCode, setTeamCode] = useState(initialData.teamCode);
  const [teamName, setTeamName] = useState(initialData.teamName);
  const [category, setCategory] = useState(initialData.category);
  const [performanceType, setPerformanceType] = useState(initialData.performanceType || "DANCING");
  const [description, setDescription] = useState(initialData.description ?? "");

  function handleOpen() {
    setTeamCode(initialData.teamCode);
    setTeamName(initialData.teamName);
    setCategory(initialData.category);
    setPerformanceType(initialData.performanceType || "DANCING");
    setDescription(initialData.description ?? "");
    setError(null);
    setSuccess(false);
    setOpen(true);
  }

  function handleSubmit() {
    if (!teamCode.trim() || !teamName.trim() || !category) {
      setError("Team code, name, and category are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateTeam(teamId, competitionId, {
        teamCode: teamCode.trim(),
        teamName: teamName.trim(),
        category: category as TeamCategory,
        performanceType: performanceType as PerformanceType,
        description: description.trim(),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setOpen(false), 700);
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-white/40 hover:text-amber-300 hover:bg-amber-400/10"
        onClick={handleOpen}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-[#1a0f2e] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">
            {/* Fixed header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-white font-bold text-lg">Edit Team</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/60">Team Code *</Label>
                  <Input
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/60">Team Name *</Label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
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
                <Label className="text-xs text-white/60">Sub-category *</Label>
                <Select value={performanceType} onValueChange={setPerformanceType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DANCING">Dancing</SelectItem>
                    <SelectItem value="SINGING">Singing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional team description..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  Team updated!
                </div>
              )}
            </div>

            {/* Fixed footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0">
              <Button
                variant="ghost"
                className="flex-1 text-white/60 hover:text-white"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                onClick={handleSubmit}
                disabled={isPending || success}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
