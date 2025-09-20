export interface Light {
  id: string;
  type: 'directional' | 'point';
  position: [number, number, number];
  intensity: number;
  color: string;
  enabled: boolean;
  distance?: number;                  // point: raio de influência (0 = infinito)
  decay?: number;                     // point: atenuação (2 padrão físico)
}