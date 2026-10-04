"use client";

import Link from "next/link";
import Image from "next/image";
import { chords, getChord } from "@/lib/music";
import { useStudio } from "./studio-provider";
import { useLoopPlayback } from "./use-loop-playback";
import { Piano } from "./piano";
import { ChordFeedback } from "./chord-feedback";
import { GuidedLesson } from "./guided-lesson";
import { LoopExplanation } from "./loop-explanation";
import { PianoRoll } from "./piano-roll";

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

function BrandLogo() {
  return (
    <>
      <span className="brand-symbol" aria-hidden="true"><Image src="/musiccraft-logo.png" alt="" width={2000} height={2000} loading="eager" unoptimized /></span>
      <span className="brand-wordmark" aria-hidden="true"><Image src="/musiccraft-logo.png" alt="" width={2000} height={2000} loading="eager" unoptimized /></span>
    </>
  );
}

function PlayIcon({ stop = false }: { stop?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">{stop ? <rect x="5" y="5" width="10" height="10" rx="1" /> : <path d="M6 3.5 16 10 6 16.5Z" />}</svg>;
}

function KeysLesson() {
  const { setSelectedNotes, hear, guideStep } = useStudio();
  return (
    <div className="keys-lesson">
      <ChordFeedback />
      <button className="secondary-button" onClick={() => { setSelectedNotes(guideStep === 1 ? [] : ["C", "E", "G"]); void hear(["C", "E", "G"]); }}><PlayIcon />Hear C major</button>
    </div>
  );
}

function ProgressionBuilder() {
  const { progression, setProgression, setSelectedNotes, hear, advanceGuide } = useStudio();
  return (
    <section className="progression-section" aria-labelledby="progression-title">
      <div className="section-heading"><h2 id="progression-title">Your progression</h2><span>4 bars · C major</span></div>
      <p className="builder-hint">Every chord here uses C D E F G A B. Choose one to hear its notes, or press Hear again.</p>
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
                advanceGuide(4);
              }}>{chords.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
              <div className="bar-bottom"><span className="bar-note-summary"><small>Notes</small><span>{chord.notes.join(" · ")}</span></span><button type="button" className="audition-button" aria-label={`Hear bar ${index + 1}: ${chord.name}`} onClick={() => { setSelectedNotes(chord.notes); void hear(chord.notes); }}><PlayIcon /><span>Hear</span></button></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MusicStudio({ stage }: { stage: Stage }) {
  const stepIndex = steps.findIndex((step) => step.id === stage);
  const { tempo, setTempo, error } = useStudio();
  const { playing, starting, position, start, stop, activeNotes, appliedTempo } = useLoopPlayback();

  return (
    <div className="app-shell">
      <header className="topbar"><Link className="brand" href="/" aria-label="MusicCraft home"><BrandLogo /></Link></header>
      <main className={`studio stage-${stage}`}>
        <nav className="step-nav" aria-label="Learning steps">{steps.map((step, index) => <Link key={step.id} href={step.href} className={`step-link${stage === step.id ? " is-current" : ""}`} aria-current={stage === step.id ? "step" : undefined}><span className="step-number">0{index + 1}</span><span>{step.label}</span></Link>)}</nav>
        <div className="stage-content" key={stage}>
          <div className="stage-heading"><span className="eyebrow">STEP 0{stepIndex + 1} / 03</span><h1>{copy[stage].title}</h1></div>
          <GuidedLesson stage={stage} playing={playing} />
          <div className="music-workspace">
            <div className="piano-workspace"><Piano activeNotes={activeNotes} />{error && <p className="audio-error" role="alert">{error}</p>}</div>
            {stage === "keys" && <KeysLesson />}
            {stage === "chords" && <ProgressionBuilder />}
            {stage === "loop" && <section className="loop-section" aria-labelledby="loop-title">
              <div className="section-heading"><h2 id="loop-title">Your loop</h2><Link className="text-link" href="/chords">Edit chords ↗</Link></div>
              <div className={`transport${playing ? " is-playing" : ""}`}><button type="button" className="primary-button" disabled={starting || playing} onClick={() => void start()}><PlayIcon />{starting ? "Starting…" : "Play Loop"}</button><button type="button" className="secondary-button" disabled={!playing && !starting} onClick={stop}><PlayIcon stop />Stop</button><label className="tempo-control" htmlFor="tempo"><span>Tempo <strong>{tempo}</strong> BPM</span><input id="tempo" type="range" min="50" max="160" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} /><small>{playing && appliedTempo !== tempo ? "Applies at the next bar" : "4/4 · Four beats per bar"}</small></label><span className="beat-readout">{playing ? `Bar ${Math.floor(position) + 1} · Beat ${Math.floor((position % 1) * 4) + 1}` : "4 bars · Ready"}</span></div>
              <PianoRoll playing={playing} position={position} editable />
              <p className="loop-hint">Change a chord above to hear it the next time that bar plays.</p>
              <LoopExplanation activeBar={playing ? Math.floor(position) : null} />
            </section>}
          </div>
          <footer className="stage-navigation">{stepIndex > 0 ? <Link className="back-link" href={steps[stepIndex - 1].href}>← {stepIndex === 1 ? "Learn the keys" : "Build a progression"}</Link> : <span className="footer-hint">No rules to memorize. Just start playing.</span>}{stepIndex < 2 ? <Link className="primary-button" href={steps[stepIndex + 1].href}>{stepIndex === 0 ? "Build a progression" : "Make it loop"}<span aria-hidden="true">→</span></Link> : <span className="footer-hint">You made music. Keep experimenting.</span>}</footer>
        </div>
      </main>
    </div>
  );
}
