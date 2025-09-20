import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function SceneSetup({ onSceneReady }: { onSceneReady: (scene: THREE.Scene, camera: THREE.Camera) => void }) {
  const { scene, camera } = useThree();
  useEffect(() => {
    if (camera) onSceneReady(scene, camera);
  }, [scene, camera, onSceneReady]);
  return null;
}