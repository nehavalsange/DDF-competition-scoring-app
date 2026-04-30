"use client";

import { publishCompetition, completeCompetition } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Globe, CheckCircle } from "lucide-react";

export function PublishButton({ competitionId, status }: { competitionId: string; status: string }) {
  if (status === "COMPLETED") return null;

  if (status === "PUBLISHED") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="success" size="sm">
            <CheckCircle className="w-4 h-4" /> Mark Completed
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Competition as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the competition. Judges will no longer be able to submit scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => completeCompetition(competitionId)}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm">
          <Globe className="w-4 h-4" /> Publish Competition
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Competition?</AlertDialogTitle>
          <AlertDialogDescription>
            Once published, judges can log in and begin scoring teams. Make sure all teams and judges are added first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => publishCompetition(competitionId)}>
            Publish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
