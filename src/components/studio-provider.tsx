"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { PianoAudio } from "@/lib/audio";

type StudioState = {
  selectedNotes: string[];
  setSelectedNotes: (notes: string[]) => void;
  progression: string[];
  setProgression: (chords: string[]) => void;
  tempo: number;
  setTempo: (tempo: number) => void;
  error: string;
  getAudio: () => Promise<PianoAudio | null>;
  hear: (notes: string[]) => Promise<void>;
  startNote: (note: string) => Promise<(() => void) | undefined>;
};

const StudioContext = createContext<StudioState | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [progression, setProgression] = useState(["C", "Am", "F", "G"]);
  const [tempo, setTempo] = useState(84);
  const [error, setError] = useState("");
  const audio = useRef<PianoAudio | null>(null);
  const preview = useRef<(() => void) | undefined>(undefined);
  const previewRequest = useRef(0);

  const getAudio = useCallback(async () => {
    try {
      audio.current ??= new PianoAudio();
      await audio.current.ready();
      setError("");
      return audio.current;
    } catch {
      setError("Sound couldn’t start. Try again, or check that audio is enabled in your browser.");
      return null;
    }
  }, []);

  const hear = useCallback(async (notes: string[]) => {
    const request = ++previewRequest.current;
    preview.current?.();
    if (!notes.length) return;
    const instrument = await getAudio();
    if (request === previewRequest.current) preview.current = instrument?.play(notes);
  }, [getAudio]);

  const startNote = useCallback(async (note: string) => {
    ++previewRequest.current;
    preview.current?.();
    const instrument = await getAudio();
    return instrument?.noteOn(note);
  }, [getAudio]);

  useEffect(() => () => {
    audio.current?.stop();
    void audio.current?.context.close();
  }, []);

  return (
    <StudioContext.Provider value={{ selectedNotes, setSelectedNotes, progression, setProgression, tempo, setTempo, error, getAudio, hear, startNote }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const studio = useContext(StudioContext);
  if (!studio) throw new Error("StudioProvider is required.");
  return studio;
}
