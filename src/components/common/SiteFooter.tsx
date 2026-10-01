import type { ReactNode } from 'react';
import { ArrowUp, AtSign, Globe, MessageCircle, Phone } from 'lucide-react';
import type { NavLink } from '../../data/types';
import { telHref, websiteHref, whatsappHref } from '../../lib/contact';
import { Logo } from './Logo';

interface SiteFooterProps {
  brand: 'hiperlink' | 'psg';
  tagline: string;
  nav: NavLink[];
  /** Itens extras na navegação (ex.: link com transição para a outra página). */
  extraNav?: ReactNode[];
  phone?: string | null;
  whatsapp?: { display: string; digits: string } | null;
  email?: string | null;
  website?: string | null;
  /** Texto da linha inferior (copyright, CNPJ…). */
  legal: ReactNode;
  note?: ReactNode;
}

/** Rodapé compacto: marca, navegação em linha (desktop) e contatos lado a lado. */
export function SiteFooter({
  brand,
  tagline,
  nav,
  extraNav = [],
  phone,
  whatsapp,
  email,
  website,
  legal,
  note,
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo brand={brand} height={brand === 'hiperlink' ? 40 : 52} />
            <p>{tagline}</p>
          </div>

          <nav className="site-footer__nav" aria-label="Rodapé">
            <h3>Navegação</h3>
            <ul className="footer-inline">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              {extraNav.map((item, i) => (
                <li key={`extra-${i}`}>{item}</li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__contact">
            <h3>Contato</h3>
            <ul className="footer-contact">
              {phone && (
                <li>
                  <Phone size={15} aria-hidden="true" />
                  <a href={telHref(phone)}>
                    <span className="sr-only">Telefone: </span>
                    {phone}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <MessageCircle size={15} aria-hidden="true" />
                  <a href={whatsappHref(whatsapp.digits)} target="_blank" rel="noopener noreferrer">
                    <span className="sr-only">WhatsApp: </span>
                    {whatsapp.display}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <AtSign size={15} aria-hidden="true" />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {website && (
                <li>
                  <Globe size={15} aria-hidden="true" />
                  <a href={websiteHref(website)} target="_blank" rel="noopener noreferrer">
                    {website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            {legal}
            {note && <span className="site-footer__note">{note}</span>}
          </p>
          <a href="#topo" className="back-to-top">
            Voltar ao topo <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
