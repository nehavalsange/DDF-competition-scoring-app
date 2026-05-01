"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

type Criterion = { name: string; desc: string };

type Category = {
  number: number;
  title: string;
  description: string;
  criteria: Criterion[];
  color: "fuchsia" | "amber";
};

const CATEGORIES: Category[] = [
  {
    number: 1,
    title: "Best Overall Performance – Junior Kids Division",
    description:
      "Awarded to the junior group that delivers the most well-rounded and engaging performance, demonstrating a strong blend of choreography, creativity, and performance confidence appropriate to their age group.",
    color: "fuchsia",
    criteria: [
      { name: "Choreography", desc: "Age-appropriate, well-structured routines with clear formations and transitions." },
      { name: "Creativity", desc: "Originality in movement, concept, and storytelling." },
      { name: "Stage Presence", desc: "Confidence, enthusiasm, and awareness of the audience." },
      { name: "Energy & Engagement", desc: "Consistent energy throughout the performance and commitment to movements." },
      { name: "Overall Impact", desc: "Cohesiveness, execution, and ability to leave a lasting impression." },
    ],
  },
  {
    number: 2,
    title: "Best Overall Performance – Senior Kids Division (Tweens–Teens)",
    description:
      "Recognizes the senior group that showcases excellence across all performance aspects, demonstrating maturity, polish, and strong artistic intent.",
    color: "fuchsia",
    criteria: [
      { name: "Choreography", desc: "Complexity, structure, and musical alignment." },
      { name: "Creativity", desc: "Innovative ideas, interpretation, and originality." },
      { name: "Stage Presence", desc: "Confidence, command of the stage, and performer charisma." },
      { name: "Energy & Engagement", desc: "Control of intensity, variation, and stamina throughout the piece." },
      { name: "Overall Performance Quality", desc: "Precision, cohesion, and artistic excellence as a group." },
    ],
  },
  {
    number: 3,
    title: "Best Stage Presence – Group",
    description:
      "Presented to the group that most effectively commands the stage and captivates the audience through confident movement, energy, and strong spatial awareness.",
    color: "amber",
    criteria: [
      { name: "Usage of Stage Space", desc: "Effective formations, transitions, and full use of the performance area." },
      { name: "Energy on Stage", desc: "Projection, enthusiasm, and sustained performance quality." },
      { name: "Choice of Music", desc: "Strong alignment between music selection and stage performance." },
      { name: "Audience Connection", desc: "Engagement through expressions, confidence, and visual impact." },
      { name: "Group Unity", desc: "Synchronized presence and collective stage confidence." },
    ],
  },
  {
    number: 4,
    title: "Most Expressive Performance – Group",
    description:
      "Awarded to the group that best conveys emotion, theme, or narrative through expressive movement, facial expressions, and artistic interpretation.",
    color: "amber",
    criteria: [
      { name: "Theme Expression", desc: "Clear communication of the story or concept." },
      { name: "Emotional Connection", desc: "Authentic expressions and emotional depth." },
      { name: "Choreographic Interpretation", desc: "Movements that enhance the mood and message." },
      { name: "Creativity", desc: "Unique and meaningful presentation of the theme." },
      { name: "Consistency", desc: "Expression maintained throughout the performance by all dancers." },
    ],
  },
  {
    number: 5,
    title: "Technique Excellence Award – Group",
    description:
      "Recognizes the group that demonstrates superior technical skill, precision, and disciplined execution while performing cohesively as a unit.",
    color: "amber",
    criteria: [
      { name: "Technical Precision", desc: "Accuracy of movements, timing, posture, and alignment." },
      { name: "Choreographic Complexity", desc: "Challenges successfully executed." },
      { name: "Synchronization", desc: "Uniform execution and group coordination." },
      { name: "Theme Relevance", desc: "Technique supports and enhances the theme." },
      { name: "Group Delivery", desc: "Consistency and polish across all performers." },
    ],
  },
  {
    number: 6,
    title: "Best Choreography – Group",
    description:
      "Awarded to the group with the most outstanding and original choreography, showcasing creativity, thoughtful design, and effective execution.",
    color: "amber",
    criteria: [
      { name: "Originality", desc: "Innovative movement vocabulary and creative structure." },
      { name: "Theme Relevance", desc: "Clear alignment with the idea or concept presented." },
      { name: "Execution", desc: "Precision and clarity in bringing the choreography to life." },
      { name: "Creativity & Design", desc: "Effective use of formations, transitions, dynamics, and levels." },
      { name: "Use of Props & Stage Presence", desc: "Purposeful and impactful integration (where applicable)." },
    ],
  },
];

function CategoryCard({ cat }: { cat: Category }) {
  const [isOpen, setIsOpen] = useState(false);
  const isFuchsia = cat.color === "fuchsia";

  return (
    <div className="mb-3">
      <button
        className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200 ${
          isOpen
            ? isFuchsia
              ? "border-fuchsia-500/40 bg-fuchsia-500/12"
              : "border-amber-400/40 bg-amber-400/12"
            : "border-white/10 bg-white/4 hover:bg-white/7"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl font-black leading-none flex-shrink-0 ${isFuchsia ? "text-fuchsia-400" : "text-amber-400"}`}>
            {cat.number}.
          </span>
          <span className="text-white font-semibold text-sm flex-1 text-left leading-snug">
            {cat.title}
          </span>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className={`mt-1.5 rounded-xl border px-4 py-4 ${
          isFuchsia ? "border-fuchsia-500/20 bg-fuchsia-500/6" : "border-amber-400/20 bg-amber-400/6"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isFuchsia ? "text-fuchsia-400" : "text-amber-400"}`}>
            Description
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-4">{cat.description}</p>

          <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${isFuchsia ? "text-fuchsia-400" : "text-amber-400"}`}>
            Judging Parameters
          </p>
          <ul className="space-y-2.5">
            {cat.criteria.map((c) => (
              <li key={c.name} className="flex gap-2.5">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isFuchsia ? "bg-fuchsia-400" : "bg-amber-400"}`} />
                <div>
                  <span className="text-white text-sm font-medium">{c.name}</span>
                  <span className="text-white/50 text-sm"> — {c.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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
          <p className="text-white/40 text-sm">MANCH 2026 · Tap any category to expand</p>
        </div>
      </div>

      {CATEGORIES.map((cat) => (
        <CategoryCard key={cat.number} cat={cat} />
      ))}
    </div>
  );
}
