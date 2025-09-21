import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { GroupLayout } from "../../hair/group-layout";

interface CameraResetProps {
  viewMode: '2D' | '3D';
}

export default function CameraReset({ viewMode }: CameraResetProps) {
  const { camera } = useThree();
  const s = useStudio();

  useEffect(() => {
    if (viewMode === '2D' && camera instanceof THREE.OrthographicCamera) {
      // Resetar a câmera ortográfica para a posição e zoom iniciais
      camera.zoom = 1;
      camera.position.set(0, 0, 10);
      const { W, H } = GroupLayout.computeSheetSize(s);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.near = -10000;
      camera.far = 10000;
      camera.updateProjectionMatrix();
    } else if (viewMode === '3D' && camera instanceof THREE.PerspectiveCamera) {
      // Resetar a câmera perspectiva para a posição inicial
      camera.position.set(0, 0, 3500);
      camera.lookAt(0, 0, 0);
      camera.near = 0.1;
      camera.far = 100000;
      camera.updateProjectionMatrix();
    }
  }, [viewMode, camera, s]);

  return null;
}