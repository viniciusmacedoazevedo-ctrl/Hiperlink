import { brand, contact, nav, psgLink } from '../../data/hiperlink';
import { SiteFooter } from '../../components/common/SiteFooter';
import { TransitionLink } from '../../components/common/TransitionLink';

export function Footer() {
  const year = new Date().getFullYear();
  const mobile = contact.phones.find((p) => p.replace(/\D/g, '').endsWith(contact.whatsapp?.slice(-9) ?? '-'));
  return (
    <SiteFooter
      brand="hiperlink"
      tagline={`${brand.motto}.`}
      nav={nav}
      extraNav={[
        <TransitionLink key="psg" href={psgLink.href} theme="psg">
          {psgLink.label}
        </TransitionLink>,
      ]}
      phone={contact.phones[0]}
      whatsapp={contact.whatsapp ? { digits: contact.whatsapp, display: mobile ?? contact.whatsapp } : null}
      email={contact.email}
      website={contact.website}
      legal={
        <>
          © {year} Hiperlink — {brand.tagline}. CNPJ: {contact.cnpj}
        </>
      }
    />
  );
}
