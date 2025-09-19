import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildHairGroup } from "../hair/generator";
import { useStudio } from "../store/useStudio";
import { downloadRenderTarget } from "../utils/exportPng";

// Componente para capturar a cena e a câmera
function SceneSetup({ onSceneReady }: { onSceneReady: (scene: THREE.Scene, camera: THREE.OrthographicCamera) => void }) {
  const { scene, camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      onSceneReady(scene, camera);
    }
  }, [scene, camera, onSceneReady]);

  return null;
}

function SceneContent() {
  const s = useStudio();
  const group = useMemo(() => buildHairGroup(1234), [
    s.baseWidth, s.baseHeight, s.percentage, s.cardsPerSheet, s.marginPx,
    s.hair_amount_offset, s.strand_points_count, s.gradient_color_enabled,
    s.hair_color, s.glossiness, s.sheen,
    s.root_thickness, s.tip_thickness,
    s.fixed_length_size, s.combined_length, s.minimum_length, s.maximum_length,
    s.spread_amount_offset, s.clump_root, s.clump_tip,
    s.enable_frizz_hair, s.frizz_scale, s.frizz_curve_enabled, s.frizz_curve_points,
    s.enable_hair_curl, s.curl_count, s.curl_amount, s.curl_scale,
    s.enable_messiness_hair, s.messiness_strength, s.messiness_scale, s.messiness_starting_point, s.messiness_amount
  ]);

  // Center the hair group
  const bbox = useMemo(() => {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    return box;
  }, [group]);

  return <primitive object={group} />;
}

export default function HairScene() {
  const s = useStudio();
  const width = Math.floor(s.baseWidth * s.percentage);
  const height = Math.floor(s.baseHeight * s.percentage);

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null!);

  const colorRT = useMemo(() => new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }), [width, height]);

  const normalRT = useMemo(() => new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }), [width, height]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setSize(width, height, false);
    }
  }, [width, height]);

  const handleSceneReady = (scene: THREE.Scene, camera: THREE.OrthographicCamera) => {
    setScene(scene);
    setCamera(camera);
  };

  const cameraProps = {
    left: -width / 2,
    right: width / 2,
    top: height / 2,
    bottom: -height / 2,
    near: -1000,
    far: 1000,
    position: [0, 0, 10] as [number, number, number],
  };

  const handleRender = (target: THREE.WebGLRenderTarget, filename: string, clearColor: number, clearAlpha: number, setup?: () => void, cleanup?: () => void) => {
    if (!scene || !camera || !rendererRef.current) return;

    const r = rendererRef.current;

    // Coletar e ocultar todos os cardPlanes
    const cardPlanes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData?.isCardPlane) {
        cardPlanes.push(child);
        child.visible = false;
      }
    });

    if (setup) setup();

    r.setRenderTarget(target);
    r.setClearColor(clearColor, clearAlpha);
    r.clear();
    r.render(scene, camera);
    r.setRenderTarget(null);

    // Restaurar a visibilidade dos cardPlanes
    cardPlanes.forEach(child => {
      child.visible = true;
    });

    if (cleanup) cleanup();

    // Forçar um pequeno delay para garantir que o render target esteja pronto
    setTimeout(() => {
      downloadRenderTarget(r, target, filename);
    }, 100);
  };

  return (
    <div className="scene">
      <div className="toolbar">
        <button onClick={() => {
          const tempRT = new THREE.WebGLRenderTarget(width, height);
          handleRender(tempRT, "hair_card.png", 0x000000, 0.0);
          tempRT.dispose();
        }}>Download PNG</button>

        <button onClick={() => {
          handleRender(colorRT, "hair_color.png", 0x000000, 0.0);
        }}>Render Color</button>

        <button onClick={() => {
          const originalMaterials = new Map<THREE.Mesh, THREE.Material>();

          handleRender(
            normalRT,
            "hair_normal.png",
            0x8080ff,
            1.0,
            () => {
              // Switch to normal material for all meshes
              scene?.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  originalMaterials.set(child, child.material);
                  child.material = new THREE.MeshNormalMaterial();
                }
              });
            },
            () => {
              // Restore original materials
              scene?.traverse((child) => {
                if (child instanceof THREE.Mesh && originalMaterials.has(child)) {
                  child.material = originalMaterials.get(child)!;
                }
              });
            }
          );
        }}>Render Normal</button>
      </div>

      <Canvas
        orthographic
        camera={cameraProps}
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          rendererRef.current = gl;
        }}
      >
        <SceneSetup onSceneReady={handleSceneReady} />
        <color attach="background" args={["#1e1f22"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[0.5, 1, 1]} intensity={0.9} />
        <SceneContent />
      </Canvas>
    </div>
  );
}