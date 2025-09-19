import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function WheelZoom() {
  const { camera, gl } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 0.9 : 1.1;
      const z = THREE.MathUtils.clamp(camera.zoom * f, 0.05, 20);
      if (z !== camera.zoom) {
        camera.zoom = z;
        camera.updateProjectionMatrix();
      }
    };
    const el = gl.domElement;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [camera, gl]);
  return null;
}
