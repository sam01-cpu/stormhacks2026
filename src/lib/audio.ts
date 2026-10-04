import { frequency } from "./music";

export class PianoAudio {
  readonly context = new AudioContext();
  private voices = new Set<OscillatorNode>();

  async ready() {
    await this.context.resume();
    if (this.context.state !== "running") throw new Error("Audio is unavailable.");
  }

  play(notes: string[], time = this.context.currentTime, duration = 1.3) {
    notes.forEach((note) => {
      const envelope = this.context.createGain();
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(0.13 / Math.sqrt(notes.length), time + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);
      envelope.connect(this.context.destination);

      [1, 2, 3].forEach((harmonic) => {
        const oscillator = this.context.createOscillator();
        const partial = this.context.createGain();
        oscillator.frequency.value = frequency(note) * harmonic;
        partial.gain.value = 1 / harmonic ** 2;
        oscillator.connect(partial);
        partial.connect(envelope);
        this.voices.add(oscillator);
        oscillator.onended = () => {
          this.voices.delete(oscillator);
          oscillator.disconnect();
          partial.disconnect();
          if (harmonic === 3) envelope.disconnect();
        };
        oscillator.start(time);
        oscillator.stop(time + duration + 0.02);
      });
    });
  }

  stop() {
    this.voices.forEach((voice) => voice.stop());
    this.voices.clear();
  }
}
