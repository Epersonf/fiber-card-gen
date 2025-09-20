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

    // Criar ImageData
    const R = parseInt(bgColorHex.slice(1, 3), 16);
    const G = parseInt(bgColorHex.slice(3, 5), 16);
    const B = parseInt(bgColorHex.slice(5, 7), 16);
    const tol2 = 2 * 2; // tolerância^2 (2 níveis)
    const imageData = ctx.createImageData(w, h);

    // Copiar e inverter verticalmente os pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIndex = (y * w + x) * 4;
        const dstIndex = ((h - 1 - y) * w + x) * 4;

        const r = pixels[srcIndex];
        const g = pixels[srcIndex + 1];
        const b = pixels[srcIndex + 2];
        const a = pixels[srcIndex + 3];

        const dr = r - R, dg = g - G, db = b - B;
        const isBg = (dr * dr + dg * dg + db * db) <= tol2;
        const newAlpha = isBg ? 0 : a;

        imageData.data[dstIndex] = r;
        imageData.data[dstIndex + 1] = g;
        imageData.data[dstIndex + 2] = b;
        imageData.data[dstIndex + 3] = newAlpha;
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