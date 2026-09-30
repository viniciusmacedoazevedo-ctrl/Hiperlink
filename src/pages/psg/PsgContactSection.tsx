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

/** Enquanto um dado não for informado em src/data/psgDados.ts, exibe um placeholder identificado. */
function Placeholder() {
  return (
    <span className="psg-contact__placeholder">
      <span className="placeholder-badge">A inserir</span>
      <span>{contact.placeholder}</span>
    </span>
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
          <div data-reveal data-reveal-delay="180">
            <TransitionLink href="/" theme="hiperlink" className="btn btn--ghost psg-contact__back">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar para a Hiperlink
            </TransitionLink>
          </div>
        </div>

        <div className="psg-contact__panel glass" data-reveal="right" data-reveal-delay="120">
          <ul className="psg-contact__list">
            <Row icon={<Phone size={20} aria-hidden="true" />} label="Telefone">
              {contact.phones.length ? (
                contact.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="psg-contact__value">
                    {p}
                  </a>
                ))
              ) : (
                <Placeholder />
              )}
            </Row>
            <Row icon={<MessageCircle size={20} aria-hidden="true" />} label="WhatsApp">
              {contact.whatsapp ? (
                <a
                  href={whatsappHref(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__value"
                >
                  Conversar pelo WhatsApp
                </a>
              ) : (
                <Placeholder />
              )}
            </Row>
            <Row icon={<AtSign size={20} aria-hidden="true" />} label="E-mail">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="psg-contact__value">
                  {contact.email}
                </a>
              ) : (
                <Placeholder />
              )}
            </Row>
            <Row icon={<Globe size={20} aria-hidden="true" />} label="Site">
              {contact.website ? (
                <a
                  href={websiteHref(contact.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__value"
                >
                  {contact.website}
                </a>
              ) : (
                <Placeholder />
              )}
            </Row>
            <Row icon={<MapPin size={20} aria-hidden="true" />} label="Endereço">
              {contact.addressLines.length ? (
                <a
                  href={mapsHref(contact.addressLines)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="psg-contact__value"
                >
                  {contact.addressLines.join(', ')}
                </a>
              ) : (
                <Placeholder />
              )}
            </Row>
          </ul>
          {contact.email && (
            <div className="psg-contact__form">
              <ProposalForm email={contact.email} company="PSG Dados" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
