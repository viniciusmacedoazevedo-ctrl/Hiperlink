/**
 * Conteúdo da página Hiperlink ("/").
 *
 * FONTE: PowerPoint "Apresentação Hiperlink" (11 slides).
 * Os textos abaixo foram transcritos do material. Ao editar, mantenha a fidelidade
 * ao conteúdo institucional — não acrescente números, clientes ou certificações
 * que não tenham sido fornecidos pela empresa.
 */
import type { IconName } from '../components/common/Icon';
import type { ContactInfo, IconCard, NavLink } from './types';

export const brand = {
  name: 'Hiperlink',
  tagline: 'Gestão em Tecnologia',
  /** Slide 1 */
  motto: 'Tecnologia que gera resultados desde 2005',
  foundedYear: 2005,
};

export const nav: NavLink[] = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Equipe', href: '#equipe' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Cases', href: '#cases' },
  { label: 'Contato', href: '#contato' },
];

/* ------------------------------------------------------------------ HERO (slide 1) */
export const hero = {
  eyebrow: 'Desde 2005 · 20+ anos de inovação',
  /** Slide 1: "Tecnologia que gera resultados desde 2005" (quebrado em linhas). */
  titleLines: ['Tecnologia', 'que gera'],
  titleHighlight: 'resultados',
  /** Slide 2 */
  subtitle:
    'Somos especializados em inovações tecnológicas e oferecemos um portfólio completo para a modernização do seu negócio.',
  pillars: [
    { icon: 'server', label: 'Administração de TI' },
    { icon: 'shield', label: 'Governança de Dados' },
    { icon: 'cpu', label: 'Infraestrutura & Monitoramento' },
    { icon: 'headset', label: 'Suporte Técnico Especializado' },
  ] satisfies { icon: IconName; label: string }[],
  primaryCta: { label: 'Conheça nossas soluções', href: '#servicos' },
  secondaryCta: { label: 'Fale com a Hiperlink', href: '#contato' },
};

/* ------------------------------------------------------------------ SOBRE (slide 2) */
export const about = {
  eyebrow: 'Quem somos',
  title: 'Sobre a Hiperlink',
  paragraphs: [
    'A Gestão Hiperlink atua no mercado desde 2005, consolidando-se como uma referência em soluções de tecnologia.',
    'Somos especializados em inovações tecnológicas e oferecemos um portfólio completo para a modernização do seu negócio.',
  ],
  areas: [
    'Inovações Tecnológicas',
    'Infraestrutura de Rede',
    'Gestão de Projetos',
    'Consultoria em TI',
    'Cabeamento Estruturado',
    'Suporte Níveis I, II e III',
  ],
  /** Dados presentes no material (slides 1, 2, 5 e 7). `value` numérico é animado. */
  stats: [
    { text: '2005', label: 'Atuando no mercado desde' },
    { value: 20, suffix: '+', label: 'Anos de inovação' },
    { text: 'I · II · III', label: 'Níveis de suporte' },
  ] as { value?: number; suffix?: string; text?: string; label: string }[],
  differential: {
    title: 'Nosso Diferencial',
    text: 'Contamos com um atendimento diferenciado, pensando sempre em soluções voltadas para o ramo de negócios de cada cliente.',
  },
  /** Citação presente no slide 2 do material. */
  quote: {
    text: 'Você não pode simplesmente perguntar ao usuário o que ele quer e então tentar dar-lhe isso. Quando você conseguir terminar o produto, o usuário estará querendo outra coisa.',
    author: 'Steve Jobs',
    role: 'Inspiração de Inovação',
  },
  motto: 'Tecnologia que gera resultados',
};

/* ------------------------------------------------------------------ MISSÃO, VISÃO & VALORES (slide 3) */
export const guidelines = {
  eyebrow: 'Diretrizes corporativas',
  title: 'Missão, Visão & Valores',
  mission: {
    icon: 'rocket' as IconName,
    title: 'Missão',
    tag: 'Compromisso',
    text: 'Entregar soluções de tecnologia que gerem resultados concretos para os negócios dos nossos clientes, transformando desafios em alavancas de crescimento.',
  },
  vision: {
    icon: 'target' as IconName,
    title: 'Visão',
    tag: 'Futuro',
    text: 'Ser referência regional em gestão de TI e inovação, reconhecida pela excelência técnica, confiança e pela construção de parcerias duradouras.',
  },
  values: {
    icon: 'gem' as IconName,
    title: 'Valores',
    tag: 'Pilares',
    items: ['Foco no Cliente', 'Inovação Contínua', 'Transparência e Ética', 'Segurança', 'Excelência Operacional'],
  },
};

/* ------------------------------------------------------------------ PRINCÍPIOS (slide 4) */
export const principles = {
  eyebrow: 'Fundamentos',
  title: 'Nossos Princípios',
  intro: 'A base sólida sobre a qual construímos cada projeto e relacionamento com nossos clientes desde 2005.',
  items: [
    {
      icon: 'lightbulb',
      title: 'Visão e Inovação',
      text: 'Antecipar necessidades e propor melhorias constantes. Buscamos sempre novas tecnologias que possam agregar valor real e modernizar os processos dos nossos clientes.',
    },
    {
      icon: 'chart',
      title: 'Orientação a Resultados',
      text: 'Tecnologia boa é aquela que gera resultados. Nosso foco não é apenas implementar sistemas, mas garantir que eles tragam retorno e eficiência mensurável para o negócio.',
    },
    {
      icon: 'handshake',
      title: 'Atendimento Diferenciado',
      text: 'Soluções sob medida para cada cliente. Entendemos a particularidade de cada ramo de atuação e adaptamos nossa linguagem e suporte para melhor atendê-los.',
    },
    {
      icon: 'refresh',
      title: 'Melhoria Contínua',
      text: 'Se algo está funcionando bem, por que não funcionar melhor? Estamos sempre questionando o status quo para encontrar otimizações e evitar estagnação.',
    },
  ] satisfies IconCard[],
};

/* ------------------------------------------------------------------ SERVIÇOS (slides 5 e 6) */
export interface Service {
  id: string;
  icon: IconName;
  title: string;
  /** Slide 5 — "Nossos Serviços Principais" */
  summary: string;
  /** Slide 6 — "Nossos Serviços em Detalhe" (cada item com um ícone representativo) */
  scope: { label: string; icon: IconName }[];
}

export const services = {
  eyebrow: 'O que fazemos',
  title: 'Nossos Serviços',
  intro:
    'Oferecemos um ecossistema completo de soluções tecnológicas para garantir a continuidade e o crescimento do seu negócio.',
  items: [
    {
      id: 'administracao',
      icon: 'settingsCog',
      title: 'Administração de TI',
      summary:
        'Gestão proativa do ambiente tecnológico, service desk especializado e inventário de ativos para garantir máxima eficiência operacional.',
      scope: [
        { label: 'Service Desk Níveis I, II e III', icon: 'headset' },
        { label: 'Gestão de Ativos e Licenças', icon: 'keyRound' },
        { label: 'Inventário de Hardware/Software', icon: 'hardDrive' },
        { label: 'Monitoramento de Recursos', icon: 'activity' },
      ],
    },
    {
      id: 'comunicacao',
      icon: 'lock',
      title: 'Comunicação Segura',
      summary:
        'Segurança de perímetro com Firewall/UTM, conexões VPN criptografadas e redes Wi-Fi corporativas com autenticação segura.',
      scope: [
        { label: 'Firewall UTM e Proteção de Borda', icon: 'brickWall' },
        { label: 'VPN (Site-to-Site / Client-to-Site)', icon: 'network' },
        { label: 'Segurança de Endpoint', icon: 'devices' },
        { label: 'Filtro de Conteúdo Web', icon: 'funnel' },
      ],
    },
    {
      id: 'governanca',
      icon: 'database',
      title: 'Governança de Dados',
      summary:
        'Definição de políticas, conformidade com LGPD, proteção da informação e estratégias robustas de backup e recuperação.',
      scope: [
        { label: 'Adequação à LGPD', icon: 'scale' },
        { label: 'Políticas de Segurança da Informação', icon: 'fileShield' },
        { label: 'Backup Corporativo e Restore', icon: 'databaseBackup' },
        { label: 'Controle de Acesso e Permissões', icon: 'userLock' },
      ],
    },
    {
      id: 'suporte',
      icon: 'headset',
      title: 'Suporte Técnico',
      summary:
        'Atendimento ágil (Níveis I, II e III) remoto e presencial, focado na rápida resolução de incidentes e satisfação do usuário.',
      scope: [
        { label: 'Atendimento Remoto e Presencial', icon: 'mapPin' },
        { label: 'Acordos de Nível de Serviço (SLA)', icon: 'timer' },
        { label: 'Manutenção Preventiva', icon: 'wrench' },
        { label: 'Relatórios de Atendimentos', icon: 'fileChart' },
      ],
    },
    {
      id: 'infraestrutura',
      icon: 'server',
      title: 'Infraestrutura de TI',
      summary:
        'Projetos de cabeamento estruturado, implementação de redes físicas e lógicas, virtualização e soluções em nuvem híbrida.',
      scope: [
        { label: 'Cabeamento Estruturado', icon: 'cable' },
        { label: 'Redes LAN, WAN e Wi-Fi', icon: 'wifi' },
        { label: 'Servidores e Virtualização', icon: 'server' },
        { label: 'Soluções em Nuvem Híbrida', icon: 'cloud' },
      ],
    },
  ] satisfies Service[],
  excellence: {
    title: 'Excelência',
    quote: 'Tecnologia boa é aquela que gera resultados para sua empresa.',
  },
};

export const serviceDetail = {
  eyebrow: 'Escopo técnico',
  title: 'Nossos Serviços em Detalhe',
  intro: 'Atuação completa para garantir estabilidade, segurança e performance para sua infraestrutura.',
  quality: {
    title: 'Qualidade Garantida',
    text: 'Nossa equipe técnica passa por constantes treinamentos para entregar as melhores práticas do mercado.',
    frameworks: ['ITIL', 'COBIT', 'SCRUM'],
  },
};

/* ------------------------------------------------------------------ EQUIPE (slide 7) */
export const team = {
  eyebrow: 'Capital humano',
  title: 'Nossa Equipe Técnica',
  intro:
    'Um time multidisciplinar preparado para atender demandas complexas com agilidade e conhecimento técnico certificado.',
  items: [
    {
      icon: 'layers',
      title: 'Níveis de Atendimento',
      tag: 'Escalabilidade',
      text: 'Estrutura organizada em níveis I, II e III, garantindo que cada incidente seja tratado pelo especialista adequado, otimizando o tempo de resolução.',
    },
    {
      icon: 'cpu',
      title: 'Especialistas Dedicados',
      tag: 'Know-how',
      text: 'Profissionais com expertise profunda em Redes, Servidores e Segurança, focados na manutenção da integridade e performance da sua infraestrutura.',
    },
    {
      icon: 'badge',
      title: 'Certificação Contínua',
      tag: 'Qualidade',
      text: 'Investimos constantemente na capacitação do nosso time. A cultura de estudo e certificação garante as melhores práticas do mercado em seus projetos.',
    },
    {
      icon: 'zap',
      title: 'Atuação Ágil',
      tag: 'Disponibilidade',
      text: 'Flexibilidade total com suporte Remoto e On-site. Processos padronizados para garantir rapidez e presença quando você mais precisa.',
    },
  ] satisfies IconCard[],
  highlights: ['Equipe Própria e Qualificada', 'Processos ITIL e COBIT', 'Base de Conhecimento Ativa'],
  /** Níveis de atendimento citados no material (slides 2, 5, 6, 7 e 10). */
  levels: ['Nível I', 'Nível II', 'Nível III'],
};

/* ------------------------------------------------------------------ CLIENTES (slide 8) */
/**
 * Textos da seção. A LISTA de clientes (nome, logo, destaque, ordem…) é
 * administrada no painel /admin — conteúdo inicial em server/seed.json.
 */
export const clients = {
  eyebrow: 'Nossa experiência',
  title: 'Nossos Clientes',
  intro: 'Parcerias estratégicas construídas com confiança e resultados de longo prazo.',
  featuredLabel: 'Cliente destaque',
  /** Números exibidos no slide 8. */
  stats: [
    { value: 100, prefix: '+', suffix: '', label: 'Projetos entregues' },
    { value: 98, prefix: '', suffix: '%', label: 'Retenção de clientes' },
  ],
};

/* ------------------------------------------------------------------ DEPOIMENTOS */
/**
 * Textos da seção. Os depoimentos são cadastrados no painel /admin.
 * A seção só aparece quando existir ao menos um depoimento ATIVO.
 */
export const testimonials = {
  eyebrow: 'Experiência dos clientes',
  title: 'Depoimentos',
  intro: 'A experiência de quem conta com a Hiperlink.',
};

/* ------------------------------------------------------------------ CASES (slide 9) */
export interface SuccessCase {
  icon: IconName;
  title: string;
  category: string;
  challenge: string;
  solution: string;
  result: {
    /** Quando houver número no material, ele é animado. */
    number?: { value: number; decimals: number; prefix: string; suffix: string };
    headline?: string;
    label: string;
  };
}

export const cases = {
  eyebrow: 'Resultados comprovados',
  title: 'Cases de Sucesso',
  intro:
    'Transformamos desafios complexos em soluções eficientes. Confira como ajudamos nossos clientes a alcançar novos patamares.',
  items: [
    {
      icon: 'activity',
      title: 'Monitoramento e NOC',
      category: 'Infraestrutura',
      challenge: 'Identificar falhas antes que impactassem a operação crítica do cliente.',
      solution: 'Implantação de NOC 24/7 com alertas proativos e automação de resposta a incidentes.',
      result: { number: { value: 99.9, decimals: 1, prefix: '+', suffix: '%' }, label: 'Disponibilidade' },
    },
    {
      icon: 'wifi',
      title: 'Rede e Wi-Fi Corp.',
      category: 'Conectividade',
      challenge: 'Instabilidade constante e áreas de sombra em múltiplas unidades operacionais.',
      solution: 'Padronização da infraestrutura de rede, heatmap para cobertura total e autenticação segura.',
      result: { headline: 'Estabilidade', label: 'Total da rede' },
    },
    {
      icon: 'mailCheck',
      title: 'E-mail Seguro',
      category: 'Produtividade',
      challenge: 'Riscos de segurança e ferramentas de comunicação descentralizadas.',
      solution: 'Migração para ambiente colaborativo em nuvem com criptografia e proteção anti-phishing.',
      result: { headline: 'Comunicação', label: 'Integrada e segura' },
    },
  ] satisfies SuccessCase[],
};

/* ------------------------------------------------------------------ DIFERENCIAIS (slide 10) */
export const differentials = {
  eyebrow: 'Por que a Hiperlink?',
  title: 'Diferenciais Competitivos',
  intro: 'O que nos torna únicos e a escolha certa para a gestão tecnológica do seu negócio.',
  items: [
    {
      icon: 'calendarCheck',
      title: 'Experiência Sólida',
      text: 'Atuando desde 2005 no mercado, entregando soluções que geram resultados consistentes e duradouros.',
    },
    {
      icon: 'sliders',
      title: 'Atendimento Sob Medida',
      text: 'Soluções personalizadas para a realidade do seu negócio. Não entregamos apenas o que o usuário pede, mas o que a empresa precisa.',
    },
    {
      icon: 'zap',
      title: 'Resposta Ágil',
      text: 'Processos desburocratizados e proximidade com o cliente garantem agilidade na resolução de incidentes e demandas.',
    },
    {
      icon: 'userCog',
      title: 'Equipe Especializada',
      text: 'Profissionais certificados com níveis de atendimento I, II e III, cobrindo desde o suporte básico até a engenharia de redes.',
    },
    {
      icon: 'shield',
      title: 'Segurança Total',
      text: 'Segurança e confiabilidade como premissas básicas. Protegemos seus dados e garantimos a continuidade do seu negócio.',
    },
    {
      icon: 'fileText',
      title: 'Transparência',
      text: 'Documentação completa e clareza em todos os projetos. Você sabe exatamente o que está sendo feito e por quê.',
    },
  ] satisfies IconCard[],
};

/* ------------------------------------------------------------------ CONTATO (slide 11) */
export const contact: ContactInfo & {
  eyebrow: string;
  title: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  addressLabel: string;
} = {
  eyebrow: 'Estamos à disposição',
  title: 'Contatos',
  addressLabel: 'Corporate Tower Center',
  addressLines: ['Corporate Tower Center', 'Av. Amintas Barros, 3700, Lagoa Nova', 'Natal - RN, 59075-810'],
  phones: ['(84) 3234-1513', '(84) 99133-2868'],
  // WhatsApp informado pelo cliente (mesmo número do celular do material). Formato: DDI + DDD + número.
  whatsapp: '5584991332868',
  email: 'denis@gestaohiperlink.com.br',
  website: 'www.gestaohiperlink.com.br',
  cnpj: '07.538.485/0001-10',
  ctaTitle: 'Vamos conversar sobre seus desafios de TI?',
  ctaText: 'Tecnologia que gera resultados para o seu negócio começa com um bom papo.',
  ctaButton: 'Solicitar proposta',
};

/* ------------------------------------------------------------------ LINK PARA A PSG DADOS */
/** Acesso à página da PSG Dados (botão do cabeçalho e rodapé). */
export const psgLink = {
  label: 'PSG Dados',
  href: '/psg-dados',
};
