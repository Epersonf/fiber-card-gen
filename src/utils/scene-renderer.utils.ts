import * as THREE from "three";
import { ExportPngUtils } from "./export-png.utils";
import { CameraUtils } from "./camera.utils";
import { useStudio } from "../store/studio.store";

export class SceneRendererUtils {
  static hideCardPlanes(scene: THREE.Scene): THREE.Object3D[] {
    const planes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as any).userData?.isCardPlane) {
        planes.push(child);
        child.visible = false;
      }
      // Hide the frame gizmo only for exports / when debug mode is OFF
      if (!require("./constants").Constants.DEBUG_MODE && (child as any).userData?.isFrameGizmo) {
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

    // avoid drawing the scene background into the export RT so alpha is preserved
    const oldBackground = scene.background;

    renderer.setRenderTarget(target);
    scene.background = null;
    renderer.setClearColor(0x000000 as any, 0);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    scene.background = oldBackground;
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

    // avoid drawing the scene background into the export RT so alpha is preserved
    const oldBackground = scene.background;

    renderer.setRenderTarget(target);
    scene.background = null;
    // clear to transparent (keep RGB if needed in shader, alpha=0)
    renderer.setClearColor(0x8080ff as any, 0);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    scene.background = oldBackground;
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
      CameraUtils.frameOrthoToBox(cam, hb, viewW, viewH, 1.06);
      
      // Apply export camera settings
      const studio = useStudio.getState();
      cam.position.x -= studio.exportCameraOffset.x;
      const empiricBaseOffsetPNGFromWebGL = viewH * 0.15;
      cam.position.y -= empiricBaseOffsetPNGFromWebGL;
      cam.zoom = 1 / studio.exportCameraScale;
      cam.updateProjectionMatrix();
    }

    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const oldTone = (renderer as any).toneMapping;
    const oldExposure = (renderer as any).toneMappingExposure;

    // Ensure we render with a transparent background and no tone mapping for export
    (renderer as any).toneMapping = THREE.NoToneMapping;
    (renderer as any).toneMappingExposure = 1.0;

  // avoid drawing the scene background into the export RT so alpha is preserved
  const oldBackground = scene.background;

  // use the user-configured background color/alpha when clearing the RT
  const studio = useStudio.getState();
  const bgColor = new THREE.Color(studio.background_color || '#000000');
  const bgAlpha = typeof studio.background_alpha === 'number' ? studio.background_alpha : 0;

  renderer.setRenderTarget(target);
  scene.background = null;
  // clear with configured color & alpha (alpha=0 keeps transparency)
  renderer.setClearColor(bgColor, bgAlpha);
  renderer.clear(true, true, true);
  renderer.render(scene, cam);
  renderer.setRenderTarget(null);
  scene.background = oldBackground;

    // restore
    renderer.setClearColor(oldClear, oldAlpha);
    (renderer as any).toneMapping = oldTone;
    (renderer as any).toneMappingExposure = oldExposure;

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
      CameraUtils.frameOrthoToBox(cam, hb, viewW, viewH, 1.06);
      
      // Apply export camera settings
      const studio = useStudio.getState();
      cam.position.x -= studio.exportCameraOffset.x;
      cam.position.y -= viewH * 0.15; // Offset fixo de 15% da altura
      cam.zoom = 1 / studio.exportCameraScale;
      cam.updateProjectionMatrix();
    }

    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const backup = scene.overrideMaterial;

    scene.overrideMaterial = new THREE.MeshNormalMaterial();

    // avoid drawing the scene background into the export RT so alpha is preserved
    const oldBackground = scene.background;

    renderer.setRenderTarget(target);
    scene.background = null;
    renderer.setClearColor(new THREE.Color(bgColorHex), 0);
    renderer.clear(true, true, true);
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    scene.background = oldBackground;
    renderer.setClearColor(oldClear, oldAlpha);

    scene.overrideMaterial = backup;
    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_normal.png", bgColorHex), 75);
  }
}
