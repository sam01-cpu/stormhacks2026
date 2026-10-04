import test from "node:test";
import assert from "node:assert/strict";
import { recognizeChord } from "../src/lib/music.ts";

test("recognizes major, minor and diminished triads, including black keys", () => {
  const examples = [
    { selected: ["C", "E", "G"], name: "C major", root: "C" },
    { selected: ["A", "C", "E"], name: "A minor", root: "A" },
    { selected: ["B", "D", "F"], name: "B diminished", root: "B" },
    { selected: ["D", "F#", "A"], name: "D major", root: "D" },
    { selected: ["C", "D#", "G"], name: "C minor", root: "C" },
    { selected: ["C", "D#", "F#"], name: "C diminished", root: "C" },
    { selected: ["F#", "A#", "C#"], name: "F# major", root: "F#" },
  ];
  for (const { selected, name, root } of examples) {
    const chord = recognizeChord(selected);
    assert.equal(chord?.name, name);
    assert.equal(chord?.root, root);
    assert.deepEqual(chord?.notes, selected);
    assert.ok(chord.explanation.includes("the note that names the chord"));
  }
});

test("identifies the root independently of selection order", () => {
  for (const notes of [["G", "C", "E"], ["E", "G", "C"], ["C", "G", "E"]]) {
    const chord = recognizeChord(notes);
    assert.equal(chord?.name, "C major");
    assert.deepEqual(chord?.notes, ["C", "E", "G"]);
  }
});

test("does not label incomplete, unsupported or larger selections as triads", () => {
  for (const notes of [[], ["C"], ["C", "E"], ["C", "D", "E"], ["C", "E", "G", "B"], ["C", "C", "G"], ["C", "E", "unknown"]]) {
    assert.equal(recognizeChord(notes), undefined);
  }
});

test("repeated instances of a selected note do not change the chord", () => {
  assert.equal(recognizeChord(["C", "E", "G", "C"])?.name, "C major");
});
