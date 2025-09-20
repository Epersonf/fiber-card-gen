import * as THREE from "three";
import { ExportPngUtils } from "./export-png.utils";
import { CameraUtils } from "./camera.utils";

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

  static renderColor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) {
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_color.png", true), 75);
  }

  static renderNormal(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) {
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const backup = scene.overrideMaterial;

    scene.overrideMaterial = new THREE.MeshNormalMaterial();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    scene.overrideMaterial = backup;
    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_normal.png", false), 75);
  }

  /** Render color usando SEMPRE a visão 2D padrão (ignora zoom/pan atuais). */
  static renderColor2DDefault(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    viewW: number,
    viewH: number
  ) {
    const cam = CameraUtils.createDefaultOrtho(viewW, viewH);
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_color.png", true), 75);
  }

  /** Render normal usando SEMPRE a visão 2D padrão (ignora zoom/pan atuais). */
  static renderNormal2DDefault(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    viewW: number,
    viewH: number
  ) {
    const cam = CameraUtils.createDefaultOrtho(viewW, viewH);
    const hidden = this.hideCardPlanes(scene);
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const backup = scene.overrideMaterial;
    scene.overrideMaterial = new THREE.MeshNormalMaterial();

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    renderer.setClearColor(oldClear, oldAlpha);

    scene.overrideMaterial = backup;
    this.restoreVisibility(hidden);
    setTimeout(() => ExportPngUtils.downloadRenderTarget(renderer, target, "hair_normal.png", false), 75);
  }
}