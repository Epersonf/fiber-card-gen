import { useEffect } from "react";
import StudioPanel from "./components/studio/StudioPanel";
import HairScene from "./components/HairScene";
import "./App.css";
import { useStudio } from "./store/studio.store";
import type { StudioState } from "./models/studio.int";

const ALLOWED_KEYS: (keyof StudioState)[] = [
  "lights",
  "baseSize", "percentage", "cardsPerSheet",
  "strand_points_count",
  "gradient_color_enabled", "hair_color", "glossiness", "sheen",
  "root_thickness", "tip_thickness",
  "fixed_length_size", "combined_length", "minimum_length", "maximum_length",
  "spread_amount_offset", "clump_root", "clump_tip",
  "hairline_shape",
  "enable_frizz_hair", "frizz_scale", "frizz_curve_enabled", "frizz_curve_points",
  "enable_hair_curl", "curl_count", "curl_amount", "curl_scale",
  "enable_messiness_hair", "messiness_strength", "messiness_scale", "messiness_starting_point", "messiness_amount",
  "spawn_enabled", "spawn_radius_ratio_x", "spawn_radius_ratio_y", "spawn_tilt_deg",
  "curl_shape",
  "hair_gradient_stops",
  "hair_amount_max", "hair_amount_min_percent", "hair_amount_curve",
];

export default function App() {
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (!text) return;

      try {
        const raw = JSON.parse(text);
        if (!raw || typeof raw !== "object") return;

        const next: Partial<StudioState> = {};
        for (const k of ALLOWED_KEYS) {
          if (Object.prototype.hasOwnProperty.call(raw, k)) {
            next[k] = raw[k];
          }
        }

        // garante id nas lights
        if (Array.isArray(next.lights)) {
          next.lights = next.lights.map((l: any) => ({
            ...l,
            id: l?.id ?? Math.random().toString(36).slice(2, 9),
          }));
        }

        useStudio.getState().set(next);
      } catch {
      }
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
