import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { buildHairGroup } from "../hair/generator";
import { useStudio } from "../store/useStudio";
import { downloadRenderTarget } from "../utils/exportPng";

function SceneContent() {
  const s = useStudio();
  const group = useMemo(() => buildHairGroup(1234), [
    s.baseWidth, s.baseHeight, s.percentage, s.cardsPerSheet, s.cols, s.rows,
    s.hair_amount_offset, s.strand_points_count, s.gradient_color_enabled,
    s.hair_color, s.glossiness, s.sheen,
    s.root_thickness, s.tip_thickness,
    s.fixed_length_size, s.combined_length, s.minimum_length, s.maximum_length,
    s.spread_amount_offset, s.clump_root, s.clump_tip,
    s.enable_frizz_hair, s.frizz_scale, s.frizz_curve_enabled, s.frizz_curve_points,
    s.enable_hair_curl, s.curl_count, s.curl_amount, s.curl_scale,
    s.enable_messiness_hair, s.messiness_strength, s.messiness_scale, s.messiness_starting_point, s.messiness_amount
  ]);
  return <primitive object={group} />;
}

export default function HairScene() {
  const s = useStudio();
  const width = Math.floor(s.baseWidth * s.percentage);
  const height = Math.floor(s.baseHeight * s.percentage);

  const rendererRef = useRef<THREE.WebGLRenderer>(null!);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const colorRT = useMemo(() => new THREE.WebGLRenderTarget(width, height, { depthBuffer: false }), [width, height]);
  const normalRT = useMemo(() => new THREE.WebGLRenderTarget(width, height, { depthBuffer: false }), [width, height]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setSize(width, height, false);
    }
  }, [width, height]);

  const cameraProps = {
    left: -width / 2,
    right: width / 2,
    top: height / 2,
    bottom: -height / 2,
    near: -1000,
    far: 1000,
    position: [0, 0, 10] as [number, number, number],
  };

  return (
    <div className="scene">
      <div className="toolbar">
        <button onClick={() => {
          const r = rendererRef.current;
          const cam = (r as any).__fiber?.store.getState().get().camera as THREE.OrthographicCamera;
          r.setRenderTarget(colorRT);
          r.setClearColor(0x000000, 0.0);
          r.render(sceneRef.current, cam);
          r.setRenderTarget(null);
          downloadRenderTarget(r, colorRT, "hair_color.png");
        }}>Render Color</button>

        <button onClick={() => {
          const r = rendererRef.current;
          const cam = (r as any).__fiber?.store.getState().get().camera as THREE.OrthographicCamera;
          r.setRenderTarget(normalRT);
          r.setClearColor(0x8080ff, 1.0);
          r.render(sceneRef.current, cam);
          r.setRenderTarget(null);
          downloadRenderTarget(r, normalRT, "hair_normal.png");
        }}>Render Normal</button>
      </div>

      <Canvas
        orthographic
        camera={cameraProps}
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}   // <- aqui
      >
        <color attach="background" args={["#1e1f22"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[0.5, 1, 1]} intensity={0.9} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
