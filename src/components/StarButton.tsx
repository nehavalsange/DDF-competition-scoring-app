"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

function storageKey(judgeId: string) {
  return `ddf_starred_${judgeId}`;
}

function getStarred(judgeId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(judgeId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveStarred(judgeId: string, starred: Set<string>) {
  localStorage.setItem(storageKey(judgeId), JSON.stringify([...starred]));
}

export function StarButton({ teamId, judgeId }: { teamId: string; judgeId: string }) {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    setStarred(getStarred(judgeId).has(teamId));
  }, [teamId, judgeId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = getStarred(judgeId);
    if (current.has(teamId)) {
      current.delete(teamId);
    } else {
      current.add(teamId);
    }
    saveStarred(judgeId, current);
    setStarred(current.has(teamId));
  };

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg transition-all duration-150 ${
        starred
          ? "text-amber-400 bg-amber-400/10"
          : "text-white/20 hover:text-white/50 hover:bg-white/10"
      }`}
      title={starred ? "Remove from revisit" : "Mark to revisit"}
    >
      <Star className={`w-4 h-4 ${starred ? "fill-amber-400" : ""}`} />
    </button>
  );
}
