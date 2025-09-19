import React, { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useStudio } from "../store/studio.store";
import SceneContainer from "./ui/scene-container/SceneContainer";
import { ExportPngUtils } from "../utils/export-png.utils";
import SceneSetup from "./scene/SceneSetup";
import WheelZoom from "./scene/WheelZoom";
import DragPan from "./scene/DragPan";
import SceneContent from "./scene/SceneContent";
import RenderToolbar from "./scene/RenderToolbar";
import Lights from "./scene/Lights";

export default function HairScene() {
  const s = useStudio();
  const exportW = Math.floor(s.baseWidth * s.percentage);
  const exportH = Math.floor(s.baseHeight * s.percentage);
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
    transparent = true
  ) => {
    if (!scene || !camera || !rendererRef.current) return;
    const r = rendererRef.current;

    const planes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as any).userData?.isCardPlane) {
        planes.push(child);
        child.visible = false;
      }
    });

    setup?.();
    r.setRenderTarget(target);
    r.setClearColor(clearColor, clearAlpha);
    r.clear();
    r.render(scene, camera);
    r.setRenderTarget(null);
    planes.forEach((c) => (c.visible = true));
    cleanup?.();

    setTimeout(() => ExportPngUtils.downloadRenderTarget(r, target, filename, transparent), 100);
  };

  const renderColor = () =>
    handleRender(colorRT, "hair_color.png", 0x000000, 0.0, undefined, undefined, true);

  const renderNormal = () => {
    const originals = new Map<THREE.Mesh, THREE.Material>();
    handleRender(
      normalRT,
      "hair_normal.png",
      0x8080ff,
      1.0,
      () => {
        scene?.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            originals.set(child, child.material);
            child.material = new THREE.MeshNormalMaterial();
          }
        });
      },
      () => {
        scene?.traverse((child) => {
          if (child instanceof THREE.Mesh && originals.has(child)) {
            child.material = originals.get(child)!;
          }
        });
      },
      false
    );
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
      <RenderToolbar onRenderColor={renderColor} onRenderNormal={renderNormal} />
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
        <DragPan />
        <color attach="background" args={["#1e1f22"]} />
        <Lights />
        <SceneContent />
      </Canvas>
    </SceneContainer>
  );
}
