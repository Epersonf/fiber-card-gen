import * as THREE from "three";
import { type StudioStateSubset } from "./types";

export class GroupLayout {
  static computeSheetSize(s: StudioStateSubset) {
    const W = s.baseWidth * s.percentage;
    const H = s.baseHeight * s.percentage;
    return { W, H };
  }

  static computeGrid(s: StudioStateSubset) {
    const cols = Math.ceil(Math.sqrt(s.cardsPerSheet));
    const rows = Math.ceil(s.cardsPerSheet / cols);
    return { cols, rows };
  }

  static computeCell(s: StudioStateSubset) {
    const { W, H } = this.computeSheetSize(s);
    const { cols, rows } = this.computeGrid(s);
    const cellW = (W - (cols + 1) * s.marginPx) / cols;
    const cellH = (H - (rows + 1) * s.marginPx) / rows;
    return { cellW, cellH, cols, rows, W, H };
  }

  static cardWorldPos(
    col: number,
    row: number,
    cellW: number,
    cellH: number,
    s: StudioStateSubset,
    W: number,
    H: number
  ) {
    const x = -W / 2 + s.marginPx + cellW / 2 + col * (cellW + s.marginPx);
    const y = H / 2 - s.marginPx - cellH / 2 - row * (cellH + s.marginPx);
    return new THREE.Vector3(x, y, 0);
  }
}
