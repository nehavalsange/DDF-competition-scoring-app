"use client";

import { deleteTeam } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteTeamButton({ teamId, competitionId }: { teamId: string; competitionId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-white/30 hover:text-red-400 hover:bg-red-500/10"
      onClick={() => deleteTeam(teamId, competitionId)}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
