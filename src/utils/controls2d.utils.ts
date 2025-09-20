import * as THREE from "three";

export class Controls2DUtils {
  /** Anexa pan+zoom ao canvas; retorna função de cleanup. */
  static attach(gl: THREE.WebGLRenderer, cam: THREE.OrthographicCamera) {
    let dragging = false, lastX = 0, lastY = 0;

    const scaleX = () => (cam.right - cam.left) / gl.domElement.clientWidth / cam.zoom;
    const scaleY = () => (cam.top - cam.bottom) / gl.domElement.clientHeight / cam.zoom;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      cam.position.x -= dx * scaleX();
      cam.position.y += dy * scaleY();
      cam.updateProjectionMatrix();
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 0.9 : 1.1;
      const z = THREE.MathUtils.clamp(cam.zoom * f, 0.05, 20);
      if (z !== cam.zoom) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
      }
    };

    const el = gl.domElement;
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }
}
