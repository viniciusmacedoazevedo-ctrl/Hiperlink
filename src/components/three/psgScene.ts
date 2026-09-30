/**
 * Cena 3D da PSG Dados: escudo em vidro/metal, pilha de banco de dados,
 * nuvem com cadeado, anéis de replicação (backup) e dados subindo para a nuvem.
 */
import * as THREE from 'three';
import type { SceneFactory } from '../common/WebGLStage';
import { createLoop, createRenderer, makeGlowTexture } from './shared';

const BLUE = new THREE.Color('#2f8bff');
const CYAN = new THREE.Color('#5ec8ff');
const NAVY = new THREE.Color('#0b1d3a');

function shieldShape(w: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(0, h * 0.5);
  s.bezierCurveTo(w * 0.28, h * 0.42, w * 0.46, h * 0.4, w * 0.5, h * 0.36);
  s.lineTo(w * 0.5, -h * 0.02);
  s.bezierCurveTo(w * 0.5, -h * 0.28, w * 0.26, -h * 0.42, 0, -h * 0.5);
  s.bezierCurveTo(-w * 0.26, -h * 0.42, -w * 0.5, -h * 0.28, -w * 0.5, -h * 0.02);
  s.lineTo(-w * 0.5, h * 0.36);
  s.bezierCurveTo(-w * 0.46, h * 0.4, -w * 0.28, h * 0.42, 0, h * 0.5);
  return s;
}

export const createScene: SceneFactory = (canvas, { lowPower }) => {
  const renderer = createRenderer(canvas, lowPower);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x030a17, 11, 24);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0.6, 12);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xbcd4ff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5ec8ff, 1.4);
  rim.position.set(-6, 2, -5);
  scene.add(rim);
  const core = new THREE.PointLight(0x2f8bff, 22, 10, 1.5);
  core.position.set(0, 0.4, 2.5);
  scene.add(core);

  const root = new THREE.Group();
  scene.add(root);

  /* ---------- escudo: contorno metálico + face translúcida */
  const outer = shieldShape(4.4, 5.2);
  const inner = shieldShape(3.9, 4.65);
  const ring = outer.clone();
  ring.holes.push(new THREE.Path(inner.getPoints(48).reverse()));
  const ringGeo = new THREE.ExtrudeGeometry(ring, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 32,
  });
  ringGeo.center();
  const ringMat = new THREE.MeshStandardMaterial({
    color: NAVY,
    metalness: 0.85,
    roughness: 0.28,
    emissive: new THREE.Color('#0a2a66'),
    emissiveIntensity: 0.6,
  });
  const shield = new THREE.Group();
  shield.add(new THREE.Mesh(ringGeo, ringMat));

  const faceGeo = new THREE.ShapeGeometry(inner, 32);
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0x1b4fae,
    transparent: true,
    opacity: 0.16,
    metalness: 0.2,
    roughness: 0.1,
    emissive: BLUE,
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.z = -0.35;
  shield.add(face);

  const edgeMat = new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const edgePts = outer.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y, 0.2));
  const edgeLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(edgePts), edgeMat);
  shield.add(edgeLine);
  shield.position.set(-0.35, 0.1, -0.6);
  root.add(shield);

  /* ---------- pilha de banco de dados */
  const db = new THREE.Group();
  const diskGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.52, 56, 1);
  const diskMat = new THREE.MeshStandardMaterial({
    color: 0x1760d6,
    metalness: 0.55,
    roughness: 0.25,
    emissive: new THREE.Color('#0b3a8f'),
    emissiveIntensity: 0.35,
  });
  const bandGeo = new THREE.TorusGeometry(1.06, 0.022, 8, 72);
  const bandMats: THREE.MeshBasicMaterial[] = [];
  const dotGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  for (let i = 0; i < 3; i++) {
    const y = (i - 1) * 0.62;
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.y = y;
    db.add(disk);
    const bandMat = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true });
    bandMats.push(bandMat);
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = y + 0.29;
    db.add(band);
    for (let d = 0; d < 2; d++) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      const ang = 0.35 + d * 0.22;
      dot.position.set(Math.sin(ang) * 1.06, y, Math.cos(ang) * 1.06);
      db.add(dot);
    }
  }
  db.position.set(-0.35, 0.35, 0.2);
  db.rotation.x = 0.18;
  root.add(db);

  /* ---------- nuvem com cadeado */
  const cloud = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0x3a8dff,
    metalness: 0.15,
    roughness: 0.35,
    emissive: new THREE.Color('#1a5fd0'),
    emissiveIntensity: 0.35,
  });
  const puffs: [number, number, number, number][] = [
    [0, 0.12, 0, 0.72],
    [-0.72, -0.12, 0, 0.5],
    [0.72, -0.1, 0, 0.55],
    [-0.28, -0.28, 0.1, 0.52],
    [0.3, -0.28, 0.1, 0.52],
  ];
  const puffGeo = new THREE.SphereGeometry(1, 32, 24);
  for (const [x, y, z, r] of puffs) {
    const p = new THREE.Mesh(puffGeo, cloudMat);
    p.position.set(x, y, z);
    p.scale.setScalar(r);
    cloud.add(p);
  }
  const lockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.3 });
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.38, 0.16), lockMat);
  lockBody.position.set(0, -0.08, 0.72);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.045, 10, 24, Math.PI), lockMat);
  shackle.position.set(0, 0.11, 0.72);
  const keyhole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.2, 16),
    new THREE.MeshBasicMaterial({ color: 0x0b1d3a }),
  );
  keyhole.rotation.x = Math.PI / 2;
  keyhole.position.set(0, -0.07, 0.75);
  cloud.add(lockBody, shackle, keyhole);
  cloud.position.set(1.35, -1.55, 1.4);
  cloud.scale.setScalar(0.95);
  root.add(cloud);

  /* ---------- anéis de replicação com satélites */
  const orbitMat = new THREE.MeshBasicMaterial({
    color: BLUE,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const orbits: { pivot: THREE.Group; speed: number }[] = [];
  [
    { r: 3.4, tilt: [1.2, 0.2, 0.3], speed: 0.35 },
    { r: 4.1, tilt: [1.45, -0.35, -0.2], speed: -0.22 },
  ].forEach(({ r, tilt, speed }) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(tilt[0], tilt[1], tilt[2]);
    pivot.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 6, 160), orbitMat));
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    );
    sat.position.x = r;
    const sat2 = sat.clone();
    sat2.position.x = -r;
    pivot.add(sat, sat2);
    root.add(pivot);
    orbits.push({ pivot, speed });
  });

  /* ---------- dados subindo (backup para a nuvem) */
  const count = lowPower ? 60 : 120;
  const pos = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, (_, i) => ({
    a: (i / count) * Math.PI * 2,
    r: 1.4 + ((i * 53) % 100) / 45,
    y: ((i * 29) % 100) / 100,
    s: 0.12 + ((i * 17) % 10) / 60,
  }));
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const partMat = new THREE.PointsMaterial({
    size: 0.16,
    map: makeGlowTexture('rgba(140,200,255,1)', 'rgba(47,139,255,0)'),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  root.add(new THREE.Points(partGeo, partMat));

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture('rgba(47,139,255,0.6)', 'rgba(47,139,255,0)'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.scale.set(9, 9, 1);
  halo.position.set(0, 0, -2.5);
  scene.add(halo);

  return createLoop({
    renderer,
    scene,
    camera,
    canvas,
    onResize(aspect) {
      camera.position.z = aspect < 0.9 ? 15 : aspect < 1.2 ? 13 : 12;
      camera.lookAt(0, 0, 0);
    },
    update(t, dt, pointer) {
      root.rotation.y = Math.sin(t * 0.25) * 0.28 + pointer.x * 0.3;
      root.rotation.x = pointer.y * 0.1;
      shield.position.y = 0.1 + Math.sin(t * 0.7) * 0.08;
      db.rotation.y = t * 0.35;
      db.position.y = 0.35 + Math.sin(t * 0.9 + 1) * 0.06;
      cloud.position.y = -1.55 + Math.sin(t * 1.1 + 2) * 0.1;
      edgeMat.opacity = 0.55 + Math.sin(t * 1.6) * 0.25;
      bandMats.forEach((mat, i) => {
        mat.opacity = 0.55 + Math.sin(t * 2.4 - i * 0.9) * 0.45;
      });
      orbits.forEach((o) => (o.pivot.rotation.z += dt * o.speed));
      core.intensity = 20 + Math.sin(t * 1.4) * 4;

      seeds.forEach((s, i) => {
        const y = ((s.y + t * s.s) % 1) * 6 - 3;
        pos[i * 3] = Math.cos(s.a + t * 0.2) * s.r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(s.a + t * 0.2) * s.r * 0.6;
      });
      partGeo.attributes.position.needsUpdate = true;
    },
  });
};
