import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, type AdminContent } from './api';
import { useRoute } from './router';
import { ToastProvider } from './ui';
import { Login } from './Login';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { ClientsList } from './ClientsList';
import { ClientForm } from './ClientForm';
import { TestimonialsList } from './TestimonialsList';
import { TestimonialForm } from './TestimonialForm';
import { Settings } from './Settings';

interface AdminData {
  content: AdminContent | null;
  reload: () => Promise<void>;
}
const DataCtx = createContext<AdminData>({ content: null, reload: async () => {} });
export const useAdminData = () => useContext(DataCtx);

export function AdminApp() {
  const [session, setSession] = useState<{ authenticated: boolean; user: string | null; enabled: boolean } | null>(
    null,
  );
  const [content, setContent] = useState<AdminContent | null>(null);
  const route = useRoute();

  const checkSession = useCallback(() => {
    api
      .session()
      .then(setSession)
      .catch(() => setSession({ authenticated: false, user: null, enabled: false }));
  }, []);

  const reload = useCallback(async () => {
    setContent(await api.content());
  }, []);

  useEffect(checkSession, [checkSession]);
  useEffect(() => {
    const onUnauthorized = () => setSession((s) => (s ? { ...s, authenticated: false } : s));
    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized);
  }, []);
  useEffect(() => {
    if (session?.authenticated) reload().catch(() => {});
  }, [session?.authenticated, reload]);

  if (!session) return <div className="adm-loading" aria-busy="true" aria-label="Carregando" />;

  if (!session.authenticated) {
    return (
      <ToastProvider>
        <Login enabled={session.enabled} onSuccess={checkSession} />
      </ToastProvider>
    );
  }

  const [section, sub] = route;
  let page;
  if (section === 'clientes' && sub) page = <ClientForm id={sub === 'novo' ? null : sub} />;
  else if (section === 'clientes') page = <ClientsList />;
  else if (section === 'depoimentos' && sub) page = <TestimonialForm id={sub === 'novo' ? null : sub} />;
  else if (section === 'depoimentos') page = <TestimonialsList />;
  else if (section === 'configuracoes') page = <Settings />;
  else page = <Dashboard />;

  return (
    <ToastProvider>
      <DataCtx.Provider value={{ content, reload }}>
        <Layout
          user={session.user ?? ''}
          active={section ?? ''}
          onLogout={async () => {
            await api.logout().catch(() => {});
            setContent(null);
            checkSession();
          }}
        >
          {content ? page : <div className="adm-loading" aria-busy="true" aria-label="Carregando conteúdo" />}
        </Layout>
      </DataCtx.Provider>
    </ToastProvider>
  );
}
