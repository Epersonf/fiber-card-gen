import * as THREE from "three";

export function downloadRenderTarget(renderer: THREE.WebGLRenderer, rt: THREE.WebGLRenderTarget, filename = "output.png") {
  const w = rt.width, h = rt.height;
  const pixels = new Uint8Array(w * h * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, pixels);

  // Flip Y
  const flipped = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const src = y * w * 4;
    const dst = (h - 1 - y) * w * 4;
    flipped.set(pixels.subarray(src, src + w * 4), dst);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imgData = new ImageData(flipped, w, h);
  ctx.putImageData(imgData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}
