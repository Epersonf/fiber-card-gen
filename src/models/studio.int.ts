import { GradientStop } from "./gradient-stop";
import { HairAmountCurveOpts } from "./hair-amount-curve";
import { Light } from "./light.int";
import { Vector2 } from "./vector2";

export type StudioState = {
  lights: Light[];

  // Base render dimensions
  baseWidth: number;
  baseHeight: number;
  percentage: number;

  // Export camera properties
  exportCameraOffset: Vector2;
  exportCameraScale: number;
  cardsPerSheet: number;
  background_color: string;

  strand_points_count: number;

  gradient_color_enabled: boolean;
  hair_color: [number, number, number, number];
  hair_gradient_stops: GradientStop[];
  glossiness: number;
  sheen: number;

  root_thickness: number;
  tip_thickness: number;

  fixed_length_size: boolean;
  combined_length: number;
  minimum_length: number;
  maximum_length: number;

  spread_amount_offset: number;

  clump_root: number;
  clump_tip: number;

  hairline_shape: number;

  enable_frizz_hair: boolean;
  frizz_scale: number;
  frizz_curve_enabled: boolean;
  frizz_curve_points: { x: number; y: number }[];

  enable_delete_hair: boolean;
  reduce_amount: number;

  enable_hair_curl: boolean;
  curl_count: number;
  curl_amount: number;
  curl_scale: number;

  enable_messiness_hair: boolean;
  messiness_strength: number;
  messiness_scale: number;
  messiness_starting_point: number;
  messiness_amount: number;

  spawn_enabled: boolean;
  spawn_radius_ratio_x: number;
  spawn_radius_ratio_y: number;
  spawn_tilt_deg: number;

  curl_shape: number;

  hair_amount_max: number;
  hair_amount_min_percent: number;
  hair_amount_curve: HairAmountCurveOpts;

  set: (s: Partial<StudioState>) => void;
  addLight: (light: Omit<Light, 'id'>) => void;
  updateLight: (id: string, updates: Partial<Light>) => void;
  removeLight: (id: string) => void;
};
