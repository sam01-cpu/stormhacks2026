import { frequency } from "./music";

export class PianoAudio {
  readonly context = new AudioContext({ latencyHint: "interactive" });
  private voices = new Set<() => void>();
  private output = this.context.createGain();

  constructor() {
    this.output.gain.value = 0.65;

    // Bound the combined signal, including overlapping chords and held notes.
    const limiter = this.context.createWaveShaper();
    const curve = new Float32Array(4097);
    for (let index = 0; index < curve.length; index++) {
      const sample = (index / (curve.length - 1)) * 2 - 1;
      curve[index] = 0.65 * Math.tanh(sample / 0.65);
    }
    limiter.curve = curve;
    this.output.connect(limiter);
    limiter.connect(this.context.destination);
  }

  async ready() {
    if (this.context.state !== "running") await this.context.resume();
    if (this.context.state !== "running") throw new Error("Audio is unavailable.");
  }

  play(notes: string[], time = this.context.currentTime, duration = 1.3) {
    const releases = notes.map((note) => this.voice(note, time, duration, 0.1 / Math.sqrt(notes.length)));
    return () => releases.forEach((release) => release());
  }

  noteOn(note: string) {
    return this.voice(note, this.context.currentTime, undefined, 0.06);
  }

  private voice(note: string, time: number, duration: number | undefined, volume: number) {
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + 0.008);
    envelope.gain.exponentialRampToValueAtTime(duration !== undefined ? 0.001 : volume * 0.4, time + (duration ?? 0.3));
    envelope.connect(this.output);
    let remaining = 3;
    let released = false;

    const oscillators = [1, 2, 3].map((harmonic) => {
      const oscillator = this.context.createOscillator();
      const partial = this.context.createGain();
      oscillator.frequency.value = frequency(note) * harmonic;
      partial.gain.value = 1 / harmonic ** 2;
      oscillator.connect(partial);
      partial.connect(envelope);
      oscillator.onended = () => {
        oscillator.disconnect();
        partial.disconnect();
        if (--remaining === 0) {
          envelope.disconnect();
          this.voices.delete(release);
        }
      };
      oscillator.start(time);
      if (duration !== undefined) oscillator.stop(time + duration + 0.02);
      return oscillator;
    });

    const release = () => {
      if (released || remaining === 0) return;
      released = true;
      const now = this.context.currentTime;
      envelope.gain.cancelAndHoldAtTime(now);
      envelope.gain.linearRampToValueAtTime(0, now + 0.04);
      oscillators.forEach((oscillator) => oscillator.stop(now + 0.05));
    };
    this.voices.add(release);
    return release;
  }

  stop() {
    this.voices.forEach((release) => release());
    this.voices.clear();
  }
}
