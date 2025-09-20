import * as THREE from "three";
import { useCallback } from "react";
import { SceneRendererUtils } from "../../../utils/scene-renderer.utils";

type Args = { scene: THREE.Scene | null; camera: THREE.Camera | null; renderer: THREE.WebGLRenderer | null; };

export function useSceneRenderer({ scene, camera, renderer }: Args) {
  const renderColor = useCallback((target: THREE.WebGLRenderTarget) => {
    if (!scene || !camera || !renderer) return;
    SceneRendererUtils.renderColor(scene, camera, renderer, target);
  }, [scene, camera, renderer]);

  const renderNormal = useCallback((target: THREE.WebGLRenderTarget) => {
    if (!scene || !camera || !renderer) return;
    SceneRendererUtils.renderNormal(scene, camera, renderer, target);
  }, [scene, camera, renderer]);

  return { renderColor, renderNormal };
}
