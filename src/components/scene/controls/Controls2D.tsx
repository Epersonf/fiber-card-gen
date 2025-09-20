import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Controls2DUtils } from "../../../utils/controls2d.utils";

export default function Controls2D() {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const cleanup = Controls2DUtils.attach(gl, camera);
    return cleanup;
  }, [camera, gl]);

  return null;
}
