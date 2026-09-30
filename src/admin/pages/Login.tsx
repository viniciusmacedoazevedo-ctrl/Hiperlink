import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { api, type SessionUser } from '../api';
import { errorMessage } from '../ui';
import { Logo } from '../../components/common/Logo';

export function Login({ onSuccess }: { onSuccess: (u: SessionUser) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { user } = await api.login(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
      onSuccess(user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="adm-login">
      <div className="grid-bg" aria-hidden="true" />
      <form className="adm-login__card" onSubmit={submit}>
        <Logo brand="hiperlink" height={48} eager />
        <h1>
          <LockKeyhole size={20} aria-hidden="true" /> Área administrativa
        </h1>
        <p className="adm-login__lead">Entre com seu e-mail e senha.</p>
        <label className="adm-field__label" htmlFor="adm-email">
          E-mail
        </label>
        <input id="adm-email" name="email" type="email" className="adm-input" autoComplete="username" required />
        <label className="adm-field__label" htmlFor="adm-pass">
          Senha
        </label>
        <input
          id="adm-pass"
          name="password"
          type="password"
          className="adm-input"
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="adm-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <a href="/" className="adm-login__back">
          ← Voltar ao site
        </a>
      </form>
    </main>
  );
}
