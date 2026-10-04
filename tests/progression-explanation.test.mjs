import test from "node:test";
import assert from "node:assert/strict";
import { explainProgression } from "../src/lib/music.ts";

test("explains the demo loop and its return to home", () => {
  const explanation = explainProgression(["C", "Am", "F", "G"]);
  assert.equal(explanation.chordSequence, "C → Am → F → G");
  assert.equal(explanation.numeralSequence, "I → vi → IV → V");
  assert.equal(explanation.numeralGuide, "I = 1 (C) · vi = 6 (A) · IV = 4 (F) · V = 5 (G)");
  assert.match(explanation.familyExplanation, /C D E F G A B/);
  assert.deepEqual(explanation.bars.map(chord => chord.role), ["Home", "A minor feeling", "Away from home", "Tension"]);
  assert.match(explanation.returnExplanation, /G → C.*tension.*settle/);
});

test("covers the remaining minor and diminished chords with correct numerals and notes", () => {
  const explanation = explainProgression(["Dm", "Em", "Bdim", "C"]);
  assert.equal(explanation.numeralSequence, "ii → iii → vii° → I");
  assert.deepEqual(explanation.bars.map(chord => chord.notes), [["D", "F", "A"], ["E", "G", "B"], ["B", "D", "F"], ["C", "E", "G"]]);
  assert.match(explanation.numeralGuide, /vii° = 7 \(B\)/);
});

test("changing the first or last chord changes the loop-boundary explanation", () => {
  assert.match(explainProgression(["Am", "F", "C", "G"]).returnExplanation, /G → Am.*minor/);
  assert.match(explainProgression(["C", "Am", "F", "Bdim"]).returnExplanation, /Bdim → C.*tension/);
  assert.match(explainProgression(["C", "Am", "F", "F"]).returnExplanation, /^F → C/);
  assert.doesNotMatch(explainProgression(["Dm", "Em", "F", "Am"]).returnExplanation, /home|settle/);
});

test("repeated chords do not invent harmonic movement", () => {
  assert.match(explainProgression(["Am", "Am", "Am", "Am"]).returnExplanation, /All four bars use Am/);
  assert.match(explainProgression(["F", "G", "Am", "F"]).returnExplanation, /F repeats across the loop boundary/);
  assert.equal(explainProgression(["C", "C", "C", "C"]).numeralGuide, "I = 1 (C)");
});

test("explanations are deterministic and leave the progression unchanged", () => {
  const progression = Object.freeze(["C", "Am", "F", "G"]);
  assert.deepEqual(explainProgression(progression), explainProgression(progression));
  assert.deepEqual(progression, ["C", "Am", "F", "G"]);
});

test("unsupported chords and incomplete progressions are not mislabeled", () => {
  for (const progression of [[], ["C"], ["C", "Am", "F"], ["C", "Am", "F", "G7"], ["C", "Am", "F", "unknown"]]) {
    assert.equal(explainProgression(progression), null);
  }
});
