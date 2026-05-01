"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

type Criterion = { name: string; desc: string };

type Award = {
  title: string;
  description: string;
  criteria: Criterion[];
};

type Division = {
  label: string;
  color: "fuchsia" | "amber";
  awards: Award[];
};

const DIVISIONS: Division[] = [
  {
    label: "Junior Kids Division",
    color: "fuchsia",
    awards: [
      {
        title: "Best Overall Performance – Junior Kids Division",
        description:
          "Awarded to the junior group that delivers the most well-rounded and engaging performance, demonstrating a strong blend of choreography, creativity, and performance confidence appropriate to their age group.",
        criteria: [
          { name: "Choreography", desc: "Age-appropriate, well-structured routines with clear formations and transitions." },
          { name: "Creativity", desc: "Originality in movement, concept, and storytelling." },
          { name: "Stage Presence", desc: "Confidence, enthusiasm, and awareness of the audience." },
          { name: "Energy & Engagement", desc: "Consistent energy throughout the performance and commitment to movements." },
          { name: "Overall Impact", desc: "Cohesiveness, execution, and ability to leave a lasting impression." },
        ],
      },
    ],
  },
  {
    label: "Senior Kids Division (Tweens–Teens)",
    color: "fuchsia",
    awards: [
      {
        title: "Best Overall Performance – Senior Kids Division",
        description:
          "Recognizes the senior group that showcases excellence across all performance aspects, demonstrating maturity, polish, and strong artistic intent.",
        criteria: [
          { name: "Choreography", desc: "Complexity, structure, and musical alignment." },
          { name: "Creativity", desc: "Innovative ideas, interpretation, and originality." },
          { name: "Stage Presence", desc: "Confidence, command of the stage, and performer charisma." },
          { name: "Energy & Engagement", desc: "Control of intensity, variation, and stamina throughout the piece." },
          { name: "Overall Performance Quality", desc: "Precision, cohesion, and artistic excellence as a group." },
        ],
      },
    ],
  },
  {
    label: "Adult Group Division",
    color: "amber",
    awards: [
      {
        title: "Best Stage Presence – Group",
        description:
          "Presented to the group that most effectively commands the stage and captivates the audience through confident movement, energy, and strong spatial awareness.",
        criteria: [
          { name: "Usage of Stage Space", desc: "Effective formations, transitions, and full use of the performance area." },
          { name: "Energy on Stage", desc: "Projection, enthusiasm, and sustained performance quality." },
          { name: "Choice of Music", desc: "Strong alignment between music selection and stage performance." },
          { name: "Audience Connection", desc: "Engagement through expressions, confidence, and visual impact." },
          { name: "Group Unity", desc: "Synchronized presence and collective stage confidence." },
        ],
      },
      {
        title: "Most Expressive Performance – Group",
        description:
          "Awarded to the group that best conveys emotion, theme, or narrative through expressive movement, facial expressions, and artistic interpretation.",
        criteria: [
          { name: "Theme Expression", desc: "Clear communication of the story or concept." },
          { name: "Emotional Connection", desc: "Authentic expressions and emotional depth." },
          { name: "Choreographic Interpretation", desc: "Movements that enhance the mood and message." },
          { name: "Creativity", desc: "Unique and meaningful presentation of the theme." },
          { name: "Consistency", desc: "Expression maintained throughout the performance by all dancers." },
        ],
      },
      {
        title: "Technique Excellence Award – Group",
        description:
          "Recognizes the group that demonstrates superior technical skill, precision, and disciplined execution while performing cohesively as a unit.",
        criteria: [
          { name: "Technical Precision", desc: "Accuracy of movements, timing, posture, and alignment." },
          { name: "Choreographic Complexity", desc: "Challenges successfully executed." },
          { name: "Synchronization", desc: "Uniform execution and group coordination." },
          { name: "Theme Relevance", desc: "Technique supports and enhances the theme." },
          { name: "Group Delivery", desc: "Consistency and polish across all performers." },
        ],
      },
      {
        title: "Best Choreography – Group",
        description:
          "Awarded to the group with the most outstanding and original choreography, showcasing creativity, thoughtful design, and effective execution.",
        criteria: [
          { name: "Originality", desc: "Innovative movement vocabulary and creative structure." },
          { name: "Theme Relevance", desc: "Clear alignment with the idea or concept presented." },
          { name: "Execution", desc: "Precision and clarity in bringing the choreography to life." },
          { name: "Creativity & Design", desc: "Effective use of formations, transitions, dynamics, and levels." },
          { name: "Use of Props & Stage Presence", desc: "Purposeful and impactful integration (where applicable)." },
        ],
      },
    ],
  },
];

function AwardCard({ award, color }: { award: Award; color: "fuchsia" | "amber" }) {
  const [openCriterion, setOpenCriterion] = useState<string | null>(null);
  const isFuchsia = color === "fuchsia";
  const accent = isFuchsia ? "fuchsia" : "amber";

  return (
    <div className="mb-6">
      <div className={`rounded-xl border px-4 py-3 mb-3 ${isFuchsia ? "border-fuchsia-500/20 bg-fuchsia-500/5" : "border-amber-400/20 bg-amber-400/5"}`}>
        <h3 className={`font-semibold text-sm ${isFuchsia ? "text-fuchsia-200" : "text-amber-200"}`}>{award.title}</h3>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">{award.description}</p>
      </div>

      <div className="space-y-1.5 pl-2">
        {award.criteria.map((c) => {
          const isOpen = openCriterion === c.name;
          return (
            <div
              key={c.name}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen ? "border-white/20 bg-white/8" : "border-white/8 bg-white/3 hover:bg-white/6"
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 text-left gap-3"
                onClick={() => setOpenCriterion(isOpen ? null : c.name)}
              >
                <span className={`font-medium text-sm ${isOpen ? (isFuchsia ? "text-fuchsia-300" : "text-amber-300") : "text-white/75"}`}>
                  {c.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-3 text-white/55 text-sm leading-relaxed border-t border-white/8 pt-2.5">
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
          <p className="text-white/40 text-sm">MANCH 2026 · Tap any criterion to expand its description</p>
        </div>
      </div>

      {DIVISIONS.map((div) => (
        <div key={div.label} className="mb-10">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${
            div.color === "fuchsia"
              ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25"
              : "bg-amber-400/15 text-amber-300 border border-amber-400/25"
          }`}>
            {div.label}
          </div>

          {div.awards.map((award) => (
            <AwardCard key={award.title} award={award} color={div.color} />
          ))}
        </div>
      ))}
    </div>
  );
}
