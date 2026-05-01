"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

type Criterion = { name: string; desc: string };

const SECTIONS: { title: string; subtitle: string; color: string; criteria: Criterion[] }[] = [
  {
    title: "Jr Kids",
    subtitle: "Ages 6–12 · 5 scoring parameters · Max 25 pts",
    color: "fuchsia",
    criteria: [
      {
        name: "Choreography",
        desc: "Creative arrangement of movements, transitions, formations, and patterns. Judges look for variety, structure, and how well the choreography suits the team's age and skill level.",
      },
      {
        name: "Creativity",
        desc: "Originality and uniqueness in concept, movement vocabulary, and artistic expression. Does the performance feel fresh, imaginative, and distinctly theirs?",
      },
      {
        name: "Stage Presence",
        desc: "Confidence, charisma, and the ability to command the stage. Judges assess whether performers own their space and hold the audience's attention from start to finish.",
      },
      {
        name: "Energy & Engagement",
        desc: "Enthusiasm, consistent performance energy, and genuine connection with the audience. High-energy moments should feel authentic, not forced.",
      },
      {
        name: "Overall Impact",
        desc: "The total impression left on the judges — storytelling, synchronization, performance polish, and the lasting feeling after the performance ends.",
      },
    ],
  },
  {
    title: "Sr Kids",
    subtitle: "Ages 13–17 · 5 scoring parameters · Max 25 pts",
    color: "fuchsia",
    criteria: [
      {
        name: "Choreography",
        desc: "Creative arrangement of movements, transitions, formations, and patterns. Judges expect more complexity and intentionality at this age group.",
      },
      {
        name: "Creativity",
        desc: "Originality and uniqueness in concept, movement vocabulary, and artistic expression. The performance should feel distinctly conceived, not imitative.",
      },
      {
        name: "Stage Presence",
        desc: "Confidence, charisma, and the ability to command the stage. At this level, judges look for individual personality shining through group performance.",
      },
      {
        name: "Energy & Engagement",
        desc: "Sustained performance energy and connection with the audience. Judges watch for consistency — energy should not dip in the middle sections.",
      },
      {
        name: "Overall Impact",
        desc: "The total impression left on the judges — storytelling, synchronization, performance polish, and the lasting feeling after the performance ends.",
      },
    ],
  },
  {
    title: "Adult",
    subtitle: "Ages 18+ · 9 scoring parameters · Max 45 pts",
    color: "amber",
    criteria: [
      {
        name: "Stage Presence",
        desc: "Confidence and command of the stage throughout the entire performance. Judges assess natural charisma, spatial awareness, and the ability to draw eyes without forcing attention.",
      },
      {
        name: "Precision",
        desc: "Technical accuracy, rhythmic timing, and synchronized execution within the group. Clean lines, sharp transitions, and unison movement are key markers.",
      },
      {
        name: "Connect",
        desc: "Emotional connection between performers and with the audience. Judges look for chemistry within the group, eye contact, and moments that feel human and real.",
      },
      {
        name: "Choreo",
        desc: "Complexity, flow, and quality of the choreographic composition. Adult teams are expected to show layered structure, creative formations, and purposeful movement design.",
      },
      {
        name: "Creativity",
        desc: "Originality in concept selection, movement choices, and overall artistic vision. The performance should offer something surprising or distinctive.",
      },
      {
        name: "Expression",
        desc: "Facial expression, emotional depth, and storytelling through movement. Every dancer on stage should be performing — not just executing steps.",
      },
      {
        name: "Theme",
        desc: "Coherence, clarity, and quality of execution of the chosen theme or narrative. Costume, music, and movement should reinforce a single unified idea.",
      },
      {
        name: "Technique",
        desc: "Dance skill, body alignment, posture, extension, and technical proficiency. Judges evaluate the quality of fundamental dance execution across the whole team.",
      },
      {
        name: "Props",
        desc: "Effective, creative, and seamless integration of props into the performance. Props should enhance the story — not distract from or substitute for dance quality.",
      },
    ],
  },
];

function Section({
  section,
}: {
  section: (typeof SECTIONS)[number];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const isFuchsia = section.color === "fuchsia";

  return (
    <div className="mb-8">
      <div className={`rounded-2xl border px-5 py-4 mb-3 ${isFuchsia ? "border-fuchsia-500/20 bg-fuchsia-500/5" : "border-amber-400/20 bg-amber-400/5"}`}>
        <h2 className={`text-lg font-bold ${isFuchsia ? "text-fuchsia-300" : "text-amber-300"}`}>{section.title}</h2>
        <p className="text-white/40 text-xs mt-0.5">{section.subtitle}</p>
      </div>

      <div className="space-y-2">
        {section.criteria.map((c) => {
          const isOpen = open === c.name;
          return (
            <div
              key={c.name}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen ? "border-white/20 bg-white/8" : "border-white/8 bg-white/3 hover:bg-white/6"
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpen(isOpen ? null : c.name)}
              >
                <span className={`font-semibold text-sm ${isOpen ? (isFuchsia ? "text-fuchsia-300" : "text-amber-300") : "text-white/80"}`}>
                  {c.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/8 pt-3">
                  {c.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JudgingParametersPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/judge" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Judging Parameters</h1>
          <p className="text-white/40 text-sm">MANCH 2026 · Tap any criterion to expand</p>
        </div>
      </div>

      {SECTIONS.map((s) => (
        <Section key={s.title} section={s} />
      ))}
    </div>
  );
}
