import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function DragPan() {
  const { camera, gl } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    let dragging = false, lastX = 0, lastY = 0;

    const sx = () => (camera.right - camera.left) / gl.domElement.clientWidth / camera.zoom;
    const sy = () => (camera.top - camera.bottom) / gl.domElement.clientHeight / camera.zoom;

    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      camera.position.x -= dx * sx();
      camera.position.y += dy * sy();
      camera.updateProjectionMatrix();
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    };

    const el = gl.domElement;
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [camera, gl]);
  return null;
}
