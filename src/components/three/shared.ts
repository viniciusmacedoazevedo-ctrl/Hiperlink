import * as THREE from 'three';
import type { SceneHandle } from '../common/WebGLStage';

export function createRenderer(canvas: HTMLCanvasElement, lowPower: boolean) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    alpha: true,
    powerPreference: lowPower ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Textura radial suave, usada em partículas e halos. */
export function makeGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
    for (const m of mats) {
      for (const value of Object.values(m)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      m.dispose();
    }
  });
}

interface LoopOptions {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  /** Atualiza a cena. `t` em segundos; `pointer` suavizado em [-1, 1]. */
  update: (t: number, dt: number, pointer: { x: number; y: number }) => void;
  /** Ajusta câmera/enquadramento conforme a proporção do canvas. */
  onResize?: (aspect: number) => void;
}

/** Cria o controlador padrão (start/stop/resize/dispose) usado pelo WebGLStage. */
export function createLoop({ renderer, scene, camera, canvas, update, onResize }: LoopOptions): SceneHandle {
  const target = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let frame = 0;
  let elapsed = 0;
  let last = 0;

  const render = () => renderer.render(scene, camera);

  const tick = () => {
    frame = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    pointer.x += (target.x - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (target.y - pointer.y) * Math.min(1, dt * 3);
    update(elapsed, dt, pointer);
    render();
  };

  return {
    start() {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    },
    renderOnce() {
      update(elapsed || 2.5, 0, pointer);
      render();
    },
    resize() {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      onResize?.(camera.aspect);
      camera.updateProjectionMatrix();
    },
    setPointer(x, y) {
      target.x = x;
      target.y = y;
    },
    dispose() {
      cancelAnimationFrame(frame);
      frame = 0;
      disposeObject(scene);
      renderer.dispose();
    },
  };
}
