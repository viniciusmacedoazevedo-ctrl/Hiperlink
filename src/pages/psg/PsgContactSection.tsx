import { ArrowLeft, AtSign, Globe, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { contact } from '../../data/psgDados';
import { ProposalForm } from '../../components/common/ProposalForm';
import { TransitionLink } from '../../components/common/TransitionLink';
import { mapsHref, telHref, websiteHref, whatsappHref } from '../../lib/contact';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="psg-contact__row">
      <span className="icon-badge">{icon}</span>
      <div>
        <h3>{label}</h3>
        {children}
      </div>
    </li>
  );
}

export function PsgContactSection() {
  return (
    <section id="contato" className="section psg-contact" aria-labelledby="psg-contato-title">
      <div className="psg-contact__glow" aria-hidden="true" />
      <div className="container psg-contact__inner">
        <div className="psg-contact__copy">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            Contato
          </p>
          <h2 id="psg-contato-title" className="section-title" data-reveal data-reveal-delay="60">
            {contact.title}
          </h2>
          <p className="section-intro" data-reveal data-reveal-delay="120">
            {contact.text}
          </p>

          <ul className="psg-contact__list" data-reveal data-reveal-delay="160">
            {contact.phones.length > 0 && (
              <Row icon={<Phone size={20} aria-hidden="true" />} label="Telefone">
                {contact.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="psg-contact__value">
                    {p}
                  </a>
                ))}
              </Row>
            )}
            {contact.whatsapp && (
              <Row icon={<MessageCircle size={20} aria-hidden="true" />} label="WhatsApp">
                <a
                  href={whatsappHref(contact.whatsapp.digits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__value"
                >
                  {contact.whatsapp.display}
                  <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
                </a>
              </Row>
            )}
            {contact.email && (
              <Row icon={<AtSign size={20} aria-hidden="true" />} label="E-mail">
                <a href={`mailto:${contact.email}`} className="psg-contact__value">
                  {contact.email}
                </a>
              </Row>
            )}
            {contact.website && (
              <Row icon={<Globe size={20} aria-hidden="true" />} label="Site">
                <a
                  href={websiteHref(contact.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__value"
                >
                  {contact.website}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </Row>
            )}
            {contact.addressLines.length > 0 && (
              <Row icon={<MapPin size={20} aria-hidden="true" />} label="Endereço">
                <address className="psg-contact__address">
                  {contact.addressLines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </address>
                <a
                  href={mapsHref(contact.addressLines)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__map"
                >
                  Ver no mapa <span className="sr-only">(abre em nova aba)</span>
                </a>
              </Row>
            )}
          </ul>

          <div data-reveal data-reveal-delay="200">
            <TransitionLink href="/" theme="hiperlink" className="btn btn--ghost psg-contact__back">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar para a Hiperlink
            </TransitionLink>
          </div>
        </div>

        {contact.email && (
          <div className="psg-contact__panel glass" data-reveal="right" data-reveal-delay="120">
            <h3 className="psg-contact__form-title">Solicitar proposta</h3>
            <ProposalForm email={contact.email} company="PSG Dados" />
          </div>
        )}
      </div>
    </section>
  );
}
