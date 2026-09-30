import { useEffect, useState } from 'react';

/** Roteamento simples por hash (#/clientes, #/clientes/novo, #/clientes/<id>…). */
export function useRoute(): string[] {
  const parse = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => {
      setRoute(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export const navigate = (path: string) => {
  window.location.hash = path;
};
