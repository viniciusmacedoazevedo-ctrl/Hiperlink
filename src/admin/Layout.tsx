import { useState, type ReactNode } from 'react';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

const items = [
  { key: '', href: '#/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'clientes', href: '#/clientes', label: 'Clientes', icon: Users },
  { key: 'depoimentos', href: '#/depoimentos', label: 'Depoimentos', icon: MessageSquareQuote },
  { key: 'configuracoes', href: '#/configuracoes', label: 'Configurações', icon: SlidersHorizontal },
];

export function Layout({
  user,
  active,
  onLogout,
  children,
}: {
  user: string;
  active: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`adm-shell ${open ? 'is-open' : ''}`}>
      <a className="skip-link" href="#adm-main">
        Pular para o conteúdo
      </a>
      <header className="adm-topbar">
        <button
          type="button"
          className="adm-topbar__menu"
          aria-expanded={open}
          aria-controls="adm-sidebar"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <Logo brand="hiperlink" height={30} />
        <span className="adm-topbar__title">Administração</span>
      </header>

      <aside id="adm-sidebar" className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <Logo brand="hiperlink" height={36} />
          <span>Administração</span>
        </div>
        <nav aria-label="Menu do painel">
          <ul>
            {items.map(({ key, href, label, icon: Ic }) => (
              <li key={href}>
                <a
                  href={href}
                  className={active === key ? 'is-active' : undefined}
                  aria-current={active === key ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <Ic size={18} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="adm-sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} aria-hidden="true" /> Ver site
          </a>
          <p className="adm-sidebar__user">
            Conectado como <strong>{user}</strong>
          </p>
          <button type="button" className="adm-link-btn" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" /> Sair
          </button>
        </div>
      </aside>
      {open && <div className="adm-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <main id="adm-main" className="adm-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
