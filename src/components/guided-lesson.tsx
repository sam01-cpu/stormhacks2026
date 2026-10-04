"use client";

import Link from "next/link";
import { whiteNotes } from "@/lib/music";
import { useStudio } from "./studio-provider";

type Stage = "keys" | "chords" | "loop";
const lessons = [
  { label: "EXPLAIN · A NOTE", explanation: "A note is one sound with a pitch: how high or low it sounds.", task: "Try: press any piano key below." },
  { label: "EXPLAIN · A CHORD", explanation: "A chord is notes played together: C + E + G makes C major.", task: "Hear C major below, then try selecting C, E and G yourself." },
  { label: "EXPLAIN · A KEY", explanation: "A musical key is a family of notes that fit together; C major uses C D E F G A B.", task: "Hear this family, then try any white piano key." },
  { label: "APPLY · YOUR FIRST CHORD", explanation: "Chords use notes from the same family; C major combines C, E and G.", task: "Apply: put C major into bar 1." },
  { label: "TRY · A PROGRESSION", explanation: "A chord progression is a sequence of chords, played one after another.", task: "Try: change a chord in any bar and hear the difference." },
  { label: "HEAR · FOUR BEATS", explanation: "A bar is a group of four beats; each chord in your sequence gets one bar.", task: "Press Play Loop and count 1, 2, 3, 4 before the next chord." },
  { label: "HEAR · THE LOOP", explanation: "Four bars make a 16-beat pattern; going back to bar 1 makes it a repeating loop.", task: "Listen for bar 4 returning to bar 1." },
  { label: "APPLY · MAKE IT YOURS", explanation: "You made a loop from one family of notes.", task: "Try a different chord in your loop and listen when its bar comes around." },
];

export function GuidedLesson({ stage, playing }: { stage: Stage; playing: boolean }) {
  const { guideStep, advanceGuide, progression, setProgression, setSelectedNotes, hear, hearSequence } = useStudio();
  // Direct visits and revisiting a screen keep its guidance relevant without
  // blocking free exploration or resetting what the user has already learned.
  const step = stage === "keys" ? Math.min(guideStep, 3)
    : stage === "chords" ? Math.min(Math.max(guideStep, 3), 5)
      : Math.max(guideStep, 5);
  const lesson = lessons[step];

  function applyChord() {
    setProgression(progression.map((id, bar) => bar === 0 ? "C" : id));
    setSelectedNotes(["C", "E", "G"]);
    void hear(["C", "E", "G"]);
    advanceGuide(3);
  }

  return (
    <section className="guided-lesson" aria-label="Your next music-making step">
      <div className="guide-copy" role="status" aria-atomic="true">
        <span className="eyebrow">{lesson.label}</span>
        <p>{lesson.explanation}</p>
        <span className="guide-task">{step === 5 && stage === "chords" ? "Next: take your four bars to the loop and count the beats." : step === 7 && !playing ? "Press Play Loop, then change a chord in your loop and listen." : lesson.task}</span>
      </div>
      {step === 0 && <button type="button" className="secondary-button" onClick={() => void hear(["C"])}>Hear a C note</button>}
      {step === 2 && <button type="button" className="secondary-button" onClick={() => void hearSequence(whiteNotes)}>Hear C D E F G A B</button>}
      {step === 3 && <Link className="secondary-button" href="/chords" onClick={applyChord}>Put C major in bar 1 <span aria-hidden="true">→</span></Link>}
      {step === 5 && stage === "chords" && <Link className="secondary-button" href="/loop">Hear your four bars <span aria-hidden="true">→</span></Link>}
    </section>
  );
}
