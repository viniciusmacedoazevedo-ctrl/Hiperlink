import { useId, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { mailtoHref } from '../../lib/contact';

interface ProposalFormProps {
  email: string;
  company: string;
}

/**
 * Formulário sem backend: monta um e-mail pré-preenchido no aplicativo do visitante.
 * Para integrar a um serviço de formulários/CRM, substitua o handler de envio.
 */
export function ProposalForm({ email, company }: ProposalFormProps) {
  const id = useId();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const body = [
      `Nome: ${get('nome')}`,
      `Empresa: ${get('empresa')}`,
      `E-mail: ${get('email')}`,
      `Telefone: ${get('telefone')}`,
      '',
      get('mensagem'),
    ].join('\n');
    window.location.href = mailtoHref(email, `Solicitação de proposta — ${company}`, body);
    setSent(true);
  };

  return (
    <form className="proposal-form" onSubmit={onSubmit} noValidate>
      <div className="proposal-form__row">
        <label htmlFor={`${id}-nome`}>
          <span>
            Nome <span aria-hidden="true">*</span>
          </span>
          <input id={`${id}-nome`} name="nome" type="text" autoComplete="name" required />
        </label>
        <label htmlFor={`${id}-empresa`}>
          Empresa
          <input id={`${id}-empresa`} name="empresa" type="text" autoComplete="organization" />
        </label>
      </div>
      <div className="proposal-form__row">
        <label htmlFor={`${id}-email`}>
          <span>
            E-mail <span aria-hidden="true">*</span>
          </span>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
        </label>
        <label htmlFor={`${id}-telefone`}>
          Telefone
          <input id={`${id}-telefone`} name="telefone" type="tel" autoComplete="tel" inputMode="tel" />
        </label>
      </div>
      <label htmlFor={`${id}-mensagem`}>
        <span>
          Como podemos ajudar? <span aria-hidden="true">*</span>
        </span>
        <textarea id={`${id}-mensagem`} name="mensagem" rows={4} required />
      </label>
      <p className="proposal-form__hint">* Campos obrigatórios. O envio abre o seu aplicativo de e-mail.</p>
      <button type="submit" className="btn btn--primary btn--block">
        Enviar solicitação <Send size={18} aria-hidden="true" />
      </button>
      <p className="proposal-form__status" role="status" aria-live="polite">
        {sent ? `Abrimos o seu aplicativo de e-mail com a mensagem para ${email}.` : ''}
      </p>
    </form>
  );
}
