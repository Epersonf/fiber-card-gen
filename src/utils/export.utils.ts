import * as THREE from 'three';

// ExportUtils: unified export/download helper following project class pattern
export class ExportUtils {
  // Use require to avoid TypeScript attempting to resolve example types at build time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private static _GLTFExporter: any = (() => {
    try {
      return require('three/examples/jsm/exporters/GLTFExporter').GLTFExporter;
    } catch (e) {
      return null;
    }
  })();

  static downloadText(filename: string, text: string, mime = 'text/plain') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportSceneGLB(scene: THREE.Scene, filename = 'scene.glb') {
    const tryExport = (ExporterClass: any) => {
      try {
        const exporter = new ExporterClass();
        const options = { binary: true, embedImages: true, truncateDrawRange: true };
        exporter.parse(scene, (result: any) => {
          let output: ArrayBuffer;
          if (result instanceof ArrayBuffer) output = result;
          else output = new TextEncoder().encode(JSON.stringify(result, null, 2)).buffer;

          const blob = new Blob([output], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, options);
        return true;
      } catch (e) {
        return false;
      }
    };

    if (ExportUtils._GLTFExporter) {
      if (tryExport(ExportUtils._GLTFExporter)) return;
    }

    // Fallback: dynamic import
    import('three/examples/jsm/exporters/GLTFExporter')
      .then((mod) => {
        const Exporter = mod.GLTFExporter;
        tryExport(Exporter);
      })
      .catch(() => {
        console.error('GLTFExporter not available in this environment.');
      });
  }
}
