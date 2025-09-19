// src/components/HairScene.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildHairGroup } from "../hair/generator";
import { useStudio } from "../store/studio.store";
import DSButton from "./ui/ds-button/DSButton";
import SceneContainer from "./ui/scene-container/SceneContainer";
import Toolbar from "./ui/toolbar/Toolbar";
import { ExportPngUtils } from "../utils/export-png.utils";

function SceneSetup({ onSceneReady }: { onSceneReady: (scene: THREE.Scene, camera: THREE.OrthographicCamera) => void }) {
  const { scene, camera } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) onSceneReady(scene, camera);
  }, [scene, camera, onSceneReady]);
  return null;
}

function WheelZoom() {
  const { camera, gl } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const next = THREE.MathUtils.clamp(camera.zoom * factor, 0.05, 20);
      if (next !== camera.zoom) {
        camera.zoom = next;
        camera.updateProjectionMatrix();
      }
    };
    const el = gl.domElement;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [camera, gl]);
  return null;
}

function SceneContent() {
  const s = useStudio();
  const group = useMemo(
    () => buildHairGroup(1234),
    [
      s.baseWidth, s.baseHeight, s.percentage, s.cardsPerSheet, s.marginPx,
      s.hair_amount_offset, s.strand_points_count, s.gradient_color_enabled,
      s.hair_color, s.glossiness, s.sheen,
      s.root_thickness, s.tip_thickness,
      s.fixed_length_size, s.combined_length, s.minimum_length, s.maximum_length,
      s.spread_amount_offset, s.clump_root, s.clump_tip,
      s.enable_frizz_hair, s.frizz_scale, s.frizz_curve_enabled, s.frizz_curve_points,
      s.enable_hair_curl, s.curl_count, s.curl_amount, s.curl_scale,
      s.enable_messiness_hair, s.messiness_strength, s.messiness_scale, s.messiness_starting_point, s.messiness_amount
    ]
  );

  useMemo(() => {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    return box;
  }, [group]);

  return <primitive object={group} />;
}

export default function HairScene() {
  const s = useStudio();

  // Resolução de export (controlada por percentage)
  const exportW = Math.floor(s.baseWidth * s.percentage);
  const exportH = Math.floor(s.baseHeight * s.percentage);

  // Viewport fixo (independente de percentage)
  const viewW = s.baseWidth;
  const viewH = s.baseHeight;

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null!);

  const colorRT = useMemo(
    () =>
      new THREE.WebGLRenderTarget(exportW, exportH, {
        depthBuffer: false,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
      }),
    [exportW, exportH]
  );

  const normalRT = useMemo(
    () =>
      new THREE.WebGLRenderTarget(exportW, exportH, {
        depthBuffer: false,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
      }),
    [exportW, exportH]
  );

  const handleRender = (
    target: THREE.WebGLRenderTarget,
    filename: string,
    clearColor: number,
    clearAlpha: number,
    setup?: () => void,
    cleanup?: () => void,
    makeTransparent = true
  ) => {
    if (!scene || !camera || !rendererRef.current) return;
    const r = rendererRef.current;

    const cardPlanes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as any).userData?.isCardPlane) {
        cardPlanes.push(child);
        child.visible = false;
      }
    });

    setup?.();
    r.setRenderTarget(target);
    r.setClearColor(clearColor, clearAlpha);
    r.clear();
    r.render(scene, camera);
    r.setRenderTarget(null);
    cardPlanes.forEach((c) => (c.visible = true));
    cleanup?.();

    setTimeout(() => ExportPngUtils.downloadRenderTarget(r, target, filename, makeTransparent), 100);
  };

  const cameraProps = {
    left: -viewW / 2,
    right: viewW / 2,
    top: viewH / 2,
    bottom: -viewH / 2,
    near: -1000,
    far: 1000,
    position: [0, 0, 10] as [number, number, number],
  };

  return (
    <SceneContainer>
      <Toolbar>
        <DSButton
          onClick={() =>
            handleRender(colorRT, "hair_color.png", 0x000000, 0.0, undefined, undefined, true)
          }
        >
          Render Color
        </DSButton>

        <DSButton
          onClick={() => {
            const originalMaterials = new Map<THREE.Mesh, THREE.Material>();
            handleRender(
              normalRT,
              "hair_normal.png",
              0x8080ff,
              1.0,
              () => {
                scene?.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    originalMaterials.set(child, child.material);
                    child.material = new THREE.MeshNormalMaterial();
                  }
                });
              },
              () => {
                scene?.traverse((child) => {
                  if (child instanceof THREE.Mesh && originalMaterials.has(child)) {
                    child.material = originalMaterials.get(child)!;
                  }
                });
              },
              false
            );
          }}
        >
          Render Normal
        </DSButton>
      </Toolbar>

      <Canvas
        orthographic
        camera={cameraProps}
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          (rendererRef as any).current = gl;
        }}
      >
        <SceneSetup onSceneReady={(sc, cam) => { setScene(sc); setCamera(cam); }} />
        <WheelZoom />
        <color attach="background" args={["#1e1f22"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[0.5, 1, 1]} intensity={0.9} />
        <SceneContent />
      </Canvas>
    </SceneContainer>
  );
}
