import * as THREE from "three";

export function downloadRenderTarget(renderer: THREE.WebGLRenderer, rt: THREE.WebGLRenderTarget, filename = "output.png") {
  const w = rt.width, h = rt.height;
  const pixels = new Uint8Array(w * h * 4);

  renderer.readRenderTargetPixels(rt, 0, 0, w, h, pixels);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const imageData = ctx.createImageData(w, h);

  // Flip Y and set pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIndex = (y * w + x) * 4;
      const dstIndex = ((h - 1 - y) * w + x) * 4;

      imageData.data[dstIndex] = pixels[srcIndex];
      imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
      imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
      imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
    }
  }

  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, "image/png");
}