/**
 * Cena 3D da Hiperlink: torre de servidores com LEDs, malha de rede ao redor,
 * cabos amarelos (referência ao cabo do logo) e pacotes de dados trafegando.
 */
import * as THREE from 'three';
import type { SceneFactory } from '../common/WebGLStage';
import { createLoop, createRenderer, makeGlowTexture } from './shared';

const YELLOW = new THREE.Color('#ffd400');
const WHITE = new THREE.Color('#ffffff');

export const createScene: SceneFactory = (canvas, { lowPower }) => {
  const renderer = createRenderer(canvas, lowPower);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0b, 10, 22);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 2.4, 12.5);
  camera.lookAt(0, 0.2, 0);

  /* ---------- luzes */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe07a, 1.1);
  rim.position.set(-6, 3, -4);
  scene.add(rim);
  const glowLight = new THREE.PointLight(0xffd400, 18, 9, 1.6);
  glowLight.position.set(0, 0.2, 2.2);
  scene.add(glowLight);

  const root = new THREE.Group();
  scene.add(root);

  /* ---------- torre de servidores */
  const tower = new THREE.Group();
  root.add(tower);
  const units = 5;
  const unitH = 0.36;
  const gap = 0.07;
  const unitGeo = new THREE.BoxGeometry(2.1, unitH, 1.5);
  const unitMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.55, roughness: 0.35 });
  const unitEdges = new THREE.EdgesGeometry(unitGeo);
  const unitEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
  const stripGeo = new THREE.BoxGeometry(1.2, 0.035, 0.02);
  const stripMats: THREE.MeshStandardMaterial[] = [];
  const ledCount = units * 7;
  const ledGeo = new THREE.BoxGeometry(0.055, 0.055, 0.02);
  const ledMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const leds = new THREE.InstancedMesh(ledGeo, ledMat, ledCount);
  const m = new THREE.Matrix4();
  const baseY = -((units - 1) * (unitH + gap)) / 2;

  for (let i = 0; i < units; i++) {
    const y = baseY + i * (unitH + gap);
    const unit = new THREE.Mesh(unitGeo, unitMat);
    unit.position.y = y;
    const outline = new THREE.LineSegments(unitEdges, unitEdgeMat);
    outline.position.y = y;
    tower.add(unit, outline);

    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: YELLOW,
      emissiveIntensity: 1.2,
    });
    stripMats.push(stripMat);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(-0.25, y + 0.06, 0.76);
    tower.add(strip);

    for (let l = 0; l < 7; l++) {
      m.makeTranslation(0.5 + l * 0.075, y - 0.07, 0.76);
      leds.setMatrixAt(i * 7 + l, m);
      leds.setColorAt(i * 7 + l, l % 3 === 0 ? YELLOW : WHITE);
    }
  }
  tower.add(leds);

  // base e tampa
  const capGeo = new THREE.BoxGeometry(2.3, 0.08, 1.7);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0f0f11, metalness: 0.9, roughness: 0.25 });
  const top = new THREE.Mesh(capGeo, capMat);
  top.position.y = -baseY + unitH / 2 + 0.08;
  const bottom = new THREE.Mesh(capGeo, capMat);
  bottom.position.y = baseY - unitH / 2 - 0.08;
  tower.add(top, bottom);
  tower.rotation.y = -0.45;
  tower.scale.setScalar(1.12);

  /* ---------- malha de rede */
  const nodeCount = lowPower ? 34 : 56;
  const positions: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const radius = 3.9 + Math.sin(i * 12.9898) * 0.35;
    positions.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * 2.3, Math.sin(theta) * r * radius));
  }

  const nodeGeo = new THREE.IcosahedronGeometry(0.06, 1);
  const nodeMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
  positions.forEach((p, i) => {
    const s = i % 5 === 0 ? 1.8 : 1;
    m.compose(p, new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    nodes.setMatrixAt(i, m);
    nodes.setColorAt(i, i % 5 === 0 ? YELLOW : new THREE.Color('#d4d4d8'));
  });
  root.add(nodes);

  // arestas: cada nó liga-se aos 2 vizinhos mais próximos
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  positions.forEach((p, i) => {
    const nearest = positions
      .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const k = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(k)) {
        seen.add(k);
        edges.push([i, j]);
      }
    }
  });
  const edgePos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => {
    positions[a].toArray(edgePos, i * 6);
    positions[b].toArray(edgePos, i * 6 + 3);
  });
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffd400,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  root.add(new THREE.LineSegments(edgeGeo, edgeMat));

  /* ---------- cabos da torre para alguns nós */
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x1a1600,
    emissive: YELLOW,
    emissiveIntensity: 0.65,
    metalness: 0.3,
    roughness: 0.5,
  });
  const hubs = positions.map((p, i) => ({ p, i })).filter(({ p, i }) => i % 5 === 0 && p.y < 1.6);
  const cableCurves: THREE.CatmullRomCurve3[] = [];
  hubs.slice(0, lowPower ? 4 : 7).forEach(({ p }, idx) => {
    const start = new THREE.Vector3(Math.sign(p.x || 1) * 0.9, baseY + idx * 0.12, 0.3);
    const mid = start
      .clone()
      .lerp(p, 0.5)
      .add(new THREE.Vector3(0, -1.1, 0));
    const curve = new THREE.CatmullRomCurve3([start, mid, p]);
    cableCurves.push(curve);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.018, 6, false), cableMat));
  });

  /* ---------- pacotes de dados (partículas) */
  const pulseCount = lowPower ? 22 : 40;
  const pulsePos = new Float32Array(pulseCount * 3);
  const pulseState = Array.from({ length: pulseCount }, (_, i) => ({
    edge: (i * 7) % edges.length,
    t: (i / pulseCount) % 1,
    speed: 0.25 + ((i * 37) % 10) / 20,
    cable: i % 4 === 0 && cableCurves.length > 0 ? i % cableCurves.length : -1,
  }));
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const glowTex = makeGlowTexture('rgba(255,224,90,1)', 'rgba(255,212,0,0)');
  const pulseMat = new THREE.PointsMaterial({
    size: 0.26,
    map: glowTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const pulses = new THREE.Points(pulseGeo, pulseMat);
  root.add(pulses);

  /* ---------- piso em grade e halo */
  const grid = new THREE.GridHelper(26, 52, 0xffd400, 0x3f3f46);
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.14;
  gridMat.depthWrite = false;
  grid.position.y = -2.6;
  scene.add(grid);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture('rgba(255,212,0,0.55)', 'rgba(255,212,0,0)'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.scale.set(7.5, 7.5, 1);
  halo.position.set(0, -0.2, -1.5);
  scene.add(halo);

  /* ---------- animação */
  const tmp = new THREE.Vector3();
  let blinkClock = 0;
  const offColor = new THREE.Color('#3f3f46');

  const loop = createLoop({
    renderer,
    scene,
    camera,
    canvas,
    onResize(aspect) {
      // aproxima em telas estreitas para manter a composição legível
      camera.position.z = aspect < 0.9 ? 15.5 : aspect < 1.2 ? 13.5 : 12.5;
      camera.lookAt(0, 0.2, 0);
    },
    update(t, dt, pointer) {
      root.rotation.y = t * 0.09 + pointer.x * 0.35;
      root.rotation.x = pointer.y * 0.08;
      tower.position.y = Math.sin(t * 0.8) * 0.06;

      stripMats.forEach((mat, i) => {
        mat.emissiveIntensity = 0.9 + Math.sin(t * 2.2 + i * 0.9) * 0.45;
      });
      glowLight.intensity = 16 + Math.sin(t * 1.3) * 3;

      blinkClock += dt;
      if (blinkClock > 0.14) {
        blinkClock = 0;
        const idx = Math.floor(Math.random() * ledCount);
        const on = Math.random() > 0.35;
        leds.setColorAt(idx, on ? (idx % 3 === 0 ? YELLOW : WHITE) : offColor);
        if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
      }

      pulseState.forEach((s, i) => {
        s.t += dt * s.speed;
        if (s.t > 1) {
          s.t -= 1;
          s.edge = Math.floor(Math.random() * edges.length);
        }
        if (s.cable >= 0) {
          cableCurves[s.cable].getPointAt(s.t, tmp);
        } else {
          const [a, b] = edges[s.edge];
          tmp.copy(positions[a]).lerp(positions[b], s.t);
        }
        tmp.toArray(pulsePos, i * 3);
      });
      pulseGeo.attributes.position.needsUpdate = true;
    },
  });

  return loop;
};
