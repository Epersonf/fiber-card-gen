import { GradientStop } from "./gradient-stop";
import { Light } from "./light.int";
import { NormalSpace } from "./normal-space.int";

export type StudioState = {
  // Light
  lights: Light[];

  // Render / folha
  baseWidth: number;           // ex.: 6700
  baseHeight: number;          // ex.: 3000
  percentage: number;          // 0.35..1.5 (35%..150%)
  cardsPerSheet: number;       // default 11
  marginPx: number;
  background_color: string;

  // Hair Amount / Strand Points
  hair_amount_offset: number;
  strand_points_count: number;

  // Hair Color
  gradient_color_enabled: boolean;
  hair_color: [number, number, number, number];
  hair_gradient_stops: GradientStop[];
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

  spawn_enabled: boolean;
  spawn_radius_ratio: number; // relativo à largura da célula
  spawn_tilt_deg: number;

  curl_shape: number;

  set: (s: Partial<StudioState>) => void;
  addLight: (light: Omit<Light, 'id'>) => void;
  updateLight: (id: string, updates: Partial<Light>) => void;
  removeLight: (id: string) => void;
};