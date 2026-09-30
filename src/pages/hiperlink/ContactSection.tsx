import { useCallback, useState } from 'react';
import { ArrowRight, AtSign, Globe, MapPin, MessageCircle, Phone } from 'lucide-react';
import { contact } from '../../data/hiperlink';
import { Modal } from '../../components/common/Modal';
import { ProposalForm } from '../../components/common/ProposalForm';
import { mapsHref, telHref, websiteHref, whatsappHref } from '../../lib/contact';

export function ContactSection() {
  const [formOpen, setFormOpen] = useState(false);
  const close = useCallback(() => setFormOpen(false), []);

  return (
    <section id="contato" className="hl-contact" aria-labelledby="contato-title">
      <div className="hl-contact__info section">
        <div className="hl-contact__info-inner">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            {contact.eyebrow}
          </p>
          <h2 id="contato-title" className="section-title" data-reveal>
            {contact.title}
          </h2>

          <ul className="contact-list">
            <li data-reveal>
              <span className="icon-badge">
                <MapPin size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>Endereço</h3>
                <address>
                  {contact.addressLines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </address>
                <a
                  className="contact-list__link"
                  href={mapsHref(contact.addressLines)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no mapa <span className="sr-only">(abre em nova aba)</span>
                </a>
              </div>
            </li>
            <li data-reveal data-reveal-delay="80">
              <span className="icon-badge">
                <Phone size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>Telefones</h3>
                {contact.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="contact-list__value">
                    {p}
                  </a>
                ))}
              </div>
            </li>
            {contact.whatsapp && (
              <li data-reveal data-reveal-delay="120">
                <span className="icon-badge">
                  <MessageCircle size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>WhatsApp</h3>
                  <a
                    href={whatsappHref(contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-list__value"
                  >
                    Conversar pelo WhatsApp
                  </a>
                </div>
              </li>
            )}
            <li data-reveal data-reveal-delay="160">
              <span className="icon-badge">
                <AtSign size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>Canais digitais</h3>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="contact-list__value">
                    {contact.email}
                  </a>
                )}
                {contact.website && (
                  <a
                    href={websiteHref(contact.website)}
                    className="contact-list__value"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe size={15} aria-hidden="true" /> {contact.website}
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                )}
              </div>
            </li>
          </ul>
          <p className="hl-contact__cnpj">CNPJ: {contact.cnpj}</p>
        </div>
      </div>

      <div className="hl-contact__cta">
        <div className="hl-contact__cta-inner" data-reveal="right">
          <svg className="hl-contact__bubbles" viewBox="0 0 64 56" aria-hidden="true">
            <path d="M24 4C12 4 4 11 4 20c0 5 2.6 9.4 6.8 12.3L9 40l8.6-4.3c2 .5 4.2.8 6.4.8 12 0 20-7.3 20-16.5S36 4 24 4Z" />
            <path d="M46 22c8 1.4 14 7 14 13.6 0 3.9-2 7.3-5.3 9.6L56 52l-7-3.4c-1.4.3-2.8.4-4.3.4-6.3 0-11.8-2.8-14.4-6.9" />
          </svg>
          <h2 className="hl-contact__cta-title">{contact.ctaTitle}</h2>
          <p>{contact.ctaText}</p>
          <button type="button" className="btn btn--dark" onClick={() => setFormOpen(true)} aria-haspopup="dialog">
            {contact.ctaButton}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Modal open={formOpen} onClose={close} labelledBy="proposal-title">
        <p className="eyebrow">
          <span className="eyebrow__line" aria-hidden="true" />
          Hiperlink
        </p>
        <h2 id="proposal-title" className="modal-title">
          {contact.ctaButton}
        </h2>
        <p className="modal-lead">{contact.ctaText}</p>
        {contact.email && <ProposalForm email={contact.email} company="Hiperlink" />}
      </Modal>
    </section>
  );
}
