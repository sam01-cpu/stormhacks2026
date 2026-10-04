"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChord } from "@/lib/music";
import type { PianoAudio } from "@/lib/audio";
import { useStudio } from "./studio-provider";

export function useLoopPlayback() {
  const { progression, tempo, getAudio } = useStudio();
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [position, setPosition] = useState(0);
  const audio = useRef<PianoAudio | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const toggle = useCallback(async () => {
    if (playing) {
      audio.current?.stop();
      setPlaying(false);
      return;
    }
    setStarting(true);
    const instrument = await getAudio();
    if (!mounted.current) return;
    audio.current = instrument;
    setPosition(0);
    setStarting(false);
    if (instrument) setPlaying(true);
  }, [playing, getAudio]);

  useEffect(() => {
    if (!playing || !audio.current) return;
    const instrument = audio.current;
    const barDuration = (60 / tempo) * 4;
    const start = instrument.context.currentTime + 0.04;
    let nextBar = 0;
    let nextTime = start;
    let frame = 0;

    function schedule() {
      while (nextTime < instrument.context.currentTime + 0.15) {
        instrument.play(getChord(progression[nextBar % 4]).notes, nextTime, barDuration * 0.92);
        nextBar++;
        nextTime += barDuration;
      }
    }
    function animate() {
      setPosition(Math.max(0, (instrument.context.currentTime - start) / barDuration) % 4);
      frame = requestAnimationFrame(animate);
    }
    function onVisibility() {
      if (document.hidden) setPlaying(false);
    }

    schedule();
    frame = requestAnimationFrame(animate);
    const timer = window.setInterval(schedule, 25);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      instrument.stop();
    };
  }, [playing, progression, tempo]);

  return { playing, starting, position: playing ? position : 0, toggle };
}
