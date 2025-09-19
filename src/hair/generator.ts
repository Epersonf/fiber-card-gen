import * as THREE from "three";
import { type Vector3 } from "three";
import { useStudio } from "../store/studio.store";

/** Gera curvas (fios) e retorna um Group com InstancedMeshes de TubeGeometry. */
export function buildHairGroup(seed = 1): THREE.Group {
  const s = useStudio.getState();
  const g = new THREE.Group();

  // Quantidade de fios por carta (base 0 + offset)
  const baseAmount = 18; // valor base "template"; offset aplica delta como no addon
  const strands = Math.max(1, baseAmount + s.hair_amount_offset);
  const points = Math.max(2, s.strand_points_count);

  // Calcular layout do grid automaticamente
  const gridCols = Math.ceil(Math.sqrt(s.cardsPerSheet));
  const gridRows = Math.ceil(s.cardsPerSheet / gridCols);

  // grid de cartas
  const W = s.baseWidth * s.percentage;
  const H = s.baseHeight * s.percentage;
  const cellW = (W - (gridCols + 1) * s.marginPx) / gridCols;
  const cellH = (H - (gridRows + 1) * s.marginPx) / gridRows;

  // Geometria base de um fio (usamos TubeGeometry sobre uma curva gerada)
  const radiusRoot = thicknessToRadiusPx(s.root_thickness, cellW);
  const radiusTip = thicknessToRadiusPx(Math.max(0, s.tip_thickness), cellW);
  const radialSegments = 6;

  // RNG determinístico simples
  const rand = mulberry32(seed);

  // Para cada "carta"
  let cardIdx = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (cardIdx >= s.cardsPerSheet) break;

      const card = new THREE.Group();
      // Plano de fundo "cartão" (apenas referência no preview; não render no export)
      const cardPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(cellW, cellH),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
      );
      cardPlane.userData.isCardPlane = true; // Adicionar esta linha
      cardPlane.position.set(0, 0, 0);
      card.add(cardPlane);

      // InstancedMesh para fios desta carta
      const tubeGeo = new THREE.InstancedBufferGeometry();
      // Notas:
      //  - Para performance, criamos uma geometria "template" por fio e instanciamos.
      //  - Como TubeGeometry depende da curva, geramos por-fio e "mergeamos" seria caro.
      //  - Aqui, criamos Mesh normal por fio. Para grandes quantidades, otimizar com SDF/stroke shader.
      const strandGroup = new THREE.Group();

      for (let i = 0; i < strands; i++) {
        const maxRadiusPx = Math.max(
          thicknessToRadiusPx(s.root_thickness, cellW),
          thicknessToRadiusPx(s.tip_thickness, cellW)
        );
        const basePad = cellH * 0.09;
        const padTop = basePad + maxRadiusPx;
        const padBot = basePad + maxRadiusPx;
        const usableH = Math.max(1, cellH - padTop - padBot);
        const curve = makeStrandCurve(points, cellW, usableH, padBot, rand, s);
        curve[0].y = padBot;
        curve[curve.length - 1].y = cellH - padTop;
        const path = new THREE.CatmullRomCurve3(curve, false, "centripetal", 0.0);
        const tubularSegments = points * 3;
        const tube = new THREE.TubeGeometry(
          path,
          tubularSegments,
          lerp(radiusRoot, radiusTip, 0.5),
          8, // radialSegments
          false
        );

        // Center the geometry
        tube.computeBoundingBox();
        const center = new THREE.Vector3();
        tube.boundingBox!.getCenter(center);
        tube.translate(-center.x, -center.y, -center.z);

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(...s.hair_color.slice(0, 3) as [number, number, number]),
          metalness: s.glossiness,
          roughness: 1 - s.sheen,
        });
        const mesh = new THREE.Mesh(tube, mat);
        strandGroup.add(mesh);
      }

      // Center the hair within the card
      const bbox = new THREE.Box3().setFromObject(strandGroup);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      strandGroup.position.sub(center);

      card.add(strandGroup);

      // posiciona a carta na folha (em coordenadas do mundo; a câmera ortho enquadra a folha)
      const x = -W / 2 + s.marginPx + cellW / 2 + c * (cellW + s.marginPx);
      const y = H / 2 - s.marginPx - cellH / 2 - r * (cellH + s.marginPx);
      card.position.set(x, y, 0);

      g.add(card);
      cardIdx++;
    }
  }

  return g;
}

/** Gera pontos da curva de um fio, com comprimento, clumping, frizz, curl e messiness aproximados. */
function makeStrandCurve(points: number, cellW: number, usableH: number, padBot: number, rand: () => number, s = useStudio.getState()): THREE.Vector3[] {
  const arr: Vector3[] = [];
  const len = s.fixed_length_size ? s.combined_length : lerp(s.minimum_length, s.maximum_length, rand());
  const total = Math.max(2, points);

  // escalas independentes
  const yScale = usableH / Math.max(1e-3, (s.fixed_length_size ? s.combined_length : s.maximum_length || len));
  const xMaxBase = cellW * 0.33; // metade da largura útil do card

  for (let i = 0; i < total; i++) {
    const t = i / (total - 1); // 0..1
    const y = t * len;

    // spread/clump em pixels do card
    const clumpT = THREE.MathUtils.clamp(
      (t * s.clump_tip + (1.0 - t) * s.clump_root) / Math.max(1.0, s.clump_root + s.clump_tip),
      0, 1
    );
    const spreadK = (s.spread_amount_offset / 50) * (1.0 - clumpT); // -50..50 -> -1..1 aprox
    const baseX = (rand() - 0.5) * xMaxBase * spreadK;

    // curl
    const curlAmp = (s.enable_hair_curl ? s.curl_amount : 0) * 0.02 * xMaxBase;
    const curlFreq = Math.max(0.0001, s.curl_scale * 4 + s.curl_count);
    const curlX = curlAmp * Math.sin(t * Math.PI * curlFreq);

    // frizz
    const frizzAmp = (s.enable_frizz_hair ? s.frizz_scale : 0) * 0.03 * xMaxBase;
    const frizz = (rand() - 0.5) * frizzAmp * frizzCurve(t, s);

    // messiness
    const mess = (s.enable_messiness_hair && t >= s.messiness_starting_point)
      ? (rand() - 0.5) * (s.messiness_strength * 0.02) * xMaxBase
      : 0;

    const x = baseX + curlX + frizz + mess;
    arr.push(new THREE.Vector3(x, padBot + y * yScale, 0));
  }

  // leve afunilamento na ponta
  const tip = arr[arr.length - 1];
  tip.x *= 0.8;

  return arr;
}


// curva de frizz baseada em pontos (0..1)
function frizzCurve(t: number, s = useStudio.getState()): number {
  const pts = s.frizz_curve_points;
  if (pts.length < 2) return t;
  // LERP piecewise
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (t >= a.x && t <= b.x) {
      const u = (t - a.x) / (b.x - a.x);
      return lerp(a.y, b.y, u);
    }
  }
  return pts[pts.length - 1].y;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, a: number, b: number) { return Math.min(b, Math.max(a, v)); }
function remap(x: number, a: number, b: number, c: number, d: number) { return c + (x - a) * (d - c) / (b - a); }

function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function thicknessToRadiusPx(t: number, cellW: number) {
  // 0.25px mínimo para aparecer; escala aproximada do addon
  return Math.max(0.25, t * cellW * 0.20);
}
