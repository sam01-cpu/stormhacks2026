import type { PianoAudio } from "./audio";

export type LoopSettings = { tempo: number; chords: string[][] };
type ScheduledBar = {
  index: number;
  start: number;
  duration: number;
  tempo: number;
  notes: string[];
  release: () => void;
};

// AudioContext time drives playback; the UI timer only queues audio ahead of it.
export class LoopTransport {
  private audio: Pick<PianoAudio, "context" | "play">;
  private settings: LoopSettings;
  private bars: ScheduledBar[] = [];
  private nextBar = 0;
  private nextTime = 0;
  private running = false;

  constructor(audio: Pick<PianoAudio, "context" | "play">, settings: LoopSettings) {
    this.audio = audio;
    this.settings = settings;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.nextBar = 0;
    this.nextTime = this.audio.context.currentTime + 0.04;
    this.schedule();
  }

  update(settings: LoopSettings) {
    this.settings = settings;
    const now = this.audio.context.currentTime;
    // A bar may already be queued inside the lookahead window. Replace only
    // that unheard bar so late edits apply without cutting off the current one.
    this.bars = this.bars.map((bar) => {
      if (bar.start <= now) return bar;
      bar.release();
      const replacement = this.queueBar(bar.index, bar.start);
      this.nextTime = replacement.start + replacement.duration;
      return replacement;
    });
  }

  schedule() {
    if (!this.running) return;
    const now = this.audio.context.currentTime;
    this.bars = this.bars.filter((bar) => bar.start + bar.duration + 0.05 >= now);
    // After a long main-thread pause, resume at the next bar rather than
    // starting a backlog of missed chords at once.
    if (this.nextTime < now) this.nextTime = now + 0.04;
    if (this.nextTime >= now + 0.12) return;

    const bar = this.queueBar(this.nextBar, this.nextTime);
    this.bars.push(bar);
    this.nextBar = (this.nextBar + 1) % 4;
    this.nextTime = bar.start + bar.duration;
  }

  getPlayback() {
    const now = this.audio.context.currentTime;
    const bar = this.bars.findLast((candidate) => candidate.start <= now);
    if (!bar) return { position: 0, notes: [], tempo: this.settings.tempo };
    return {
      position: bar.index + Math.min(Math.max(0, (now - bar.start) / bar.duration), 0.999999),
      notes: bar.notes,
      tempo: bar.tempo,
    };
  }

  stop() {
    this.running = false;
    this.bars.forEach((bar) => bar.release());
    this.bars = [];
  }

  private queueBar(index: number, start: number): ScheduledBar {
    const duration = (60 / this.settings.tempo) * 4;
    const notes = [...this.settings.chords[index]];
    return { index, start, duration, notes, tempo: this.settings.tempo, release: this.audio.play(notes, start, duration) };
  }
}
