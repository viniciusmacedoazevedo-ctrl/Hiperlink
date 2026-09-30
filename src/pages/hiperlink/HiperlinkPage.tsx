import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { hero, nav, psgLink, services } from '../../data/hiperlink';
import { Header } from '../../components/common/Header';
import { Logo } from '../../components/common/Logo';
import { SkipLink } from '../../components/common/SkipLink';
import { TransitionLink } from '../../components/common/TransitionLink';
import { useRevealObserver } from '../../hooks/useRevealObserver';
import { AboutSection } from './AboutSection';
import { CasesSection } from './CasesSection';
import { ClientsSection } from './ClientsSection';
import { ContactSection } from './ContactSection';
import { DifferentialsSection } from './DifferentialsSection';
import { Footer } from './Footer';
import { GuidelinesSection } from './GuidelinesSection';
import { HeroSection } from './HeroSection';
import { MottoBand } from './MottoBand';
import { PrinciplesSection } from './PrinciplesSection';
import { ServiceDetailSection } from './ServiceDetailSection';
import { ServicesSection } from './ServicesSection';
import { TeamSection } from './TeamSection';
import { TestimonialsSection } from './TestimonialsSection';

export function HiperlinkPage() {
  useRevealObserver();
  const [scopeTab, setScopeTab] = useState(services.items[0].id);

  const switchLink = (
    <TransitionLink href={psgLink.href} theme="psg" className="switch-link switch-link--psg">
      <Logo brand="psg" height={26} />
      <span>PSG Dados</span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </TransitionLink>
  );

  return (
    <>
      <SkipLink />
      <Header
        brand="hiperlink"
        homeLabel="Hiperlink — voltar ao início"
        nav={nav}
        cta={{ label: hero.secondaryCta.label, href: '#contato' }}
        switchLink={switchLink}
        switchLinkMobile={switchLink}
        deferBrand
      />
      <main id="conteudo" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <MottoBand />
        <GuidelinesSection />
        <PrinciplesSection />
        <ServicesSection onShowScope={setScopeTab} />
        <ServiceDetailSection active={scopeTab} onChange={setScopeTab} />
        <TeamSection />
        <ClientsSection />
        <TestimonialsSection />
        <CasesSection />
        <DifferentialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
