import * as THREE from "three";
import { StudioState } from "../models/studio.int";

export class GroupLayout {
  static computeSheetSize(s: StudioState) {
  const W = s.baseSize * s.percentage;
  const H = s.baseSize * s.percentage;
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
    // compute grid size
    const { cols, rows } = this.computeGrid(s);
    // base grid position
    let x = -W / 2 + cellW / 2 + col * cellW;
    let y = H / 2 - cellH / 2 - row * cellH;
  // apply user-configurable card offsets (stored as fraction of baseSize)
  // cardsOffset.x/y are fractions (px / baseSize), so multiply by W/H to get world units
  const offsetX = (s.cardsOffset?.x ?? 0) * W;
  const offsetY = (s.cardsOffset?.y ?? 0) * H;
    x += offsetX * (col - (cols - 1) / 2);
    y -= offsetY * (row - (rows - 1) / 2);
    return new THREE.Vector3(x, y, 0);
  }
}
