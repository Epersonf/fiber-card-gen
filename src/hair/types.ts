export type StudioStateSubset = {
  baseWidth: number;
  baseHeight: number;
  percentage: number;
  cardsPerSheet: number;
  marginPx: number;

  hair_amount_offset: number;
  strand_points_count: number;

  hair_color: [number, number, number, number];
  glossiness: number; // -> metalness
  sheen: number;      // -> roughness

  root_thickness: number;
  tip_thickness: number;

  fixed_length_size: boolean;
  combined_length: number;
  minimum_length: number;
  maximum_length: number;

  spread_amount_offset: number;
  clump_root: number;
  clump_tip: number;

  enable_frizz_hair: boolean;
  frizz_scale: number;
  frizz_curve_enabled: boolean;
  frizz_curve_points: { x: number; y: number }[];

  enable_hair_curl: boolean;
  curl_count: number;
  curl_amount: number;
  curl_scale: number;

  enable_messiness_hair: boolean;
  messiness_strength: number;
  messiness_scale: number;
  messiness_starting_point: number;
  messiness_amount: number;

  curl_shape: number;

  enable_delete_hair: boolean;
  reduce_amount: number;
  hairline_shape: number;
  
  spawn_enabled?: boolean;         // default true
  spawn_radius_ratio?: number;     // 0..1 (fração da cellW). default 0.12
  spawn_tilt_deg?: number;
};
