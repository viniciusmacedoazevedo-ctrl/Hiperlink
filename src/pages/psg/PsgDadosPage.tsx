import { ArrowLeft } from 'lucide-react';
import { hero, nav } from '../../data/psgDados';
import { Header } from '../../components/common/Header';
import { Logo } from '../../components/common/Logo';
import { SkipLink } from '../../components/common/SkipLink';
import { TransitionLink } from '../../components/common/TransitionLink';
import { useRevealObserver } from '../../hooks/useRevealObserver';
import { BackupSection } from './BackupSection';
import { IncludedSection } from './IncludedSection';
import { InvestmentSection } from './InvestmentSection';
import { ManagementSection } from './ManagementSection';
import { ObjectiveSection } from './ObjectiveSection';
import { ProvisionsSection } from './ProvisionsSection';
import { PsgContactSection } from './PsgContactSection';
import { PsgFooter } from './PsgFooter';
import { PsgHeroSection } from './PsgHeroSection';
import { StagesSection } from './StagesSection';

export function PsgDadosPage() {
  useRevealObserver();

  const backLink = (
    <TransitionLink
      href="/"
      theme="hiperlink"
      className="switch-link switch-link--hiperlink"
      aria-label="Voltar para a Hiperlink"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <Logo brand="hiperlink" height={24} />
    </TransitionLink>
  );
  const backLinkMobile = (
    <TransitionLink href="/" theme="hiperlink" className="switch-link switch-link--hiperlink">
      <ArrowLeft size={16} aria-hidden="true" />
      <Logo brand="hiperlink" height={26} />
      <span>Voltar para a Hiperlink</span>
    </TransitionLink>
  );

  return (
    <>
      <SkipLink />
      <Header
        brand="psg"
        homeLabel="PSG Dados — voltar ao início"
        nav={nav}
        cta={{ label: hero.secondaryCta.label, href: '#contato' }}
        switchLink={backLink}
        switchLinkMobile={backLinkMobile}
        deferBrand
      />
      <main id="conteudo" tabIndex={-1}>
        {/* Hierarquia: proteção/backup → gestão (segurança, governança, infraestrutura) → conformidade CNJ */}
        <PsgHeroSection />
        <BackupSection />
        <ManagementSection />
        <IncludedSection />
        <ProvisionsSection />
        <StagesSection />
        <InvestmentSection />
        <ObjectiveSection />
        <PsgContactSection />
      </main>
      <PsgFooter />
    </>
  );
}
