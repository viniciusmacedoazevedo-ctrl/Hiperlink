import { useEffect, useState } from 'react';
import { seedPublicClients, type PublicClients, type PublicTestimonial } from '../data/siteContent';

const cache = new Map<string, Promise<unknown>>();

/** GET único por página na API pública; em falha usa a reserva informada. */
function getPublic<T>(path: string, fallback: T): Promise<T> {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(`/api/public/${path}`, { headers: { accept: 'application/json' } })
        .then((r) => {
          if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error(String(r.status));
          return r.json();
        })
        .catch(() => fallback),
    );
  }
  return cache.get(path) as Promise<T>;
}

function usePublic<T>(path: string, fallback: T): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    getPublic(path, fallback).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [path]);
  return data;
}

/** `null` enquanto carrega. */
export const usePublicClients = () => usePublic<PublicClients>('clients', seedPublicClients);
export const usePublicTestimonials = () => usePublic<PublicTestimonial[]>('testimonials', []);
