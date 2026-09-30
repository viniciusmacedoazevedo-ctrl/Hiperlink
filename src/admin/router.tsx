import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

/** Roteamento por caminho real: /admin/clientes/123/editar → ['clientes', '123', 'editar']. */
const BASE = '/admin';

const parse = () =>
  window.location.pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);

export function useRoute(): string[] {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('popstate', onChange);
    window.addEventListener('admin:navigate', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('admin:navigate', onChange);
    };
  }, []);
  return route;
}

export function navigate(path: string, { replace = false } = {}) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  window.dispatchEvent(new Event('admin:navigate'));
  window.scrollTo({ top: 0 });
  document.getElementById('adm-main')?.focus({ preventScroll: true });
}

/** Link interno do painel (mantém Ctrl/⌘+clique para nova aba). */
export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const href = `${BASE}${to.startsWith('/') ? to : `/${to}`}`;
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
