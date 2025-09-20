import { useMemo } from "react";
import { RenderTargetsUtils } from "../../../utils/render-targets.utils";

export function useRenderTargets(w: number, h: number) {
  return useMemo(() => RenderTargetsUtils.makePair(w, h), [w, h]);
}
