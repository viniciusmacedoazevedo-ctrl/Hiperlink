import { ArrowLeft } from 'lucide-react';
import { brand, contact, nav, normativeSource } from '../../data/psgDados';
import { SiteFooter } from '../../components/common/SiteFooter';
import { TransitionLink } from '../../components/common/TransitionLink';

export function PsgFooter() {
  const year = new Date().getFullYear();
  return (
    <SiteFooter
      brand="psg"
      tagline={`${brand.tagline}.`}
      nav={nav}
      extraNav={[
        <TransitionLink key="hl" href="/" theme="hiperlink" className="footer-inline__back">
          <ArrowLeft size={14} aria-hidden="true" /> Hiperlink
        </TransitionLink>,
      ]}
      phone={contact.phones[0]}
      whatsapp={contact.whatsapp}
      email={contact.email}
      website={contact.website}
      legal={
        <>
          © {year} {brand.name} — {brand.tagline}.
        </>
      }
      note={normativeSource}
    />
  );
}
