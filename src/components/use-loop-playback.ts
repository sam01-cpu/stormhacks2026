"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChord } from "@/lib/music";
import { LoopTransport, type LoopSettings } from "@/lib/loop-transport";
import { useStudio } from "./studio-provider";

export function useLoopPlayback() {
  const { progression, tempo, getAudio, hear } = useStudio();
  const [session, setSession] = useState<LoopTransport | null>(null);
  const playing = session !== null;
  const [starting, setStarting] = useState(false);
  const [playback, setPlayback] = useState({ position: 0, notes: [] as string[], tempo });
  const transport = useRef<LoopTransport | null>(null);
  const settings = useRef<LoopSettings>({ tempo, chords: progression.map((id) => getChord(id).notes) });
  const request = useRef(0);
  const pending = useRef(false);
  const mounted = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);

  const clearTimers = useCallback(() => {
    clearInterval(timer.current);
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    timer.current = undefined;
    frame.current = undefined;
  }, []);

  const invalidateRequest = useCallback(() => {
    ++request.current;
    pending.current = false;
  }, []);

  const stop = useCallback(() => {
    invalidateRequest();
    clearTimers();
    transport.current?.stop();
    transport.current = null;
    setSession(null);
    setStarting(false);
  }, [clearTimers, invalidateRequest]);

  useEffect(() => {
    mounted.current = true;
    function onVisibility() { if (document.hidden) stop(); }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stop);
    return () => {
      mounted.current = false;
      invalidateRequest();
      clearTimers();
      transport.current?.stop();
      transport.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stop);
    };
  }, [clearTimers, stop, invalidateRequest]);

  useEffect(() => {
    settings.current = { tempo, chords: progression.map((id) => getChord(id).notes) };
    transport.current?.update(settings.current);
  }, [tempo, progression]);

  const start = useCallback(async () => {
    if (pending.current || transport.current) return;
    const id = ++request.current;
    pending.current = true;
    setStarting(true);
    void hear([]);
    const instrument = await getAudio();
    if (!mounted.current || request.current !== id) return;
    pending.current = false;
    setStarting(false);
    if (!instrument) return;
    const loop = new LoopTransport(instrument, settings.current);
    loop.start();
    transport.current = loop;
    setPlayback(loop.getPlayback());
    setSession(loop);
  }, [getAudio, hear]);

  useEffect(() => {
    if (!session) return;
    function animate() {
      const loop = transport.current;
      if (!loop || loop !== session) return;
      setPlayback(loop.getPlayback());
      frame.current = requestAnimationFrame(animate);
    }
    timer.current = setInterval(() => { if (transport.current === session) session.schedule(); }, 25);
    frame.current = requestAnimationFrame(animate);
    return clearTimers;
  }, [session, clearTimers]);

  return {
    playing, starting, start, stop,
    position: playing ? playback.position : 0,
    activeNotes: playing ? playback.notes : [],
    appliedTempo: playing ? playback.tempo : tempo,
  };
}
