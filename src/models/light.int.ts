export interface Light {
  id: string;
  type: 'directional' | 'point';
  position: [number, number, number];
  intensity: number;
  color: string;
  enabled: boolean;
  distance?: number;                  // point: raio de influência (0 = infinito)
  decay?: number;                     // point: atenuação (2 padrão físico)
  target?: [number, number, number];  // directional: para onde aponta (default [0,0,0])
}