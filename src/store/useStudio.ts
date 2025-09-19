import { create } from "zustand";

export type NormalSpace = "tangent" | "object" | "world";

type StudioState = {
  // Render / folha
  baseWidth: number;           // ex.: 6700
  baseHeight: number;          // ex.: 3000
  percentage: number;          // 0.35..1.5 (35%..150%)
  cardsPerSheet: number;       // default 11
  cols: number;                // grid cols (auto)
  rows: number;                // grid rows (auto)
  marginPx: number;

  normalSpace: NormalSpace;

  // Modification Mode
  individualModification: boolean;

  // Hair Amount / Strand Points
  hair_amount_offset: number;
  strand_points_count: number;

  // Hair Color
  gradient_color_enabled: boolean;
  hair_color: [number, number, number, number];
  glossiness: number; // Metallic
  sheen: number;      // Roughness

  // Hair Strand Thickness
  root_thickness: number;
  tip_thickness: number;

  // Hair Length
  fixed_length_size: boolean;
  combined_length: number;
  minimum_length: number;
  maximum_length: number;

  // Hair Spread
  spread_amount_offset: number;

  // Hair Clumping
  clump_root: number;
  clump_tip: number;

  // Hairline Shape
  hairline_shape: number;

  // Frizz
  enable_frizz_hair: boolean;
  frizz_scale: number;
  frizz_curve_enabled: boolean;
  frizz_curve_points: { x: number; y: number }[]; // curva 0..1

  // Reduce Hair
  enable_delete_hair: boolean;
  reduce_amount: number;

  // Curl
  enable_hair_curl: boolean;
  curl_count: number;
  curl_amount: number;
  curl_scale: number;

  // Messiness/Roughness
  enable_messiness_hair: boolean;
  messiness_strength: number;
  messiness_scale: number;
  messiness_starting_point: number;
  messiness_amount: number;

  // Luz
  light_source_size: number;
  light_source_location: number;
  light_intensity: number;

  set: (s: Partial<StudioState>) => void;
};

export const useStudio = create<StudioState>((set, get) => ({
  baseWidth: 6700,
  baseHeight: 3000,
  percentage: 1.0,
  cardsPerSheet: 11,
  cols: 11,
  rows: 1,
  marginPx: 32,

  normalSpace: "tangent",

  individualModification: false,

  hair_amount_offset: 0,
  strand_points_count: 8,

  gradient_color_enabled: false,
  hair_color: [1, 1, 1, 1],
  glossiness: 0.11,
  sheen: 0.30,

  root_thickness: 0.01,
  tip_thickness: 0.00,

  fixed_length_size: true,
  combined_length: 13.46,
  minimum_length: 1,
  maximum_length: 14,

  spread_amount_offset: 22.4,

  clump_root: 3453.12,
  clump_tip: 1235.96,

  hairline_shape: 0.0,

  enable_frizz_hair: true,
  frizz_scale: 1.34,
  frizz_curve_enabled: false,
  frizz_curve_points: [{ x: 0, y: 0 }, { x: 0.45, y: 0.7 }, { x: 1, y: 1 }],

  enable_delete_hair: false,
  reduce_amount: 0.0,

  enable_hair_curl: false,
  curl_count: 5,
  curl_amount: 0.0,
  curl_scale: 0.0,

  enable_messiness_hair: false,
  messiness_strength: 0.0,
  messiness_scale: 1.0,
  messiness_starting_point: 0.0,
  messiness_amount: 0.0,

  light_source_size: 0.10,
  light_source_location: -7.34,
  light_intensity: 3500,

  set: (s) => set(s),
}));
