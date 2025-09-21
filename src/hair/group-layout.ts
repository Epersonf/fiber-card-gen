import * as THREE from "three";
import { StudioState } from "../models/studio.int";
import { REFERENCE_WORLD_SIZE } from "../utils/constants";

export class GroupLayout {
  static computeSheetSize(s: StudioState) {
  // Use a fixed reference world size so the world geometry/layout does not
  // change when the export resolution (baseSize) is modified.
  const W = REFERENCE_WORLD_SIZE;
  const H = REFERENCE_WORLD_SIZE;
    return { W, H };
  }

  static computeGrid(s: StudioState) {
    const cols = Math.ceil(Math.sqrt(s.cardsPerSheet));
    const rows = Math.ceil(s.cardsPerSheet / cols);
    return { cols, rows };
  }

  static computeCell(s: StudioState) {
    const { W, H } = this.computeSheetSize(s);
    const { cols, rows } = this.computeGrid(s);
    const cellW = W / cols;
    const cellH = H / rows;
    return { cellW, cellH, cols, rows, W, H };
  }

  static cardWorldPos(
    col: number,
    row: number,
    cellW: number,
    cellH: number,
    s: StudioState,
    W: number,
    H: number
  ) {
    const x = -W / 2 + cellW / 2 + col * cellW;
    const y = H / 2 - cellH / 2 - row * cellH;
    return new THREE.Vector3(x, y, 0);
  }
}
