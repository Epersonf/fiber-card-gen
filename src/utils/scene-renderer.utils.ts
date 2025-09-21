import * as THREE from "three";
import { ExportPngUtils } from "./export-png.utils";
import { CameraUtils } from "./camera.utils";
import { useStudio } from "../store/studio.store";
import { EXPORT_FRAME_MARGIN } from "./constants";

export class SceneRendererUtils {
  static hideCardPlanes(scene: THREE.Scene): THREE.Object3D[] {
    const planes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as any).userData?.isCardPlane) {
        planes.push(child);
        child.visible = false;
      }
    });
    return planes;
  }

  static restoreVisibility(objs: THREE.Object3D[]) {
    objs.forEach((o) => (o.visible = true));
  }

  /** Calcula bounding box agregada apenas dos fios (objetos com userData.isHair). */
  static hairBounds(scene: THREE.Scene) {
    const box = new THREE.Box3();
    let found = false;
    scene.traverse((o) => {
      if ((o as any).userData?.isHair) {
        const b = new THREE.Box3().setFromObject(o);
        if (!b.isEmpty()) {
          box.union(b);
          found = true;
        }
      }
    });
    return found ? box : null;
  }

  static renderColor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget
  ) {
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000 as any, 0);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_color.png", "#00ff00"), 75);
  }

  static renderNormal(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget
  ) {
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const backup = scene.overrideMaterial;

    scene.overrideMaterial = new THREE.MeshNormalMaterial();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x8080ff as any, 1);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    scene.overrideMaterial = backup;
    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_normal.png", "#00ff00"), 75);
  }

  /** Render color usando SEMPRE visão 2D, enquadrando TODOS os fios, com fundo keyável. */
  static renderColor2DDefault(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    viewW: number,
    viewH: number,
    bgColorHex: string
  ) {
    const cam = CameraUtils.createDefaultOrtho(viewW, viewH);
    const hb = this.hairBounds(scene);
    if (hb) {
      // Compute bounds in world units and apply margin
      const size = new THREE.Vector3();
      hb.getSize(size);
      const center = new THREE.Vector3();
      hb.getCenter(center);

      const margin = EXPORT_FRAME_MARGIN;
      let w = size.x * margin;
      let h = size.y * margin;

      const targetAspect = viewW / Math.max(1, viewH);
      const boxAspect = w / Math.max(1e-6, h);
      if (boxAspect > targetAspect) {
        h = w / targetAspect;
      } else {
        w = h * targetAspect;
      }

      const studio = useStudio.getState();
      // Scale the frame (world units)
      w *= studio.exportCameraScale;
      h *= studio.exportCameraScale;

      // Offset the center by the configured exportCameraOffset (world units)
      const cx = center.x - studio.exportCameraOffset.x;
      const cy = center.y - studio.exportCameraOffset.y;

      cam.left = cx - w / 2;
      cam.right = cx + w / 2;
      cam.top = cy + h / 2;
      cam.bottom = cy - h / 2;

      cam.near = -10000;
      cam.far = 10000;
      cam.position.set(cx, cy, 10);
      cam.zoom = 1; // keep 1 since frame already scaled
      cam.updateProjectionMatrix();
    }

    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(target);
    renderer.setClearColor(new THREE.Color(bgColorHex), 1);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_color.png", bgColorHex), 75);
  }

  /** Render normal usando SEMPRE visão 2D, enquadrando TODOS os fios, com fundo keyável. */
  static renderNormal2DDefault(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    viewW: number,
    viewH: number,
    bgColorHex: string
  ) {
    const cam = CameraUtils.createDefaultOrtho(viewW, viewH);
    const hb = this.hairBounds(scene);
    if (hb) {
      const size = new THREE.Vector3();
      hb.getSize(size);
      const center = new THREE.Vector3();
      hb.getCenter(center);

      const margin = EXPORT_FRAME_MARGIN;
      let w = size.x * margin;
      let h = size.y * margin;

      const targetAspect = viewW / Math.max(1, viewH);
      const boxAspect = w / Math.max(1e-6, h);
      if (boxAspect > targetAspect) {
        h = w / targetAspect;
      } else {
        w = h * targetAspect;
      }

      const studio = useStudio.getState();
      w *= studio.exportCameraScale;
      h *= studio.exportCameraScale;

      const cx = center.x - studio.exportCameraOffset.x;
      const cy = center.y - studio.exportCameraOffset.y;

      cam.left = cx - w / 2;
      cam.right = cx + w / 2;
      cam.top = cy + h / 2;
      cam.bottom = cy - h / 2;

      cam.near = -10000;
      cam.far = 10000;
      cam.position.set(cx, cy, 10);
      cam.zoom = 1;
      cam.updateProjectionMatrix();
    }

    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const backup = scene.overrideMaterial;

    scene.overrideMaterial = new THREE.MeshNormalMaterial();

    renderer.setRenderTarget(target);
    renderer.setClearColor(new THREE.Color(bgColorHex), 1);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    scene.overrideMaterial = backup;
    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_normal.png", bgColorHex), 75);
  }
}
