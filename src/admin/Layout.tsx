import { useState, type FormEvent, type ReactNode } from 'react';
import {
  ExternalLink,
  FileClock,
  Image,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Modal } from '../components/common/Modal';
import { api } from './api';
import { useAuth } from './auth';
import { Link } from './router';
import { errorMessage, Field, roleLabel, useToast } from './ui';

export function Layout({ active, sub, children }: { active: string; sub: string; children: ReactNode }) {
  const { user, can } = useAuth();
  const [open, setOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const items = [
    { key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { key: 'clientes', to: '/clientes', label: 'Clientes', icon: Users, show: can('clients.view') },
    {
      key: 'depoimentos',
      to: '/depoimentos',
      label: 'Depoimentos',
      icon: MessageSquareQuote,
      show: can('testimonials.view'),
    },
    { key: 'midia', to: '/midia', label: 'Mídia', icon: Image, show: can('media.view') },
  ];
  const settings = [
    { key: 'usuarios', to: '/configuracoes/usuarios', label: 'Usuários', icon: UserCog, show: can('users.manage') },
    { key: 'logs', to: '/configuracoes/logs', label: 'Logs de auditoria', icon: FileClock, show: can('audit.view') },
  ].filter((i) => i.show);

  const navLink = (isActive: boolean, to: string, label: string, Icon: typeof Users) => (
    <Link
      to={to}
      className={isActive ? 'is-active' : undefined}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => setOpen(false)}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </Link>
  );

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
          <Logo brand="hiperlink" height={38} />
          <span>Administração</span>
        </div>
        <nav aria-label="Menu do painel">
          <ul>
            {items
              .filter((i) => i.show)
              .map((i) => (
                <li key={i.key}>{navLink(active === i.key, i.to, i.label, i.icon)}</li>
              ))}
          </ul>
          {settings.length > 0 && (
            <>
              <p className="adm-sidebar__group">Configurações</p>
              <ul>
                {settings.map((i) => (
                  <li key={i.key}>{navLink(active === 'configuracoes' && sub === i.key, i.to, i.label, i.icon)}</li>
                ))}
              </ul>
            </>
          )}
        </nav>
        <div className="adm-sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} aria-hidden="true" /> Ver site
          </a>
          <p className="adm-sidebar__user">
            <strong>{user.name}</strong>
            <span>
              {user.email} · {roleLabel[user.role]}
            </span>
          </p>
          <button type="button" className="adm-link-btn" onClick={() => setPwdOpen(true)} aria-haspopup="dialog">
            <KeyRound size={16} aria-hidden="true" /> Alterar senha
          </button>
          <Link to="/logout" className="adm-link-btn">
            <LogOut size={16} aria-hidden="true" /> Sair
          </Link>
        </div>
      </aside>
      {open && <div className="adm-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <main id="adm-main" className="adm-main" tabIndex={-1}>
        {children}
      </main>

      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} labelledBy="pwd-title" className="adm-confirm">
        <ChangePassword onDone={() => setPwdOpen(false)} />
      </Modal>
    </div>
  );
}

function ChangePassword({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next = String(f.get('next') ?? '');
    if (next !== String(f.get('confirm') ?? '')) return setError('A confirmação não confere com a nova senha.');
    setBusy(true);
    setError('');
    try {
      await api.changePassword(String(f.get('current') ?? ''), next);
      toast('ok', 'Senha alterada. As outras sessões foram encerradas.');
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="adm-stack">
      <h2 id="pwd-title" className="adm-confirm__title">
        Alterar minha senha
      </h2>
      <Field label="Senha atual" htmlFor="pwd-current" required>
        <input
          id="pwd-current"
          name="current"
          type="password"
          className="adm-input"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="Nova senha" htmlFor="pwd-next" hint="Mínimo de 10 caracteres." required>
        <input
          id="pwd-next"
          name="next"
          type="password"
          className="adm-input"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>
      <Field label="Confirmar nova senha" htmlFor="pwd-confirm" required>
        <input
          id="pwd-confirm"
          name="confirm"
          type="password"
          className="adm-input"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>
      {error && (
        <p className="adm-alert" role="alert">
          {error}
        </p>
      )}
      <div className="adm-confirm__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </div>
    </form>
  );
}
