import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

export interface SceneHandle {
  start(): void;
  stop(): void;
  renderOnce(): void;
  resize(): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
}

export type SceneFactory = (canvas: HTMLCanvasElement, opts: { lowPower: boolean }) => SceneHandle;

interface WebGLStageProps {
  /** Import dinâmico da cena — o Three.js só é baixado quando necessário. */
  load: () => Promise<{ createScene: SceneFactory }>;
  label: string;
  fallback: ReactNode;
  className?: string;
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Palco para as cenas 3D:
 * - carrega o Three.js sob demanda (depois da primeira pintura);
 * - pausa quando fora da viewport ou com a aba oculta;
 * - com prefers-reduced-motion renderiza um único quadro estático;
 * - sem WebGL exibe o fallback ilustrado.
 */
export function WebGLStage({ load, label, fallback, className = '' }: WebGLStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'fallback'>('idle');

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (!webglAvailable()) {
      setStatus('fallback');
      return;
    }

    let scene: SceneHandle | null = null;
    let cancelled = false;
    let visible = true;
    const reduced = prefersReducedMotion();
    const lowPower = window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;

    const sync = () => {
      if (!scene) return;
      if (reduced) {
        scene.renderOnce();
        return;
      }
      if (visible && !document.hidden) scene.start();
      else scene.stop();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(() => {
      scene?.resize();
      if (reduced) scene?.renderOnce();
    });
    const onVisibility = () => sync();
    const onPointer = (e: PointerEvent) => {
      if (reduced || e.pointerType !== 'mouse') return;
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };

    const boot = () => {
      load()
        .then(({ createScene }) => {
          if (cancelled) return;
          try {
            scene = createScene(canvas, { lowPower });
          } catch {
            setStatus('fallback');
            return;
          }
          scene.resize();
          setStatus('ready');
          io.observe(wrap);
          ro.observe(wrap);
          document.addEventListener('visibilitychange', onVisibility);
          window.addEventListener('pointermove', onPointer, { passive: true });
          sync();
        })
        .catch(() => setStatus('fallback'));
    };

    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (idle) idle(boot, { timeout: 600 });
    else window.setTimeout(boot, 120);

    return () => {
      cancelled = true;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      scene?.dispose();
    };
  }, [load]);

  return (
    <div ref={wrapRef} className={`webgl-stage is-${status} ${className}`} role="img" aria-label={label}>
      <div className="webgl-stage__fallback" aria-hidden="true">
        {fallback}
      </div>
      <canvas ref={canvasRef} className="webgl-stage__canvas" aria-hidden="true" />
    </div>
  );
}
