export const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
export const blackNotes = [
  { note: "C#", after: 0 },
  { note: "D#", after: 1 },
  { note: "F#", after: 3 },
  { note: "G#", after: 4 },
  { note: "A#", after: 5 },
];

export const chords = [
  { id: "C", name: "C major", notes: ["C", "E", "G"], feeling: "A settled sound. C major feels like home in this key." },
  { id: "Dm", name: "D minor", notes: ["D", "F", "A"], feeling: "A softer sound that adds a little tension." },
  { id: "Em", name: "E minor", notes: ["E", "G", "B"], feeling: "A gentle, reflective sound. It shares two notes with C major." },
  { id: "F", name: "F major", notes: ["F", "A", "C"], feeling: "An open sound that moves away from home." },
  { id: "G", name: "G major", notes: ["G", "B", "D"], feeling: "A sense of anticipation. Try following it with C major to hear it settle." },
  { id: "Am", name: "A minor", notes: ["A", "C", "E"], feeling: "A darker mood, using two of the same notes as C major." },
  { id: "Bdim", name: "B diminished", notes: ["B", "D", "F"], feeling: "An unsettled sound that pulls strongly toward C major." },
];

export function getChord(id: string) {
  return chords.find((chord) => chord.id === id) ?? chords[0];
}

const pitchNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const triadPatterns = [
  { quality: "major", intervals: [0, 4, 7], sound: "bright, settled" },
  { quality: "minor", intervals: [0, 3, 7], sound: "softer, darker" },
  { quality: "diminished", intervals: [0, 3, 6], sound: "tense, unsettled" },
] as const;

export function recognizeChord(notes: string[]) {
  const selected = new Set(notes);
  if (selected.size !== 3 || notes.some((note) => !pitchNames.includes(note))) return undefined;

  for (const [rootIndex, root] of pitchNames.entries()) {
    for (const pattern of triadPatterns) {
      const chordNotes = pattern.intervals.map((interval) => pitchNames[(rootIndex + interval) % 12]);
      if (chordNotes.every((note) => selected.has(note))) {
        return {
          name: `${root} ${pattern.quality}`,
          root,
          quality: pattern.quality,
          notes: chordNotes,
          explanation: `${root} is the root (the note that names the chord), and ${chordNotes[1]} and ${chordNotes[2]} join it to make a ${pattern.sound} sound.`,
        };
      }
    }
  }
  return undefined;
}

export function frequency(note: string) {
  return 440 * 2 ** ((60 + pitchNames.indexOf(note) - 69) / 12);
}
