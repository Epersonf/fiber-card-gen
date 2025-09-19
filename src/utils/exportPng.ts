import * as THREE from "three";

export function downloadRenderTarget(renderer: THREE.WebGLRenderer, rt: THREE.WebGLRenderTarget, filename = "output.png") {
  const w = rt.width, h = rt.height;
  const pixels = new Uint8Array(w * h * 4);

  // Ler pixels do render target
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, pixels);

  // Criar canvas e contexto
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Criar ImageData
  const imageData = ctx.createImageData(w, h);

  // Copiar e inverter verticalmente os pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIndex = (y * w + x) * 4;
      const dstIndex = ((h - 1 - y) * w + x) * 4;

      imageData.data[dstIndex] = pixels[srcIndex];     // R
      imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
      imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
      imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
    }
  }

  // Desenhar no canvas
  ctx.putImageData(imageData, 0, 0);

  // Criar download link
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}