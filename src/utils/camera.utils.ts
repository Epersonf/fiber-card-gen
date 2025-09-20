import * as THREE from "three";

export class CameraUtils {
  static createDefaultOrtho(viewW: number, viewH: number) {
    const cam = new THREE.OrthographicCamera(
      -viewW / 2, viewW / 2, viewH / 2, -viewH / 2, -10000, 10000
    );
    cam.position.set(0, 0, 10);
    cam.zoom = 1;
    cam.updateProjectionMatrix();
    return cam;
  }

  static resetOrtho(cam: THREE.OrthographicCamera, viewW: number, viewH: number) {
    cam.zoom = 1;
    cam.position.set(0, 0, 10);
    cam.left = -viewW / 2;
    cam.right = viewW / 2;
    cam.top = viewH / 2;
    cam.bottom = -viewH / 2;
    cam.near = -10000;
    cam.far = 10000;
    cam.updateProjectionMatrix();
  }

  static framePerspectiveToBox(
    cam: THREE.PerspectiveCamera,
    box: THREE.Box3,
    viewW: number,
    viewH: number,
    fov = 60,
    margin = 1.1
  ) {
    cam.fov = fov;
    cam.near = 0.1;
    cam.far = 100000;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // const targetW = Math.max(size.x, viewW);
    const targetH = Math.max(size.y, viewH);
    const halfH = (targetH * margin) / 2;
    const dist = halfH / Math.tan(THREE.MathUtils.degToRad(fov / 2));

    cam.position.set(center.x, center.y, center.z + dist);
    cam.lookAt(center);
    cam.updateProjectionMatrix();
  }

  static resetPerspective(cam: THREE.PerspectiveCamera, viewW: number, viewH: number, fov = 60) {
    const box = new THREE.Box3(
      new THREE.Vector3(-viewW / 2, -viewH / 2, -0.5),
      new THREE.Vector3(viewW / 2, viewH / 2, 0.5)
    );
    this.framePerspectiveToBox(cam, box, viewW, viewH, fov, 1.1);
  }
}
