import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraUtils } from "../../../utils/camera.utils";

export default function CameraController({ viewMode, viewW, viewH }: { viewMode: "2D" | "3D"; viewW: number; viewH: number; }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === "2D" && camera instanceof THREE.OrthographicCamera) {
      CameraUtils.resetOrtho(camera, viewW, viewH);
    }
    if (viewMode === "3D" && camera instanceof THREE.PerspectiveCamera) {
      CameraUtils.resetPerspective(camera, viewW, viewH, 60);
    }
  }, [viewMode, viewW, viewH, camera]);

  return null;
}
