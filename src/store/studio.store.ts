import { create } from "zustand";
import { StudioState } from "../models/studio.int";

export const useStudio = create<StudioState>((set, get) => ({
  lights: [
    {
      id: 'DEFAULT',
      type: 'directional',
      position: [0, 10, 5],
      intensity: 10000,
      color: '#ffffff',
      enabled: true,
    },
  ],
  background_color: '#202425',

  baseWidth: 3000,
  baseHeight: 3000,
  percentage: 1.0,
  cardsPerSheet: 9,

  exportCameraOffset: { x: 0, y: 0 },
  exportCameraScale: 1.0,

  strand_points_count: 25,

  gradient_color_enabled: false,
  hair_color: [.40, .20, .20, 1],
  hair_gradient_stops: [
    { pos: 0, color: '#3b2e1a' },
    { pos: 1, color: '#d2b48c' },
  ],
  glossiness: 0.11,
  sheen: 0.30,

  root_thickness: 0.02,
  tip_thickness: 0.00,

  fixed_length_size: true,
  combined_length: 20,
  minimum_length: 1,
  maximum_length: 14,

  spread_amount_offset: 22.4,

  clump_root: 0,
  clump_tip: 0,

  hairline_shape: 0.0,

  enable_frizz_hair: true,
  frizz_scale: 1.34,
  frizz_curve_enabled: false,
  frizz_curve_points: [{ x: 0, y: 0 }, { x: 0.45, y: 0.7 }, { x: 1, y: 1 }],

  enable_hair_curl: false,
  curl_count: 5,
  curl_amount: 0.0,
  curl_scale: 0.0,

  enable_messiness_hair: false,
  messiness_strength: 0.0,
  messiness_scale: 1.0,
  messiness_starting_point: 0.0,
  messiness_amount: 0.0,
  curl_shape: 0.0,

  spawn_enabled: true,
  spawn_radius_ratio_x: 0.12,
  spawn_radius_ratio_y: 0.04,
  spawn_tilt_deg: -6,

  hair_amount_max: 80,
  hair_amount_min_percent: 0.06,
  hair_amount_curve: 'quad',

  set: (s) => set(s),
  addLight: (light) => set((state) => ({
    lights: [...state.lights, { ...light, id: Math.random().toString(36).substr(2, 9) }]
  })),
  updateLight: (id, updates) => set((state) => ({
    lights: state.lights.map(light =>
      light.id === id ? { ...light, ...updates } : light
    )
  })),
  removeLight: (id) => set((state) => ({
    lights: state.lights.filter(light => light.id !== id)
  })),
}));
