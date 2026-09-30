import { createContext, useCallback, useContext, useId, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, ImagePlus, Trash, X } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { api, ApiError } from './api';
import type { Highlight } from '../data/siteContent';

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
  const [state, setState] = useState<{ text: string; resolve: (v: boolean) => void } | null>(null);
  const confirm = (text: string) => new Promise<boolean>((resolve) => setState({ text, resolve }));
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <Modal open={state !== null} onClose={() => close(false)} labelledBy="confirm-title" className="adm-confirm">
      <h2 id="confirm-title" className="adm-confirm__title">
        Confirmar exclusão
      </h2>
      <p className="adm-confirm__text">{state?.text}</p>
      <div className="adm-confirm__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => close(false)}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger btn--sm" onClick={() => close(true)}>
          <Trash size={16} aria-hidden="true" /> Excluir
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

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

/** Envio de imagem (PNG/JPG/WebP até 2 MB) com pré-visualização. */
export function ImageUpload({
  value,
  onChange,
  label,
  round = false,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  round?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return toast('error', 'Use uma imagem PNG, JPG ou WebP.');
    if (file.size > 2 * 1024 * 1024) return toast('error', 'A imagem deve ter no máximo 2 MB.');
    setBusy(true);
    try {
      const { url } = await api.upload(file);
      onChange(url);
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="adm-upload">
      <div className={`adm-upload__preview ${round ? 'is-round' : ''}`}>
        {value ? <img src={value} alt={`Pré-visualização: ${label}`} /> : <ImagePlus size={26} aria-hidden="true" />}
      </div>
      <div className="adm-upload__actions">
        <input
          ref={input}
          id={id}
          type="file"
          accept={ACCEPT.join(',')}
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <label htmlFor={id} className="btn btn--ghost btn--sm adm-upload__btn" aria-busy={busy}>
          {busy ? 'Enviando…' : value ? 'Trocar imagem' : 'Enviar imagem'}
          <span className="sr-only"> — {label}</span>
        </label>
        {value && (
          <button type="button" className="adm-link-btn" onClick={() => onChange('')}>
            Remover
          </button>
        )}
        <p className="adm-field__hint">PNG, JPG ou WebP · até 2 MB · de preferência com fundo transparente.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- selos */
export const highlightLabel: Record<Highlight, string> = {
  super: 'Super destaque',
  destaque: 'Destaque',
  normal: 'Normal',
};

export function HighlightBadge({ value }: { value: Highlight }) {
  return <span className={`adm-badge adm-badge--${value}`}>{highlightLabel[value]}</span>;
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`adm-badge ${active ? 'adm-badge--on' : 'adm-badge--off'}`}>{active ? 'Ativo' : 'Inativo'}</span>
  );
}
