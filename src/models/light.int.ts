export interface Light {
  id: string;
  type: 'directional' | 'point';
  position: [number, number, number];
  intensity: number;
  color: string;
  enabled: boolean;
}