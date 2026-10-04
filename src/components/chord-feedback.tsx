"use client";

import { Fragment } from "react";
import { recognizeChord } from "@/lib/music";
import { useStudio } from "./studio-provider";

export function ChordFeedback() {
  const { selectedNotes } = useStudio();
  const chord = recognizeChord(selectedNotes);

  return (
    <div className="note-feedback" role="status" aria-atomic="true">
      <span className="eyebrow">{chord ? "YOU FOUND A CHORD" : selectedNotes.length ? "YOUR NOTES" : "YOUR TURN"}</span>
      <strong>{chord?.name ?? (selectedNotes.length ? selectedNotes.join(" · ") : "Pick any key")}</strong>
      {chord && (
        <div className="chord-recipe" aria-label={`${chord.notes.join(" + ")} makes ${chord.name}; ${chord.root} is the root.`}>
          {chord.notes.map((note, index) => (
            <Fragment key={note}>
              {index > 0 && <span className="chord-operator" aria-hidden="true">+</span>}
              <span className={`chord-note${note === chord.root ? " is-root" : ""}`}><b>{note}</b><small>{note === chord.root ? "Root" : "Note"}</small></span>
            </Fragment>
          ))}
          <span className="chord-operator" aria-hidden="true">→</span>
          <span className="chord-result">{chord.name}</span>
        </div>
      )}
      <p>{chord?.explanation ?? (selectedNotes.length === 3
        ? "These notes don’t form a major, minor, or diminished chord; clear them and try C + E + G."
        : selectedNotes.length > 3
          ? "Start with just three notes to find a chord; clear them and try C + E + G."
          : "Try C + E + G together: three notes can make one chord.")}</p>
    </div>
  );
}
