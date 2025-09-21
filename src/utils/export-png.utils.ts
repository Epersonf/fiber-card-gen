import * as THREE from "three";

export class ExportPngUtils {

  public static downloadRenderTarget(
    renderer: THREE.WebGLRenderer,
    rt: THREE.WebGLRenderTarget,
    filename = "output.png",
    bgColorHex: string,
  ) {
    const w = rt.width, h = rt.height;
    const pixels = new Uint8Array(w * h * 4);

    // Ler pixels do render target
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, pixels);

    // Criar canvas e contexto
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    // Create ImageData and copy RGBA pixels (flip Y)
    const imageData = ctx.createImageData(w, h);

    // WebGL Y grows up, Canvas Y grows down: flip vertically
    for (let y = 0; y < h; y++) {
      const srcY = h - 1 - y;
      for (let x = 0; x < w; x++) {
        const srcIndex = (srcY * w + x) * 4;
        const dstIndex = (y * w + x) * 4;

        // Copy RGBA directly (use the alpha channel produced by the render target)
        imageData.data[dstIndex] = pixels[srcIndex];
        imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
        imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
        imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
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

}