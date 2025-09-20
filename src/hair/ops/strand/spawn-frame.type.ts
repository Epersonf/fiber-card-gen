import * as THREE from "three";

export type SpawnFrame = {
  yTop: number;           // topo local do card (após padding)
  yMin: number;           // base local (padBot)
  e1: THREE.Vector3;      // eixo X do plano inclinado
  e2: THREE.Vector3;      // eixo Z do plano inclinado
  radiusX: number;        // raio da elipse em X
  radiusY: number;        // raio da elipse em Y
  tiltRad: number;        // inclinação (radianos)
};