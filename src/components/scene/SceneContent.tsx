import { useMemo } from "react";
import * as THREE from "three";
import { useStudio } from "../../store/studio.store";
import { HairBuilder } from "../../hair/hair-builder";

export default function SceneContent() {
  const s = useStudio();
  const group = useMemo(() => HairBuilder.build(1234, s), [s]);

  return <primitive object={group} />;
}
