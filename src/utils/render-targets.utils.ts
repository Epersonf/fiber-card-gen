import * as THREE from "three";

export class RenderTargetsUtils {
  static makeRT(w: number, h: number) {
    return new THREE.WebGLRenderTarget(w, h, {
      depthBuffer: false,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
    });
  }

  static makePair(w: number, h: number) {
    return {
      colorRT: this.makeRT(w, h),
      normalRT: this.makeRT(w, h),
    };
  }
}
