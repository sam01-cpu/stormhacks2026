"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { chords, getChord, whiteNotes } from "@/lib/music";
import { useStudio } from "./studio-provider";
import { useLoopPlayback } from "./use-loop-playback";
import { Piano } from "./piano";
import { ChordFeedback } from "./chord-feedback";

type Stage = "keys" | "chords" | "loop";
const steps: { id: Stage; label: string; href: string }[] = [
  { id: "keys", label: "Learn the keys", href: "/" },
  { id: "chords", label: "Build a progression", href: "/chords" },
  { id: "loop", label: "Make a loop", href: "/loop" },
];
const copy = {
  keys: { title: "It starts with a note.", intro: "Play a key. Hear a note. Your first bit of music theory is already under your fingers." },
  chords: { title: "Find your chord sequence.", intro: "A chord is a few notes played together. Pick a chord for each bar to build a four-part sequence." },
  loop: { title: "Turn it into a loop.", intro: "Hear your four chords repeat. Change the tempo and play the piano over your loop." },
};

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>;
}

function PlayIcon({ stop = false }: { stop?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">{stop ? <rect x="5" y="5" width="10" height="10" rx="1" /> : <path d="M6 3.5 16 10 6 16.5Z" />}</svg>;
}

function KeysLesson() {
  const { setSelectedNotes, hear } = useStudio();
  return (
    <div className="keys-lesson">
      <ChordFeedback />
      <button className="secondary-button" onClick={() => { setSelectedNotes(["C", "E", "G"]); void hear(["C", "E", "G"]); }}><PlayIcon />Try C + E + G</button>
    </div>
  );
}

function ProgressionBuilder() {
  const { progression, setProgression, setSelectedNotes, hear } = useStudio();
  return (
    <section className="progression-section" aria-labelledby="progression-title">
      <div className="section-heading"><h2 id="progression-title">Your progression</h2><span>4 bars · C major</span></div>
      <div className="bar-list">
        {progression.map((id, index) => {
          const chord = getChord(id);
          return (
            <div className="bar-card" key={index}>
              <label htmlFor={`bar-${index}`} className="eyebrow">BAR 0{index + 1}</label>
              <select id={`bar-${index}`} value={id} onChange={(event) => {
                const next = getChord(event.target.value);
                setProgression(progression.map((old, bar) => bar === index ? next.id : old));
                setSelectedNotes(next.notes);
                void hear(next.notes);
              }}>{chords.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
              <div className="bar-bottom"><span>{chord.notes.join(" · ")}</span><button className="audition-button" aria-label={`Hear bar ${index + 1}: ${chord.name}`} onClick={() => { setSelectedNotes(chord.notes); void hear(chord.notes); }}><PlayIcon /></button></div>
            </div>
          );
        })}
      </div>
      <details className="theory-details"><summary>Why do these chords fit together?</summary><p>Every chord here uses only the white-key notes in C major. That shared set of notes helps them sound connected. A bar is a group of four beats; each chord gets one bar.</p>{progression.map((id, index) => <p key={index}><strong>Bar {index + 1} · {getChord(id).name}.</strong> {getChord(id).feeling}</p>)}</details>
    </section>
  );
}

function PianoRoll({ playing, position }: { playing: boolean; position: number }) {
  const { progression } = useStudio();
  const rows = [...whiteNotes].reverse();
  return (
    <div className="piano-roll" role="img" aria-label={`Piano roll: ${progression.map((id) => getChord(id).name).join(", ")}. Each chord lasts one bar.`}>
      <div className="pitch-labels" aria-hidden="true">{rows.map((note) => <span key={note}>{note}</span>)}</div>
      <div className="roll-grid" aria-hidden="true">
        {progression.map((id, index) => <div className={`roll-column${playing && Math.floor(position) === index ? " is-playing" : ""}`} key={index}><span className="roll-bar-name">0{index + 1} <strong>{id}</strong></span>{getChord(id).notes.map((note) => <span key={note} className="roll-note" style={{ "--row": rows.indexOf(note) } as CSSProperties}>{note}</span>)}</div>)}
        {playing && <span className="playhead" style={{ left: `${position * 25}%` }} />}
      </div>
    </div>
  );
}

export function MusicStudio({ stage }: { stage: Stage }) {
  const stepIndex = steps.findIndex((step) => step.id === stage);
  const { tempo, setTempo, progression, error } = useStudio();
  const { playing, starting, position, toggle } = useLoopPlayback();
  const activeNotes = playing ? getChord(progression[Math.floor(position)]).notes : [];

  return (
    <div className="app-shell">
      <header className="topbar"><Link className="brand" href="/" aria-label="MusicCraft home"><BrandMark /><span>music<span>craft</span></span></Link><span className="session-label">Your first loop</span></header>
      <main className={`studio stage-${stage}`}>
        <nav className="step-nav" aria-label="Learning steps">{steps.map((step, index) => <Link key={step.id} href={step.href} className={`step-link${stage === step.id ? " is-current" : ""}`} aria-current={stage === step.id ? "step" : undefined}><span className="step-number">0{index + 1}</span><span>{step.label}</span></Link>)}</nav>
        <div className="stage-content" key={stage}>
          <div className="stage-heading"><span className="eyebrow">STEP 0{stepIndex + 1} / 03</span><h1>{copy[stage].title}</h1><p>{copy[stage].intro}</p></div>
          <Piano activeNotes={activeNotes} />
          {error && <p className="audio-error" role="alert">{error}</p>}
          {stage === "keys" && <KeysLesson />}
          {stage === "chords" && <ProgressionBuilder />}
          {stage === "loop" && <section className="loop-section" aria-labelledby="loop-title">
            <div className="section-heading"><h2 id="loop-title">Your loop</h2><Link className="text-link" href="/chords">Edit chords ↗</Link></div>
            <PianoRoll playing={playing} position={position} />
            <div className="transport"><button className="primary-button" disabled={starting} onClick={() => void toggle()}><PlayIcon stop={playing} />{starting ? "Starting…" : playing ? "Stop loop" : "Play loop"}</button><label className="tempo-control" htmlFor="tempo"><span>Tempo <strong>{tempo}</strong> BPM</span><input id="tempo" type="range" min="50" max="160" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} /></label><span className="beat-readout">{playing ? `Bar ${Math.floor(position) + 1} · Beat ${Math.floor((position % 1) * 4) + 1}` : "4 bars · Ready"}</span></div>
            <p className="loop-hint">Each block is a note. Stacked notes play together; left to right is time.</p>
          </section>}
          <footer className="stage-navigation">{stepIndex > 0 ? <Link className="back-link" href={steps[stepIndex - 1].href}>← {stepIndex === 1 ? "Learn the keys" : "Build a progression"}</Link> : <span className="footer-hint">No rules to memorize. Just start playing.</span>}{stepIndex < 2 ? <Link className="primary-button" href={steps[stepIndex + 1].href}>{stepIndex === 0 ? "Build a progression" : "Make it loop"}<span aria-hidden="true">→</span></Link> : <span className="footer-hint">You made music. Keep experimenting.</span>}</footer>
        </div>
      </main>
    </div>
  );
}
