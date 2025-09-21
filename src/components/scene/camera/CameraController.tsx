import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraUtils } from "../../../utils/camera.utils";

export default function CameraController({ viewMode, viewW, viewH }: { viewMode: "2D" | "3D"; viewW: number; viewH: number; }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (viewMode === "2D" && camera instanceof THREE.OrthographicCamera) {
      // Adjust the ortho frustum to match the actual canvas aspect so the 2D view
      // doesn't get visually squashed when the browser viewport has a different aspect.
  const canvasAspect = size.width / Math.max(1, size.height);
      // compute adjusted world width/height so worldAspect == canvasAspect
      let w = viewW;
      let h = viewH;
      const worldAspect = viewW / Math.max(1, viewH);
      if (worldAspect > canvasAspect) {
        // world is wider than canvas -> increase height
        h = viewW / canvasAspect;
      } else {
        // world is taller than canvas -> increase width
        w = viewH * canvasAspect;
      }
      CameraUtils.resetOrtho(camera, w, h);
    }
    if (viewMode === "3D" && camera instanceof THREE.PerspectiveCamera) {
      CameraUtils.resetPerspective(camera, viewW, viewH, 60);
    }
  }, [viewMode, viewW, viewH, camera, size.width, size.height]);

  return null;
}
