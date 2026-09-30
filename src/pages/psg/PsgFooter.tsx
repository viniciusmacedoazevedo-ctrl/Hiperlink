import { ArrowLeft, ArrowUp } from 'lucide-react';
import { brand, nav, normativeSource } from '../../data/psgDados';
import { Logo } from '../../components/common/Logo';
import { TransitionLink } from '../../components/common/TransitionLink';

export function PsgFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo brand="psg" height={64} />
            <p>{brand.tagline}.</p>
          </div>
          <nav aria-label="Rodapé">
            <h3>Navegação</h3>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3>Hiperlink</h3>
            <ul>
              <li>
                <TransitionLink href="/" theme="hiperlink">
                  <ArrowLeft size={16} aria-hidden="true" /> Voltar para a Hiperlink
                </TransitionLink>
              </li>
            </ul>
            <p className="site-footer__source">{normativeSource}</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>
            © {year} {brand.name} — {brand.tagline}.
          </p>
          <a href="#topo" className="back-to-top">
            Voltar ao topo <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
