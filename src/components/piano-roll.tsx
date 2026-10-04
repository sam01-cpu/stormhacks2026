"use client";

import { useId } from "react";
import { chords, getChord, pitchNames } from "@/lib/music";
import { useStudio } from "./studio-provider";

const rows = [...pitchNames].reverse();

export function PianoRoll({ playing = false, position = 0, editable = false }: { playing?: boolean; position?: number; editable?: boolean }) {
  const { progression, setProgression } = useStudio();
  const titleId = useId();
  const captionId = useId();

  return (
    <figure className="roll-view" aria-labelledby={titleId} aria-describedby={captionId}>
      <div className="roll-heading"><h3 id={titleId}>Your chords as notes</h3><span>Piano roll · C4–B4</span></div>
      <div className="roll-axis-hints" aria-hidden="true"><span>Pitch ↑ Higher notes</span><span>Time → Four bars</span></div>
      <div className="piano-roll" role="group" aria-label="Four-bar piano roll. Higher notes are higher up; time moves from left to right.">
        <div className="pitch-labels" aria-hidden="true">{rows.map((note) => <span className={note.includes("#") ? "is-black" : undefined} key={note}>{note}4</span>)}</div>
        <div className="roll-grid">
          {progression.map((id, index) => {
            const chord = getChord(id);
            const current = playing && Math.floor(position) === index;
            return (
              <div className={`roll-column${current ? " is-playing" : ""}`} key={index} role="group" aria-label={`Bar ${index + 1}: ${chord.name}. Notes ${chord.notes.map((note) => `${note}4`).join(", ")}, held for four beats.`} aria-current={current ? "true" : undefined}>
                <div className="roll-bar-name">
                  <span>BAR 0{index + 1}</span>
                  {editable ? <select className="roll-chord-select" aria-label={`Chord for bar ${index + 1}`} title={chord.name} value={id} onChange={(event) => setProgression(progression.map((old, bar) => bar === index ? event.target.value : old))}>{chords.map((option) => <option key={option.id} value={option.id} aria-label={option.name}>{option.id}</option>)}</select> : <strong>{chord.id}</strong>}
                </div>
                <div className="roll-notes" aria-hidden="true">{rows.map((note) => <div className={`roll-lane${note.includes("#") ? " is-black" : ""}`} key={note}>{chord.notes.includes(note) && <span className="roll-note" title={`${note}4 · ${chord.name} · Bar ${index + 1} · Four beats`}>{note}4</span>}</div>)}</div>
              </div>
            );
          })}
          {playing && <span className="playhead" aria-hidden="true" style={{ left: `${position * 25}%` }} />}
        </div>
      </div>
      <div className="roll-beat-ruler" aria-hidden="true"><span>Beat</span><div>{progression.flatMap((_, bar) => [1, 2, 3, 4].map((beat) => <span key={`${bar}-${beat}`}>{beat}</span>))}</div></div>
      <figcaption id={captionId}>Stacked blocks play together as a chord. Each block lasts one bar (four beats), like sustained notes in FL Studio, Ableton or Logic.</figcaption>
    </figure>
  );
}
