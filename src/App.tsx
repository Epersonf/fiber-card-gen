import { useEffect } from "react";
import StudioPanel from "./components/studio/StudioPanel";
import HairScene from "./components/HairScene";
import "./App.css";
import { useStudio } from "./store/studio.store";
import type { StudioState } from "./models/studio.int";

type MutKey = Exclude<keyof StudioState, "set" | "addLight" | "updateLight" | "removeLight">;
const ALLOWED_KEYS: MutKey[] = (Object.keys(useStudio.getState()) as (keyof StudioState)[])
  .filter(k => !["set","addLight","updateLight","removeLight"].includes(k as string)) as MutKey[];

export default function App() {
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text"); if (!text) return;
      try {
        const raw = JSON.parse(text); if (!raw || typeof raw !== "object") return;
        const next: Partial<StudioState> = {};
        for (const k of ALLOWED_KEYS) if (k in raw) (next as any)[k] = raw[k];
        if (Array.isArray(next.lights)) next.lights = next.lights.map(l => ({ ...l, id: l?.id ?? Math.random().toString(36).slice(2, 9) }));
        useStudio.getState().set(next);
      } catch {}
    };
    window.addEventListener("paste", onPaste as any);
    return () => window.removeEventListener("paste", onPaste as any);
  }, []);
  return (
    <div className="wrap">
      <StudioPanel />
      <HairScene />
    </div>
  );
}
