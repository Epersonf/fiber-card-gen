declare module 'three/examples/jsm/exporters/GLTFExporter' {
  // Minimal declaration for GLTFExporter used by export.utils
  import { Object3D } from 'three';
  export class GLTFExporter {
    parse(input: Object3D | Object3D[], onCompleted: (result: ArrayBuffer | any) => void, options?: any): void;
  }
}
