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

export function recognizeChord(notes: string[]) {
  return chords.find((chord) => notes.length === chord.notes.length && chord.notes.every((note) => notes.includes(note)));
}

export function frequency(note: string) {
  const semitones = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return 440 * 2 ** ((60 + semitones.indexOf(note) - 69) / 12);
}
