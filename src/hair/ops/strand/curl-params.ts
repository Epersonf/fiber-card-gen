import * as THREE from "three";

export type CurlParams = {
  phase: number;
  azimuth: number;
  freqJit: number;
  ampJit: number;
  qYaw: THREE.Quaternion;
};