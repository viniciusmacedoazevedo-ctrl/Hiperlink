import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { api, type SessionUser } from './api';
import { AuthContext } from './auth';
import { navigate, useRoute } from './router';
import { ToastProvider } from './ui';
import { Layout } from './Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ClientsList } from './pages/ClientsList';
import { ClientForm } from './pages/ClientForm';
import { TestimonialsList } from './pages/TestimonialsList';
import { TestimonialForm } from './pages/TestimonialForm';
import { MediaLibrary } from './pages/MediaLibrary';
import { Users } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { Forbidden, NotFound } from './pages/Status';

/**
 * Rotas:
 *   /admin/login · /admin/logout · /admin/dashboard
 *   /admin/clientes · /admin/clientes/novo · /admin/clientes/:id/editar
 *   /admin/depoimentos · /admin/depoimentos/novo · /admin/depoimentos/:id/editar
 *   /admin/midia · /admin/configuracoes/usuarios · /admin/configuracoes/logs
 */
export function AdminApp() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const route = useRoute();
  const [section, a, b] = route;

  const refresh = useCallback(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);
  useEffect(refresh, [refresh]);
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized);
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
    navigate('/login', { replace: true });
  }, []);

  // redirecionamentos de acordo com a sessão
  useEffect(() => {
    if (user === undefined) return;
    if (section === 'logout') {
      if (user) logout();
      else navigate('/login', { replace: true });
    } else if (!user && section !== 'login') navigate('/login', { replace: true });
    else if (user && (section === 'login' || !section)) navigate('/dashboard', { replace: true });
  }, [user, section, logout]);

  const ctx = useMemo(
    () => (user ? { user, can: (p: string) => user.permissions.includes(p), logout } : null),
    [user, logout],
  );

  useEffect(() => {
    const titles: Record<string, string> = {
      login: 'Entrar',
      dashboard: 'Dashboard',
      clientes: 'Clientes',
      depoimentos: 'Depoimentos',
      midia: 'Mídia',
      configuracoes: 'Configurações',
    };
    document.title = `${titles[section ?? ''] ?? 'Painel'} — Painel Hiperlink`;
  }, [section]);

  if (user === undefined) return <div className="adm-loading" aria-busy="true" aria-label="Carregando" />;

  if (!user || !ctx) {
    return (
      <ToastProvider>
        <Login onSuccess={(u) => setUser(u)} />
      </ToastProvider>
    );
  }

  const guard = (permission: string, el: ReactElement) => (ctx.can(permission) ? el : <Forbidden />);
  let page: ReactElement;
  if (section === 'dashboard') page = <Dashboard />;
  else if (section === 'clientes' && !a) page = <ClientsList />;
  else if (section === 'clientes' && a === 'novo') page = guard('clients.create', <ClientForm id={null} />);
  else if (section === 'clientes' && b === 'editar') page = guard('clients.update', <ClientForm key={a} id={a} />);
  else if (section === 'depoimentos' && !a) page = <TestimonialsList />;
  else if (section === 'depoimentos' && a === 'novo')
    page = guard('testimonials.create', <TestimonialForm id={null} />);
  else if (section === 'depoimentos' && b === 'editar')
    page = guard('testimonials.update', <TestimonialForm key={a} id={a} />);
  else if (section === 'midia') page = <MediaLibrary />;
  else if (section === 'configuracoes' && (a === 'usuarios' || !a)) page = guard('users.manage', <Users />);
  else if (section === 'configuracoes' && a === 'logs') page = guard('audit.view', <AuditLogs />);
  else if (section === 'login' || section === 'logout' || !section)
    page = <div className="adm-loading" aria-busy="true" />;
  else page = <NotFound />;

  return (
    <ToastProvider>
      <AuthContext.Provider value={ctx}>
        <Layout active={section ?? ''} sub={a ?? ''}>
          {page}
        </Layout>
      </AuthContext.Provider>
    </ToastProvider>
  );
}
