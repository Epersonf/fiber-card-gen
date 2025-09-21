import { useMemo } from "react";
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { HairBuilder } from "../../hair/hair-builder";

export default function SceneContent() {
  const s = useStudio();
  const group = useMemo(() => HairBuilder.build(1234, s), [
  s.baseSize, s.baseSize, s.percentage, s.cardsPerSheet,
    s.strand_points_count, s.gradient_color_enabled,
    s.hair_color, s.glossiness, s.sheen,
    s.root_thickness, s.tip_thickness,
    s.fixed_length_size, s.combined_length, s.minimum_length, s.maximum_length,
    s.spread_amount_offset, s.clump_root, s.clump_tip,
    s.enable_frizz_hair, s.frizz_scale, s.frizz_curve_enabled, s.frizz_curve_points,
    s.enable_hair_curl, s.curl_count, s.curl_amount, s.curl_scale,
    s.enable_messiness_hair, s.messiness_strength, s.messiness_scale, s.messiness_starting_point, s.messiness_amount,
    s.spawn_enabled, s.spawn_radius_ratio_x, s.spawn_radius_ratio_y, s.spawn_tilt_deg,
    s.curl_shape,
    s.hair_gradient_stops,
    s.hair_amount_max, s.hair_amount_min_percent, s.hair_amount_curve,
  ]);

  return <primitive object={group} />;
}
