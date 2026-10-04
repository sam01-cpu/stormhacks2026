export const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
export const blackNotes = [
  { note: "C#", after: 0 },
  { note: "D#", after: 1 },
  { note: "F#", after: 3 },
  { note: "G#", after: 4 },
  { note: "A#", after: 5 },
];

export const chords = [
  { id: "C", name: "C major", notes: ["C", "E", "G"], degree: 1, numeral: "I", role: "Home", feeling: "C can feel like home: a settled place to land." },
  { id: "Dm", name: "D minor", notes: ["D", "F", "A"], degree: 2, numeral: "ii", role: "Anticipation", feeling: "Dm can bring a softer mood and gently build anticipation." },
  { id: "Em", name: "E minor", notes: ["E", "G", "B"], degree: 3, numeral: "iii", role: "Reflection", feeling: "Em can feel reflective; it shares E and G with the home chord." },
  { id: "F", name: "F major", notes: ["F", "A", "C"], degree: 4, numeral: "IV", role: "Away from home", feeling: "F can open things up and move the progression away from home." },
  { id: "G", name: "G major", notes: ["G", "B", "D"], degree: 5, numeral: "V", role: "Tension", feeling: "G often builds tension that strongly wants to return to C." },
  { id: "Am", name: "A minor", notes: ["A", "C", "E"], degree: 6, numeral: "vi", role: "A minor feeling", feeling: "Am can add a more emotional, minor feeling; it shares C and E with the home chord." },
  { id: "Bdim", name: "B diminished", notes: ["B", "D", "F"], degree: 7, numeral: "vii°", role: "More tension", feeling: "Bdim can feel especially tense, making C sound like a place to land." },
];

export function getChord(id: string) {
  return chords.find((chord) => chord.id === id) ?? chords[0];
}

export function explainProgression(progression: readonly string[]) {
  // This lesson only covers four bars from the C-major chord family.
  // Unlike playback's fallback, unknown chords must not get a made-up explanation.
  if (progression.length !== 4 || progression.some((id) => !chords.some((chord) => chord.id === id))) return null;
  const bars = progression.map(getChord);
  const first = bars[0];
  const last = bars[3];
  let returnExplanation = `${last.id} → ${first.id}: your last chord leads back to the first, making a repeating four-bar pattern.`;

  if (bars.every((chord) => chord.id === first.id)) {
    returnExplanation = `All four bars use ${first.id}. Try changing one bar to hear a new direction.`;
  } else if (last.id === first.id) {
    returnExplanation = `${last.id} repeats across the loop boundary, so the restart can feel seamless.`;
  } else if ((last.id === "G" || last.id === "Bdim") && first.id === "C") {
    returnExplanation = `${last.id} → C: the tension at the end can settle into home when the loop repeats.`;
  } else if (last.id === "G" && first.id === "Am") {
    returnExplanation = "G → Am: the loop returns to a softer minor sound instead of landing on C.";
  } else if (first.id === "C") {
    returnExplanation = `${last.id} → C: the restart brings you back to the home chord.`;
  }

  return {
    bars,
    chordSequence: bars.map((chord) => chord.id).join(" → "),
    numeralSequence: bars.map((chord) => chord.numeral).join(" → "),
    numeralGuide: [...new Set(bars.map((chord) => `${chord.numeral} = ${chord.degree} (${chord.notes[0]})`))].join(" · "),
    familyExplanation: "These chords belong to C major: every note comes from C D E F G A B.",
    returnExplanation,
  };
}

export const pitchNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
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
