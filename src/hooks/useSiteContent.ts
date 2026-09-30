import { useEffect, useState } from 'react';
import { seedContent, type SiteContent } from '../data/siteContent';

let request: Promise<SiteContent> | null = null;

/** Busca uma única vez por página o conteúdo publicado no painel; em caso de falha usa o conteúdo inicial. */
function fetchContent(): Promise<SiteContent> {
  request ??= fetch('/api/public/content', { headers: { accept: 'application/json' } })
    .then((r) => {
      if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error(String(r.status));
      return r.json() as Promise<SiteContent>;
    })
    .catch(() => seedContent);
  return request;
}

/** `null` enquanto carrega. */
export function useSiteContent(): SiteContent | null {
  const [content, setContent] = useState<SiteContent | null>(null);
  useEffect(() => {
    let alive = true;
    fetchContent().then((c) => alive && setContent(c));
    return () => {
      alive = false;
    };
  }, []);
  return content;
}
