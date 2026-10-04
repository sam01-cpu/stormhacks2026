"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { blackNotes, whiteNotes } from "@/lib/music";
import { useStudio } from "./studio-provider";

const bindings: Record<string, string> = { KeyA: "C", KeyW: "C#", KeyS: "D", KeyE: "D#", KeyD: "E", KeyF: "F", KeyT: "F#", KeyG: "G", KeyY: "G#", KeyH: "A", KeyU: "A#", KeyJ: "B" };
const keyLabels = Object.fromEntries(Object.entries(bindings).map(([code, note]) => [note, code.slice(3)]));

export function Piano({ activeNotes = [] }: { activeNotes?: string[] }) {
  const { selectedNotes, setSelectedNotes, hear, startNote } = useStudio();
  const sources = useRef(new Map<string, string>());
  const heldNotes = useRef(new Map<string, { release?: () => void }>());

  const releaseSource = useCallback((source: string) => {
    const note = sources.current.get(source);
    sources.current.delete(source);
    if (!note || [...sources.current.values()].includes(note)) return;
    heldNotes.current.get(note)?.release?.();
    heldNotes.current.delete(note);
  }, []);

  const releaseAll = useCallback(() => {
    heldNotes.current.forEach((held) => held.release?.());
    heldNotes.current.clear();
    sources.current.clear();
  }, []);

  const hold = useCallback((source: string, note: string) => {
    if (sources.current.has(source)) return;
    sources.current.set(source, note);
    setSelectedNotes([...new Set(sources.current.values())]);
    if (heldNotes.current.has(note)) return;
    const held: { release?: () => void } = {};
    heldNotes.current.set(note, held);
    void startNote(note).then((release) => {
      // A quick release or navigation can happen before the audio context resumes.
      if (heldNotes.current.get(note) === held) held.release = release;
      else release?.();
    });
  }, [setSelectedNotes, startNote]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (target instanceof HTMLElement && !target.closest(".keyboard") && target.closest("input, select, textarea, button, a, summary, [contenteditable]"))) return;
      const note = bindings[event.code];
      if (!note) return;
      event.preventDefault();
      hold(event.code, note);
    }
    function onKeyUp(event: KeyboardEvent) {
      if (sources.current.has(event.code)) {
        event.preventDefault();
        releaseSource(event.code);
      }
    }
    function onVisibility() {
      if (document.hidden) releaseAll();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onVisibility);
      releaseAll();
    };
  }, [hold, releaseSource, releaseAll]);

  function select(note: string) {
    const next = selectedNotes.includes(note) ? selectedNotes.filter((selected) => selected !== note) : [...selectedNotes, note];
    setSelectedNotes(next);
    void hear(next);
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, note: string) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "mouse") select(note);
    else hold(`pointer-${event.pointerId}`, note);
  }

  const selected = (note: string) => selectedNotes.includes(note) || activeNotes.includes(note);
  function keyEvents(note: string) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => onPointerDown(event, note),
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => releaseSource(`pointer-${event.pointerId}`),
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => releaseSource(`pointer-${event.pointerId}`),
      onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => releaseSource(`pointer-${event.pointerId}`),
      // Keep native Enter/Space and assistive-technology activation working.
      onClick: (event: MouseEvent<HTMLButtonElement>) => { if (event.detail === 0) select(note); },
    };
  }

  return (
    <section className="instrument" aria-label="Interactive one-octave piano">
      <div className="instrument-toolbar"><span className="instrument-name"><span className="status-dot" />Piano</span><span className="instrument-range">C4–B4 <span> / </span> One octave</span></div>
      <div className="keyboard">
        <div className="white-keys">{whiteNotes.map((note) => <button type="button" className={`white-key${selected(note) ? " is-selected" : ""}`} key={note} aria-label={`Play ${note}4`} aria-keyshortcuts={keyLabels[note]} aria-pressed={selected(note)} {...keyEvents(note)}><span>{note}</span><kbd>{keyLabels[note]}</kbd></button>)}</div>
        {blackNotes.map(({ note, after }) => <button type="button" className={`black-key${selected(note) ? " is-selected" : ""}`} key={note} style={{ left: `${((after + 1) / 7) * 100}%` }} aria-label={`Play ${note}4`} aria-keyshortcuts={keyLabels[note]} aria-pressed={selected(note)} {...keyEvents(note)}><span>{note}</span><kbd>{keyLabels[note]}</kbd></button>)}
      </div>
      <div className="piano-footer"><span>Click to build a chord. Hold <kbd>A</kbd> + <kbd>D</kbd> + <kbd>G</kbd> for C major.</span><button className="text-button" onClick={() => { releaseAll(); setSelectedNotes([]); void hear([]); }} disabled={!selectedNotes.length}>Clear notes</button></div>
    </section>
  );
}
