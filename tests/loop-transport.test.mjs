import test from "node:test";
import assert from "node:assert/strict";
import { LoopTransport } from "../src/lib/loop-transport.ts";

const defaultChords = [["C", "E", "G"], ["A", "C", "E"], ["F", "A", "C"], ["G", "B", "D"]];

function setup(tempo = 120) {
  const calls = [];
  const context = { currentTime: 0 };
  const audio = { context, play(notes, start, duration) {
    const call = { notes, start, duration, released: false };
    calls.push(call);
    return () => { call.released = true; };
  } };
  return { context, calls, loop: new LoopTransport(audio, { tempo, chords: defaultChords }) };
}

test("loops four bars in order with four beats per chord", () => {
  const { loop, context, calls } = setup();
  loop.start();
  for (let bar = 1; bar <= 8; bar++) {
    context.currentTime = bar * 2;
    loop.schedule();
    loop.schedule(); // Repeated scheduler ticks must not duplicate a bar.
  }
  assert.equal(calls.length, 9);
  calls.forEach((call, bar) => {
    assert.deepEqual(call.notes, defaultChords[bar % 4]);
    assert.equal(call.duration, 2);
    assert.ok(Math.abs(call.start - (0.04 + bar * 2)) < 1e-8);
  });
  context.currentTime = 16.54;
  assert.equal(loop.getPlayback().position, 0.25);
});

test("tempo edits preserve the current bar and apply at the next boundary", () => {
  const { loop, context, calls } = setup();
  loop.start();
  context.currentTime = 1;
  loop.update({ tempo: 60, chords: defaultChords });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].released, false);
  assert.equal(loop.getPlayback().tempo, 120);
  context.currentTime = 2;
  loop.schedule();
  assert.equal(calls[1].start, 2.04);
  assert.equal(calls[1].duration, 4);
  context.currentTime = 2.54;
  assert.equal(loop.getPlayback().position, 1.125);
  assert.equal(loop.getPlayback().tempo, 60);
});

test("late tempo edits replace only a queued bar without shifting its start", () => {
  const { loop, context, calls } = setup();
  loop.start();
  context.currentTime = 2;
  loop.schedule();
  context.currentTime = 2.01;
  loop.update({ tempo: 60, chords: defaultChords });
  assert.equal(calls[0].released, false);
  assert.equal(calls[1].released, true);
  assert.equal(calls[2].start, 2.04);
  assert.equal(calls[2].duration, 4);
  context.currentTime = 6;
  loop.schedule();
  assert.equal(calls[3].start, 6.04);
});

test("chord edits affect future audio while the current chord keeps playing", () => {
  const { loop, context, calls } = setup();
  loop.start();
  context.currentTime = 1;
  const edited = [["D", "F", "A"], ["E", "G", "B"], ...defaultChords.slice(2)];
  loop.update({ tempo: 120, chords: edited });
  assert.deepEqual(loop.getPlayback().notes, ["C", "E", "G"]);
  context.currentTime = 2;
  loop.schedule();
  assert.deepEqual(calls[1].notes, ["E", "G", "B"]);
  for (let bar = 2; bar <= 4; bar++) { context.currentTime = bar * 2; loop.schedule(); }
  assert.deepEqual(calls[4].notes, ["D", "F", "A"]);
});

test("late chord edits replace an already queued chord", () => {
  const { loop, context, calls } = setup();
  loop.start();
  context.currentTime = 2;
  loop.schedule();
  loop.update({ tempo: 120, chords: [defaultChords[0], ["B", "D", "F"], ...defaultChords.slice(2)] });
  assert.equal(calls[1].released, true);
  assert.deepEqual(calls[2].notes, ["B", "D", "F"]);
  assert.equal(calls[2].start, calls[1].start);
});

test("Stop releases loop audio and prevents new events; restart begins at bar one", () => {
  const { loop, context, calls } = setup();
  loop.start();
  loop.start();
  assert.equal(calls.length, 1);
  context.currentTime = 2;
  loop.schedule();
  loop.stop();
  assert.ok(calls.every((call) => call.released));
  context.currentTime = 20;
  loop.schedule();
  assert.equal(calls.length, 2);
  loop.start();
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[2].notes, defaultChords[0]);
});

test("a delayed scheduler does not stack a backlog of missed chords", () => {
  const { loop, context, calls } = setup();
  loop.start();
  context.currentTime = 30;
  loop.schedule();
  assert.equal(calls.length, 2);
  assert.ok(calls[1].start >= context.currentTime);
});
