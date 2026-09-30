import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavLink } from '../../data/types';
import { useActiveSection } from '../../hooks/useActiveSection';
import { Logo } from './Logo';

interface HeaderProps {
  brand: 'hiperlink' | 'psg';
  homeLabel: string;
  nav: NavLink[];
  cta: { label: string; href: string };
  /** Link de navegação para a outra empresa (ex.: "PSG Dados" ou "Voltar para a Hiperlink"). */
  switchLink: ReactNode;
  /** Mesmo link, versão para o menu móvel. */
  switchLinkMobile: ReactNode;
}

export function Header({ brand, homeLabel, nav, cta, switchLink, switchLinkMobile }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(nav.map((n) => n.href.replace('#', '')));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty('--progress', String(max > 0 ? y / max : 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Menu móvel: trava rolagem, Esc fecha, foco inicial e retorno do foco.
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('menu-open');
    const first = panelRef.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a, button'));
        const all = [toggleRef.current!, ...focusables];
        const idx = all.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          all[all.length - 1].focus();
        } else if (!e.shiftKey && idx === all.length - 1) {
          e.preventDefault();
          all[0].focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1080) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.documentElement.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
        <div className="site-header__progress" ref={progressRef} aria-hidden="true" />
        <div className="container site-header__inner">
          <a href="#topo" className="site-header__brand" aria-label={homeLabel}>
            <Logo brand={brand} height={brand === 'hiperlink' ? 40 : 44} eager />
          </a>

          <nav className="site-nav" aria-label="Navegação principal">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={active === item.href.slice(1) ? 'is-active' : undefined}
                    aria-current={active === item.href.slice(1) ? 'location' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            {switchLink}
            <a href={cta.href} className="btn btn--primary btn--sm site-header__cta">
              {cta.label}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fora do <header>: o backdrop-filter do cabeçalho prenderia um painel fixed dentro dele */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className="mobile-menu"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false);
        }}
      >
        <nav aria-label="Navegação principal (móvel)">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ ['--i' as string]: i }}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu__footer">
          <a href={cta.href} className="btn btn--primary btn--block">
            {cta.label}
          </a>
          {switchLinkMobile}
        </div>
      </div>
    </>
  );
}
