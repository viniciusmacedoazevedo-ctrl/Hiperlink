import { useState, type FormEvent } from 'react';
import { KeyRound, Pencil, Plus, Trash } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { api, type Role, type User } from '../api';
import { useAuth } from '../auth';
import { errorMessage, Field, formatDate, roleLabel, useConfirm, useToast } from '../ui';
import { useApi } from '../useApi';

type Dialog = { kind: 'new' } | { kind: 'edit'; user: User } | { kind: 'password'; user: User } | null;

export function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { data, error, reload } = useApi(() => api.users(), []);
  const [dialog, setDialog] = useState<Dialog>(null);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Usuários</h1>
          <p>
            <strong>Administrador</strong>: acesso completo. <strong>Editor</strong>: gerencia clientes, depoimentos e
            mídia, sem excluir conteúdo e sem acesso a usuários e logs.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setDialog({ kind: 'new' })}
          aria-haspopup="dialog"
        >
          <Plus size={16} aria-hidden="true" /> Novo usuário
        </button>
      </div>
      {error && <p className="adm-alert">{error}</p>}
      {!data ? (
        <div className="adm-loading" aria-busy="true" aria-label="Carregando" />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfil</th>
                <th scope="col">Status</th>
                <th scope="col">Último acesso</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td data-label="Nome">
                    <strong>{u.name}</strong>
                    {u.id === me.id && <small className="adm-table__sub">Você</small>}
                  </td>
                  <td data-label="E-mail">{u.email}</td>
                  <td data-label="Perfil">
                    <span className={`adm-badge adm-badge--${u.role.toLowerCase()}`}>{roleLabel[u.role]}</span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`adm-badge ${u.status === 'ACTIVE' ? 'adm-badge--published' : 'adm-badge--archived'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td data-label="Último acesso">{formatDate(u.lastLoginAt)}</td>
                  <td data-label="Ações" className="adm-table__actions">
                    <button
                      type="button"
                      className="adm-icon-btn"
                      aria-label={`Editar ${u.name}`}
                      onClick={() => setDialog({ kind: 'edit', user: u })}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      aria-label={`Redefinir senha de ${u.name}`}
                      onClick={() => setDialog({ kind: 'password', user: u })}
                    >
                      <KeyRound size={17} aria-hidden="true" />
                    </button>
                    {u.id !== me.id && (
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn--danger"
                        aria-label={`Excluir ${u.name}`}
                        onClick={async () => {
                          if (!(await confirm(`Excluir o usuário “${u.name}”? Ele perde o acesso imediatamente.`)))
                            return;
                          try {
                            await api.deleteUser(u.id);
                            toast('ok', 'Usuário excluído.');
                            reload();
                          } catch (e) {
                            toast('error', errorMessage(e));
                          }
                        }}
                      >
                        <Trash size={17} aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        labelledBy="user-dialog-title"
        className="adm-confirm"
      >
        {dialog && (
          <UserDialog
            dialog={dialog}
            isSelf={'user' in dialog && dialog.user.id === me.id}
            onDone={() => {
              setDialog(null);
              reload();
            }}
          />
        )}
      </Modal>
      {confirmDialog}
    </>
  );
}

function UserDialog({ dialog, isSelf, onDone }: { dialog: NonNullable<Dialog>; isSelf: boolean; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const u = 'user' in dialog ? dialog.user : null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '');
    setBusy(true);
    setError('');
    try {
      if (dialog.kind === 'new') {
        await api.createUser({
          name: get('name'),
          email: get('email'),
          role: get('role') as Role,
          password: get('password'),
        });
        toast('ok', 'Usuário criado.');
      } else if (dialog.kind === 'edit' && u) {
        await api.updateUser(u.id, {
          name: get('name'),
          email: get('email'),
          ...(isSelf ? {} : { role: get('role') as Role, status: get('status') as User['status'] }),
        });
        toast('ok', 'Usuário atualizado.');
      } else if (dialog.kind === 'password' && u) {
        await api.resetPassword(u.id, get('password'));
        toast('ok', 'Senha redefinida. As sessões do usuário foram encerradas.');
      }
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title =
    dialog.kind === 'new'
      ? 'Novo usuário'
      : dialog.kind === 'edit'
        ? `Editar ${u?.name}`
        : `Redefinir senha de ${u?.name}`;
  return (
    <form onSubmit={submit} className="adm-stack">
      <h2 id="user-dialog-title" className="adm-confirm__title">
        {title}
      </h2>
      {dialog.kind !== 'password' && (
        <>
          <Field label="Nome" htmlFor="u-name" required>
            <input id="u-name" name="name" className="adm-input" defaultValue={u?.name} maxLength={120} required />
          </Field>
          <Field label="E-mail" htmlFor="u-email" required>
            <input
              id="u-email"
              name="email"
              type="email"
              className="adm-input"
              defaultValue={u?.email}
              maxLength={200}
              required
            />
          </Field>
          <Field label="Perfil" htmlFor="u-role" hint={isSelf ? 'Você não pode alterar o próprio perfil.' : undefined}>
            <select id="u-role" name="role" className="adm-input" defaultValue={u?.role ?? 'EDITOR'} disabled={isSelf}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </Field>
          {dialog.kind === 'edit' && (
            <Field
              label="Status"
              htmlFor="u-status"
              hint={isSelf ? 'Você não pode desativar a própria conta.' : 'Usuários inativos não conseguem entrar.'}
            >
              <select id="u-status" name="status" className="adm-input" defaultValue={u?.status} disabled={isSelf}>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </Field>
          )}
        </>
      )}
      {dialog.kind !== 'edit' && (
        <Field
          label={dialog.kind === 'new' ? 'Senha inicial' : 'Nova senha'}
          htmlFor="u-pass"
          hint="Mínimo de 10 caracteres. Informe ao usuário por um canal seguro."
          required
        >
          <input
            id="u-pass"
            name="password"
            type="password"
            className="adm-input"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </Field>
      )}
      {error && (
        <p className="adm-alert" role="alert">
          {error}
        </p>
      )}
      <div className="adm-confirm__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
