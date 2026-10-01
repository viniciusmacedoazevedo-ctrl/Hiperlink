import { brand, contact, nav } from '../../data/psgDados';
import { SiteFooter } from '../../components/common/SiteFooter';

export function PsgFooter() {
  const year = new Date().getFullYear();
  return (
    <SiteFooter
      brand="psg"
      tagline={`${brand.tagline}.`}
      nav={nav.filter((n) => n.href !== '#incluido')}
      phone={contact.phones[0]}
      whatsapp={contact.whatsapp}
      email={contact.email}
      website={contact.website}
      legal={
        <>
          © {year} {brand.name} — {brand.tagline}. CNPJ: {contact.cnpj}
        </>
      }
    />
  );
}
