import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { navigateWithTransition, type TransitionTheme } from '../../lib/pageTransition';

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  theme: TransitionTheme;
  children: ReactNode;
}

/** Link comum (funciona sem JS, com Ctrl/⌘+clique etc.) com transição animada no clique simples. */
export function TransitionLink({ href, theme, children, onClick, ...rest }: TransitionLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const origin = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined;
    navigateWithTransition(href, theme, origin);
  };
  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
