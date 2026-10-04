"use client";

import { useId } from "react";
import { explainProgression } from "@/lib/music";
import { useStudio } from "./studio-provider";

export function LoopExplanation({ activeBar = null }: { activeBar?: number | null }) {
  const { progression, setSelectedNotes, hear } = useStudio();
  const titleId = useId();
  const explanation = explainProgression(progression);
  if (!explanation) return null;

  return (
    <details className="loop-explanation">
      <summary>
        <span className="explain-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 16 12 8l7 8" stroke="currentColor" strokeWidth="1.5" /><circle cx="5" cy="16" r="2.5" fill="currentColor" /><circle cx="12" cy="8" r="2.5" fill="currentColor" /><circle cx="19" cy="16" r="2.5" fill="currentColor" /></svg></span>
        <span className="explain-title" id={titleId}>Explain my loop</span>
        <span className="explain-context">C major · 4 bars</span>
        <svg className="explain-chevron" aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.5" /></svg>
      </summary>
      <section className="explain-content" aria-labelledby={titleId}>
        <div className="explain-overview" role="status" aria-atomic="true">
          <span className="eyebrow">ONE NOTE FAMILY · YOUR OWN DIRECTION</span>
          <h3>{explanation.chordSequence}</h3>
          <p>{explanation.familyExplanation}</p>
        </div>
        <ol className="explain-journey">
          {explanation.bars.map((chord, index) => (
            <li className={`explain-bar${activeBar === index ? " is-playing" : ""}`} key={index} aria-current={activeBar === index ? "true" : undefined}>
              <button type="button" className="explain-chord" aria-label={`Hear bar ${index + 1}: ${chord.name}`} onClick={() => { setSelectedNotes(chord.notes); void hear(chord.notes); }}>
                <span className="explain-bar-number">BAR 0{index + 1}<span className="explain-hear"><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5 16 10 6 16.5Z" /></svg>Hear</span></span>
                <span className="explain-chord-name">{chord.id}<small>{chord.numeral}</small></span>
                <span className="explain-notes">{chord.notes.join(" · ")}</span>
              </button>
              <strong className="explain-role">{chord.role}</strong>
              <p>{chord.feeling}</p>
            </li>
          ))}
        </ol>
        <div className="explain-return"><span aria-hidden="true">↺</span><div><span className="eyebrow">WHEN IT COMES AROUND</span><p>{explanation.returnExplanation}</p></div></div>
        <div className="explain-numerals">
          <span className="eyebrow">THE SAME LOOP, IN ROMAN NUMERALS</span>
          <p className="numeral-sequence" aria-label={`Roman numerals: ${explanation.numeralSequence}`}>{explanation.numeralSequence}</p>
          <p>These symbols number a chord’s starting note in C D E F G A B.</p>
          <p className="numeral-guide">{explanation.numeralGuide}</p>
          <p>Uppercase means major; lowercase means minor.{explanation.bars.some((chord) => chord.id === "Bdim") && " The ° symbol means diminished: a tense-sounding chord."}</p>
        </div>
        <p className="explain-listening-tip">Feelings are personal; rhythm and how you play can change what you hear. Try changing a chord above and listen for the difference.</p>
      </section>
    </details>
  );
}
