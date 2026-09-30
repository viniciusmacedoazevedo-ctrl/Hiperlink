import { ArrowUp } from 'lucide-react';
import { brand, contact, nav, psgBridge } from '../../data/hiperlink';
import { Logo } from '../../components/common/Logo';
import { TransitionLink } from '../../components/common/TransitionLink';
import { telHref, websiteHref } from '../../lib/contact';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo brand="hiperlink" height={48} />
            <p>{brand.motto}.</p>
          </div>
          <nav aria-label="Rodapé">
            <h3>Navegação</h3>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              <li>
                <TransitionLink href={psgBridge.href} theme="psg">
                  PSG Dados
                </TransitionLink>
              </li>
            </ul>
          </nav>
          <div>
            <h3>Contato</h3>
            <ul>
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={telHref(p)}>{p}</a>
                </li>
              ))}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.website && (
                <li>
                  <a href={websiteHref(contact.website)} target="_blank" rel="noopener noreferrer">
                    {contact.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>
            © {year} Hiperlink — {brand.tagline}. CNPJ: {contact.cnpj}
          </p>
          <a href="#topo" className="back-to-top">
            Voltar ao topo <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
