import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal acessível baseado em <dialog>: foco preso, Esc para fechar,
 * clique fora fecha, foco retorna ao elemento que abriu.
 */
export function Modal({ open, onClose, labelledBy, children, className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
      document.documentElement.classList.add('has-modal');
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.classList.remove('has-modal');
      if (opener.current instanceof HTMLElement) opener.current.focus();
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="modal__panel">
        <button type="button" className="modal__close" onClick={() => ref.current?.close()} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
        {open && children}
      </div>
    </dialog>
  );
}
