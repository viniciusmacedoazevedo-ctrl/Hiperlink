import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, CircleAlert, CircleCheck, ImagePlus, Search, Trash, Upload, X } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { api, ApiError, type HighlightLevel, type Media, type Status } from './api';

/* ---------------------------------------------------------------- avisos (toast) */
type Toast = { id: number; kind: 'ok' | 'error'; text: string };
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>
            {t.kind === 'ok' ? (
              <CircleCheck size={18} aria-hidden="true" />
            ) : (
              <CircleAlert size={18} aria-hidden="true" />
            )}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : 'Falha de conexão. Tente novamente.');

/* ---------------------------------------------------------------- confirmação */
export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    text: string;
    action: string;
    resolve: (v: boolean) => void;
  } | null>(null);
  const confirm = (text: string, { title = 'Confirmar exclusão', action = 'Excluir' } = {}) =>
    new Promise<boolean>((resolve) => setState({ title, text, action, resolve }));
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <Modal open={state !== null} onClose={() => close(false)} labelledBy="confirm-title" className="adm-confirm">
      <h2 id="confirm-title" className="adm-confirm__title">
        {state?.title}
      </h2>
      <p className="adm-confirm__text">{state?.text}</p>
      <div className="adm-confirm__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => close(false)}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger btn--sm" onClick={() => close(true)}>
          <Trash size={16} aria-hidden="true" /> {state?.action}
        </button>
      </div>
    </Modal>
  );
  return { confirm, dialog };
}

/* ---------------------------------------------------------------- campos */
export function Field({
  label,
  hint,
  children,
  required,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className="adm-field">
      <label htmlFor={htmlFor} className="adm-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && <p className="adm-field__hint">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle__track" aria-hidden="true">
        <span className="adm-toggle__thumb" />
      </span>
      <span>{label}</span>
    </label>
  );
}

/** Lista de itens curtos (ex.: serviços prestados). Enter ou vírgula adiciona. */
export function TagInput({
  value,
  onChange,
  id,
  max = 12,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  id: string;
  max?: number;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim().replace(/,$/, '');
    if (v && !value.includes(v) && value.length < max) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className="adm-tags">
      {value.length > 0 && (
        <ul aria-label="Itens adicionados">
          {value.map((t) => (
            <li key={t}>
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remover ${t}`}>
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        className="adm-input"
        value={draft}
        maxLength={60}
        placeholder={value.length >= max ? 'Limite atingido' : 'Digite e pressione Enter'}
        disabled={value.length >= max}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- mídia */
export const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

/** Envia um arquivo validando tipo e tamanho no navegador (o servidor valida de novo). */
export async function uploadFile(file: File): Promise<Media> {
  if (!ACCEPT.includes(file.type)) throw new ApiError('Use uma imagem PNG, JPG ou WebP.', 400);
  if (file.size > 2 * 1024 * 1024) throw new ApiError('A imagem deve ter no máximo 2 MB.', 400);
  return api.uploadMedia(file);
}

export const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Campo de imagem: escolhe da biblioteca de mídia ou envia um arquivo novo
 * (que passa a fazer parte da biblioteca).
 */
export function MediaPicker({
  value,
  onChange,
  label,
  round = false,
  fallbackUrl,
  fallbackNote,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  round?: boolean;
  /** Imagem usada automaticamente quando o campo fica vazio (ex.: logo do cliente relacionado). */
  fallbackUrl?: string;
  fallbackNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const shown = value || fallbackUrl || '';
  return (
    <div className="adm-upload">
      <div className={`adm-upload__preview ${round ? 'is-round' : ''}`}>
        {shown ? <img src={shown} alt={`Pré-visualização: ${label}`} /> : <ImagePlus size={26} aria-hidden="true" />}
      </div>
      <div className="adm-upload__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
          {value ? 'Trocar imagem' : 'Escolher imagem'}
          <span className="sr-only"> — {label}</span>
        </button>
        {value && (
          <button type="button" className="adm-link-btn" onClick={() => onChange('')}>
            Remover
          </button>
        )}
        {!value && fallbackUrl && fallbackNote && <p className="adm-field__hint">{fallbackNote}</p>}
        <p className="adm-field__hint">PNG, JPG ou WebP · até 2 MB · de preferência com fundo transparente.</p>
      </div>
      <MediaDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => {
          onChange(m.url);
          setOpen(false);
        }}
      />
    </div>
  );
}

function MediaDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (m: Media) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="media-dialog-title" className="adm-media-dialog">
      <MediaDialogBody onSelect={onSelect} />
    </Modal>
  );
}

function MediaDialogBody({ onSelect }: { onSelect: (m: Media) => void }) {
  const [items, setItems] = useState<Media[] | null>(null);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    api
      .media()
      .then(setItems)
      .catch((e) => toast('error', errorMessage(e)));
  }, [toast]);
  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const m = await uploadFile(file);
      toast('ok', 'Imagem enviada para a biblioteca.');
      onSelect(m);
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  const list = (items ?? []).filter(
    (m) => !filter || `${m.originalFilename} ${m.altText}`.toLowerCase().includes(filter.toLowerCase()),
  );
  return (
    <>
      <h2 id="media-dialog-title" className="adm-confirm__title">
        Biblioteca de mídia
      </h2>
      <div className="adm-media-dialog__bar">
        <label className="adm-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar imagem</span>
          <input
            className="adm-input"
            placeholder="Buscar pelo nome ou texto alternativo"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        <input
          ref={input}
          id={id}
          type="file"
          accept={ACCEPT.join(',')}
          className="sr-only"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <label htmlFor={id} className="btn btn--primary btn--sm adm-upload__btn" aria-busy={busy}>
          <Upload size={16} aria-hidden="true" /> {busy ? 'Enviando…' : 'Enviar nova'}
        </label>
      </div>
      {items === null ? (
        <div className="adm-loading adm-loading--sm" aria-busy="true" aria-label="Carregando" />
      ) : list.length === 0 ? (
        <p className="adm-empty">Nenhuma imagem na biblioteca. Envie a primeira.</p>
      ) : (
        <ul className="adm-media-pick">
          {list.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onSelect(m)} title={m.originalFilename}>
                <span className="adm-media-pick__thumb">
                  <img src={m.url} alt={m.altText || ''} loading="lazy" />
                </span>
                <span className="adm-media-pick__name">{m.originalFilename}</span>
                <Check size={16} className="adm-media-pick__check" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- rótulos e selos */
export const statusLabel: Record<Status, string> = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };
export const highlightLabel: Record<HighlightLevel, string> = {
  FEATURED: 'Super destaque',
  HIGHLIGHT: 'Destaque',
  NORMAL: 'Normal',
};
export const roleLabel = { ADMIN: 'Administrador', EDITOR: 'Editor' } as const;

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`adm-badge adm-badge--${status.toLowerCase()}`}>{statusLabel[status]}</span>;
}
export function HighlightBadge({ value }: { value: HighlightLevel }) {
  return <span className={`adm-badge adm-badge--${value.toLowerCase()}`}>{highlightLabel[value]}</span>;
}

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
