import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useStudio } from "../store/studio.store";
import SceneContainer from "./ui/scene-container/SceneContainer";
import SceneSetup from "./scene/SceneSetup";
import SceneContent from "./scene/SceneContent";
import RenderToolbar from "./scene/RenderToolbar";
import Lights from "./scene/Lights";
import ViewModeToggle from "./scene/ViewModeToggle";
import CameraController from "./scene/camera/CameraController";
import Controls2D from "./scene/controls/Controls2D";
import Controls3D from "./scene/controls/Controls3D";
import { useRenderTargets } from "./scene/render/useRenderTargets";
import { SceneRendererUtils } from "../utils/scene-renderer.utils";
import LightGizmos from "./scene/LightGizmos";
import SpawnPlaneGizmo from "./scene/SpawnPlaneGizmo";
import FrameGizmo2D from "./scene/FrameGizmo2D";

export default function HairScene() {
  const s = useStudio();

  const exportW = Math.floor(s.baseWidth * s.percentage);
  const exportH = Math.floor(s.baseHeight * s.percentage);
  const viewW = s.baseWidth;
  const viewH = s.baseHeight;

  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const { colorRT, normalRT } = useRenderTargets(exportW, exportH);

  const cameraProps = viewMode === "2D"
    ? {
      orthographic: true as const,
      camera: {
        left: -viewW / 2, right: viewW / 2, top: viewH / 2, bottom: -viewH / 2,
        near: -10000, far: 10000, position: [0, 0, 10] as [number, number, number],
      },
    }
    : {
      orthographic: false as const,
      camera: { fov: 60, near: 0.1, far: 100000, position: [0, 0, 1000] as [number, number, number] },
    };
  const bg = s.background_color;
  return (
    <SceneContainer>
      <RenderToolbar
        onRenderColor={() => {
          if (scene && rendererRef.current) {
            // Export sempre com visão 2D padrão e resolução da store
            SceneRendererUtils.renderColor2DDefault(scene, rendererRef.current, colorRT, exportW, exportH, bg);
          }
        }}
        onRenderNormal={() => {
          if (scene && rendererRef.current) {
            SceneRendererUtils.renderNormal2DDefault(scene, rendererRef.current, normalRT, exportW, exportH, bg);
          }
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

      <Canvas
        shadows
        key={viewMode}
        orthographic={cameraProps.orthographic}
        camera={cameraProps.camera as any}
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.7;
          rendererRef.current = gl;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.VSMShadowMap;
          setScene(scene);
          setCamera(camera);
        }}
      >
        <CameraController viewMode={viewMode} viewW={viewW} viewH={viewH} />
        <SceneSetup onSceneReady={(sc, cam) => { setScene(sc); setCamera(cam); }} />
        {viewMode === "2D" ? <Controls2D /> : <Controls3D />}

        <color attach="background" args={[bg]} />
        <Lights />
        <LightGizmos enabled={viewMode === "3D"} />
        <SpawnPlaneGizmo enabled={viewMode === "3D"} />
        {viewMode === "2D" && <FrameGizmo2D targetW={exportW} targetH={exportH} />}
        <SceneContent />
      </Canvas>
    </SceneContainer>
  );
}
