// Reference sizes used across the renderer to decouple "world" units from
// the export resolution (which remains controlled by baseSize * percentage).
export const REFERENCE_WORLD_SIZE = 2048; // fixed sheet size in world units
export const EXPORT_FRAME_MARGIN = 1.06; // same margin used by gizmo

// Backwards-compatible export in case other modules imported the old class
export class Constants {
  static readonly DESIGN_SHEET = REFERENCE_WORLD_SIZE;
}