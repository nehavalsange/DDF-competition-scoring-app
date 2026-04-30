"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportResultsButton({
  competitionId,
  competitionName,
}: {
  competitionId: string;
  competitionName: string;
}) {
  const handleExport = async () => {
    const response = await fetch(`/api/export?competitionId=${competitionId}`);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${competitionName.replace(/\s+/g, "_")}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="no-print">
      <Download className="w-4 h-4" /> Export CSV
    </Button>
  );
}
