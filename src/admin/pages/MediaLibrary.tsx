import { useId, useRef, useState } from 'react';
import { Copy, RotateCcw, Save, Trash, Upload } from 'lucide-react';
import { api, type Media } from '../api';
import { useAuth } from '../auth';
import { ACCEPT, errorMessage, formatDate, formatSize, uploadFile, useConfirm, useToast } from '../ui';
import { useApi } from '../useApi';

export function MediaLibrary() {
  const { can } = useAuth();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [trash, setTrash] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data, error, reload } = useApi(() => api.media(trash), [trash]);
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of Array.from(files)) {
      try {
        await uploadFile(f);
        ok++;
      } catch (e) {
        toast('error', `${f.name}: ${errorMessage(e)}`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = '';
    if (ok) toast('ok', `${ok} imagem(ns) enviada(s).`);
    reload();
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Mídia</h1>
          <p>Biblioteca de imagens usada em logos, fotos e demais conteúdos. PNG, JPG ou WebP, até 2 MB cada.</p>
        </div>
        {can('media.upload') && !trash && (
          <>
            <input
              ref={input}
              id={inputId}
              type="file"
              multiple
              accept={ACCEPT.join(',')}
              className="sr-only"
              onChange={(e) => upload(e.target.files)}
            />
            <label htmlFor={inputId} className="btn btn--primary btn--sm adm-upload__btn" aria-busy={busy}>
              <Upload size={16} aria-hidden="true" /> {busy ? 'Enviando…' : 'Enviar imagens'}
            </label>
          </>
        )}
      </div>

      {can('media.restore') && (
        <div className="adm-toolbar">
          <div className="adm-tabs" role="tablist" aria-label="Filtrar mídia">
            <button
              type="button"
              role="tab"
              aria-selected={!trash}
              className={!trash ? 'is-active' : undefined}
              onClick={() => setTrash(false)}
            >
              Biblioteca
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={trash}
              className={trash ? 'is-active' : undefined}
              onClick={() => setTrash(true)}
            >
              <Trash size={14} aria-hidden="true" /> Lixeira
            </button>
          </div>
        </div>
      )}

      {error && <p className="adm-alert">{error}</p>}
      {!data ? (
        <div className="adm-loading" aria-busy="true" aria-label="Carregando" />
      ) : data.length === 0 ? (
        <p className="adm-card adm-empty">{trash ? 'A lixeira está vazia.' : 'Nenhuma imagem enviada ainda.'}</p>
      ) : (
        <ul className="adm-media-grid">
          {data.map((m) => (
            <MediaCard key={`${m.id}-${m.altText}`} m={m} trash={trash} reload={reload} confirm={confirm} />
          ))}
        </ul>
      )}
      {dialog}
    </>
  );
}

function MediaCard({
  m,
  trash,
  reload,
  confirm,
}: {
  m: Media;
  trash: boolean;
  reload: () => Promise<void>;
  confirm: (t: string) => Promise<boolean>;
}) {
  const { can } = useAuth();
  const toast = useToast();
  const [alt, setAlt] = useState(m.altText);
  const altId = useId();
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast('ok', ok);
      await reload();
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };
  return (
    <li className="adm-card adm-media-card">
      <div className="adm-media-card__thumb">
        <img src={trash ? undefined : m.url} alt={m.altText || ''} loading="lazy" />
      </div>
      <div className="adm-media-card__body">
        <strong title={m.originalFilename}>{m.originalFilename}</strong>
        <small>
          {formatSize(m.size)} · {formatDate(m.createdAt)}
          {m.uploadedByName ? ` · ${m.uploadedByName}` : ''}
        </small>
        <small className={m.usage ? 'adm-media-card__used' : undefined}>
          {m.usage ? `Em uso (${m.usage})` : 'Não utilizada'}
        </small>
        {!trash && can('media.update') && (
          <div className="adm-media-card__alt">
            <label htmlFor={altId} className="sr-only">
              Texto alternativo de {m.originalFilename}
            </label>
            <input
              id={altId}
              className="adm-input"
              placeholder="Texto alternativo"
              value={alt}
              maxLength={200}
              onChange={(e) => setAlt(e.target.value)}
            />
            {alt !== m.altText && (
              <button
                type="button"
                className="adm-icon-btn adm-icon-btn--sm"
                aria-label="Salvar texto alternativo"
                onClick={() => act(() => api.updateMedia(m.id, alt), 'Texto alternativo salvo.')}
              >
                <Save size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="adm-media-card__actions">
          {trash ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => act(() => api.restoreMedia(m.id), 'Imagem restaurada.')}
            >
              <RotateCcw size={15} aria-hidden="true" /> Restaurar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="adm-link-btn"
                onClick={() =>
                  navigator.clipboard
                    ?.writeText(new URL(m.url, window.location.origin).href)
                    .then(() => toast('ok', 'Endereço copiado.'))
                }
              >
                <Copy size={15} aria-hidden="true" /> Copiar endereço
              </button>
              {can('media.delete') && (
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger adm-icon-btn--sm"
                  aria-label={`Excluir ${m.originalFilename}`}
                  onClick={async () => {
                    if (await confirm(`Mover “${m.originalFilename}” para a lixeira?`))
                      act(() => api.deleteMedia(m.id), 'Imagem movida para a lixeira.');
                  }}
                >
                  <Trash size={15} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}
