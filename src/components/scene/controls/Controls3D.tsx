import { OrbitControls } from "@react-three/drei";
export default function Controls3D() {
  return <OrbitControls enablePan enableZoom enableRotate minDistance={50} maxDistance={50000} />;
}
