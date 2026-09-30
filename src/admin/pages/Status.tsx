import { ShieldAlert } from 'lucide-react';
import { Link } from '../router';

export function Forbidden() {
  return (
    <div className="adm-card adm-empty">
      <ShieldAlert size={32} aria-hidden="true" className="adm-empty__icon" />
      <h1 className="adm-empty__title">Acesso restrito</h1>
      <p>Seu perfil não tem permissão para acessar esta área.</p>
      <Link to="/dashboard" className="adm-link">
        Voltar ao dashboard
      </Link>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="adm-card adm-empty">
      <h1 className="adm-empty__title">Página não encontrada</h1>
      <Link to="/dashboard" className="adm-link">
        Voltar ao dashboard
      </Link>
    </div>
  );
}
