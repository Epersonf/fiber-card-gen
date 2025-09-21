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
    const x = -W / 2 + cellW / 2 + col * cellW;
    const y = H / 2 - cellH / 2 - row * cellH;
    return new THREE.Vector3(x, y, 0);
  }
}
