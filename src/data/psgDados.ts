/**
 * Conteúdo da página PSG Dados ("/psg-dados").
 *
 * FONTE: folder "PSG Dados CNJ 243.pdf" (3 páginas) e banner institucional da PSG Dados.
 * Os textos foram transcritos do material. NÃO acrescente interpretações jurídicas,
 * garantias de conformidade, preços ou funcionalidades que não constem no documento.
 */
import type { IconName } from '../components/common/Icon';
import type { ContactInfo, IconCard, NavLink } from './types';

export const brand = {
  name: 'PSG Dados',
  tagline: 'Políticas, Segurança e Governança de Dados',
};

export const nav: NavLink[] = [
  { label: 'Provimentos', href: '#provimentos' },
  { label: '5 Etapas', href: '#etapas' },
  { label: 'Gestão', href: '#gestao' },
  { label: 'Incluído', href: '#incluido' },
  { label: 'Backup', href: '#backup' },
  { label: 'Investimento', href: '#investimento' },
  { label: 'Contato', href: '#contato' },
];

/** Aviso literal do folder (página 2). */
export const responsibilityNotice =
  'A PSG Dados atua como apoio técnico especializado. A responsabilidade normativa pelo cumprimento integral permanece com o responsável pela serventia, inclusive na supervisão de fornecedores.';

export const normativeSource =
  'Fonte normativa: Provimento CNJ nº 213/2026, com alterações do Provimento CNJ nº 243/2026.';

/* ------------------------------------------------------------------ HERO (página 1) */
export const hero = {
  eyebrow: 'Provimento CNJ nº 243/2026',
  title: 'Seu cartório protegido, conectado e preparado para não parar.',
  /** Trecho do título destacado visualmente (deve existir dentro de `title`). */
  titleHighlight: 'protegido, conectado',
  subtitle:
    'Uma estrutura de gestão de TI para apoiar a adequação aos padrões mínimos de TIC, segurança, continuidade, proteção de dados, rastreabilidade e governança estabelecidos pelo CNJ.',
  strip: ['Uma única empresa', 'As 5 etapas', 'Um mesmo contrato', 'Início imediato'],
  primaryCta: { label: 'Conheça a solução', href: '#etapas' },
  secondaryCta: { label: 'Fale com a PSG Dados', href: '#contato' },
  /** Faixa institucional (banner fornecido). */
  offerings: [
    { icon: 'users', label: 'Consultoria em Tecnologia da Informação' },
    { icon: 'cloudUpload', label: 'Backup de servidores na nuvem com Acronis Backup' },
  ] satisfies { icon: IconName; label: string }[],
};

/* ------------------------------------------------------------------ PROVIMENTOS (página 1) */
export const provisions = {
  eyebrow: 'Por que isso importa?',
  title: 'O contexto dos Provimentos CNJ',
  items: [
    {
      number: 'nº 213/2026',
      label: 'Provimento CNJ',
      text: 'Estabelece padrões mínimos de TIC para os serviços notariais e de registro, com foco em segurança, integridade, disponibilidade, autenticidade, rastreabilidade e continuidade.',
      status: null as string | null,
    },
    {
      number: 'nº 243/2026',
      label: 'Provimento CNJ',
      text: 'Vigente, alterou o 213 e atualizou critérios de enquadramento e prazos.',
      status: 'Vigente',
    },
  ],
  requirementsLead: 'A norma exige mais do que equipamentos: exige',
  requirements: [
    'governança',
    'políticas',
    'controles',
    'continuidade',
    'proteção do acervo',
    'monitoramento',
    'auditoria',
    'evidências',
    'evolução tecnológica',
  ],
  closing: 'As etapas são sucessivas e cumulativas e a conclusão deve ser comprovada documental e tecnicamente.',
  focus: ['Segurança', 'Integridade', 'Disponibilidade', 'Autenticidade', 'Rastreabilidade', 'Continuidade'],
};

/* ------------------------------------------------------------------ 5 ETAPAS (páginas 1 e 2) */
export interface Stage {
  number: string;
  icon: IconName;
  title: string;
  /** Página 1 — "AS 5 ETAPAS" */
  description: string;
  /** Página 2 — "COMO ISSO SE CONECTA AO PROVIMENTO" */
  connection: string;
}

export const stages = {
  eyebrow: '5 etapas',
  title: 'Uma jornada completa de adequação',
  intro:
    'A PSG Dados organiza a execução técnica e documental para acompanhar o cartório da Etapa 1 à Etapa 5, respeitando a ordem sequencial e cumulativa prevista no Anexo IV.',
  connectionLabel: 'Como isso se conecta ao provimento',
  items: [
    {
      number: '01',
      icon: 'scale',
      title: 'Governança e Conformidade',
      description:
        'Responsabilidades, PSI, LGPD, DPO quando aplicável, acessos, inventário, licenciamento e documentação.',
      connection: 'Governança, PSI, DPO quando aplicável, inventário, acessos, licenciamento, contratos e evidências.',
    },
    {
      number: '02',
      icon: 'server',
      title: 'Infraestrutura e Continuidade',
      description: 'Infraestrutura, conectividade, energia, PCN, PRD, RTO/RPO e suporte técnico.',
      connection: 'Infraestrutura, conectividade, suporte, PCN/PRD, RTO/RPO e arquitetura documentada.',
    },
    {
      number: '03',
      icon: 'shieldCheck',
      title: 'Proteção e Resiliência',
      description: 'Criptografia, backup, redundância, firewall, segmentação, proteção de endpoints e rastreabilidade.',
      connection: 'Criptografia, backup, redundância, firewall, proteção de endpoints e trilhas de auditoria.',
    },
    {
      number: '04',
      icon: 'activity',
      title: 'Monitoramento e Auditoria',
      description:
        'Monitoramento, vulnerabilidades, testes de restauração, simulação de desastre e validação dos controles.',
      connection: 'Monitoramento, vulnerabilidades, testes de restauração, simulação de desastre e auditoria.',
    },
    {
      number: '05',
      icon: 'refresh',
      title: 'Interoperabilidade e Evolução',
      description: 'Padrões abertos, portabilidade, capacitação, revisão e governança tecnológica contínua.',
      connection: 'Interoperabilidade, portabilidade/reversibilidade, capacitação e evolução contínua.',
    },
  ] satisfies Stage[],
};

/* ------------------------------------------------------------------ GESTÃO COMPLETA (página 1) */
export const management = {
  eyebrow: 'Da adequação à operação contínua',
  title: 'Da adequação à operação contínua',
  text: 'A proposta combina consultoria, suporte, infraestrutura, segurança, backup, DPO, hospedagem, e-mail, documentação e monitoramento — criando uma operação contínua para manter o ambiente aderente e preparado para fiscalização.',
  hubLabel: 'PSG Dados',
  nodes: [
    { icon: 'users', label: 'Consultoria' },
    { icon: 'headset', label: 'Suporte' },
    { icon: 'server', label: 'Infraestrutura' },
    { icon: 'shield', label: 'Segurança' },
    { icon: 'database', label: 'Backup' },
    { icon: 'userCheck', label: 'DPO' },
    { icon: 'globe', label: 'Hospedagem' },
    { icon: 'mail', label: 'E-mail' },
    { icon: 'fileText', label: 'Documentação' },
    { icon: 'activity', label: 'Monitoramento' },
  ] satisfies { icon: IconName; label: string }[],
  single: {
    title: 'Uma única empresa • As 5 etapas • Um mesmo contrato • Início imediato',
    text: 'A PSG Dados reúne, em uma única contratação, a estrutura técnica e documental para atuar nas 5 etapas.',
    note: 'Do diagnóstico à operação contínua, sem fragmentar a adequação entre diferentes fornecedores.',
  },
};

/* ------------------------------------------------------------------ O QUE ESTÁ INCLUÍDO (página 2) */
export const included = {
  eyebrow: 'O que está incluído na gestão',
  title: 'O que está incluído',
  intro: 'Uma solução integrada para o dia a dia do cartório e para a jornada de adequação ao CNJ.',
  items: [
    {
      icon: 'headset',
      title: 'Gestão de TI e Suporte N2/N3',
      text: 'Atendimento técnico, diagnóstico, resolução de incidentes e interface com fornecedores.',
    },
    {
      icon: 'globe',
      title: 'Hospedagem e manutenção do site institucional',
      text: 'Hospedagem, manutenção técnica e apoio às publicações e requisitos aplicáveis ao ambiente institucional do cartório.',
    },
    {
      icon: 'mail',
      title: 'E-mail institucional',
      text: 'Hospedagem/administração do e-mail corporativo e apoio à segurança e continuidade do serviço.',
    },
    {
      icon: 'userCheck',
      title: 'DPO / Encarregado de Dados',
      text: 'Designação e atuação do encarregado, quando aplicável, com apoio à governança de dados e LGPD.',
    },
    {
      icon: 'fileText',
      title: 'Políticas, documentos e evidências',
      text: 'PSI, registros, inventário, documentação técnica, relatórios e organização das evidências para fiscalização.',
    },
    {
      icon: 'lifeBuoy',
      title: 'PCN e PRD',
      text: 'Plano de Continuidade de Negócios e Plano de Recuperação de Desastres, com riscos, medidas, RTO e RPO.',
    },
    {
      icon: 'keyRound',
      title: 'Segurança e controle de acessos',
      text: 'MFA, perfis, proteção de endpoints, firewall, vulnerabilidades e gestão de incidentes.',
    },
    {
      icon: 'database',
      title: 'Backup e recuperação',
      text: 'Backup automatizado, monitoramento, armazenamento externo e testes documentados de restauração, conforme dimensionamento.',
    },
    {
      icon: 'clipboard',
      title: 'Gestão de fornecedores e licenças',
      text: 'Revisão de contratos, licenciamento, segurança, reversibilidade e portabilidade do acervo.',
    },
    {
      icon: 'activity',
      title: 'Monitoramento e melhoria contínua',
      text: 'Monitoramento, análise de causa raiz, auditoria, capacitação e evolução tecnológica.',
    },
  ] satisfies IconCard[],
};

/* ------------------------------------------------------------------ BACKUP (páginas 2 e 3 + banner) */
export const backup = {
  eyebrow: 'Backup e recuperação',
  title: 'Backup e recuperação',
  product: 'Backup Acronis / armazenamento',
  bannerLine: 'Backup de servidores na nuvem com Acronis Backup',
  text: 'Backup automatizado, monitoramento, armazenamento externo e testes documentados de restauração, conforme dimensionamento.',
  flow: [
    { icon: 'server', label: 'Backup automatizado' },
    { icon: 'activity', label: 'Monitoramento' },
    { icon: 'cloudUpload', label: 'Armazenamento externo' },
    { icon: 'rotateCcw', label: 'Testes documentados de restauração' },
  ] satisfies { icon: IconName; label: string }[],
  sizingLead: 'Dimensionado conforme',
  sizing: ['Volume', 'Retenção', 'RPO/RTO', 'Arquitetura de backup'],
  related: [
    'Etapa 3 — Criptografia, backup, redundância, firewall, proteção de endpoints e trilhas de auditoria.',
    'Etapa 4 — Monitoramento, vulnerabilidades, testes de restauração, simulação de desastre e auditoria.',
  ],
};

/* ------------------------------------------------------------------ INVESTIMENTO (página 3) */
export interface PriceItem {
  component: string;
  /** null = valor variável, dimensionado conforme o ambiente. */
  price: string | null;
  period?: string;
  description: string;
  icon: IconName;
}

export const investment = {
  eyebrow: 'Investimento',
  title: 'Investimento mensal',
  intro: 'Uma estrutura de TI com custo previsível e componentes variáveis dimensionados conforme o ambiente.',
  fixed: [
    {
      icon: 'settings',
      component: 'Gestão de TI',
      price: 'R$ 600,00',
      period: '/mês',
      description: 'Gestão, suporte técnico, acompanhamento e escopo operacional da proposta-base.',
    },
    {
      icon: 'rocket',
      component: 'Implantação inicial das 5 etapas',
      price: 'R$ 3.000,00',
      period: 'parcela única',
      description: 'Implantação, organização inicial, diagnóstico e estruturação da jornada das 5 etapas.',
    },
  ] satisfies PriceItem[],
  variable: [
    {
      icon: 'shield',
      component: 'Proteção / antivírus',
      price: null,
      description: 'Dimensionado conforme quantidade de estações/servidores e solução adotada.',
    },
    {
      icon: 'database',
      component: 'Backup Acronis / armazenamento',
      price: null,
      description: 'Dimensionado conforme volume, retenção, RPO/RTO e arquitetura de backup.',
    },
    {
      icon: 'lifeBuoy',
      component: 'Disaster Recovery',
      price: null,
      description: 'Dimensionado conforme criticidade, continuidade e arquitetura necessária.',
    },
  ] satisfies PriceItem[],
  variableLabel: 'Variável',
  includedTitle: 'Itens incorporados à gestão',
  includedItems: [
    'Gestão e suporte técnico N2/N3',
    'Hospedagem e manutenção do site institucional',
    'E-mail institucional',
    'DPO / Encarregado de Dados, quando aplicável',
    'Políticas de segurança, LGPD e documentação',
    'Inventário de ativos e gestão de acessos',
    'PCN e PRD, com definição de riscos, RTO e RPO',
    'Gestão de incidentes e vulnerabilidades',
    'Gestão de fornecedores, contratos e licenças',
    'Monitoramento, relatórios e melhoria contínua',
  ],
  important: {
    title: 'Importante',
    text: 'O Provimento admite soluções próprias, contratadas, compartilhadas ou coletivas, desde que atendam integralmente aos requisitos. A PSG Dados dimensiona os componentes técnicos e os investimentos necessários após o diagnóstico do ambiente e da serventia.',
  },
  observation:
    'Observação: o Provimento exige encarregado/DPO quando aplicável. Hospedagem e manutenção de site e e-mail institucional fazem parte do escopo comercial da PSG Dados; o folder não afirma que a hospedagem do site, isoladamente, seja uma exigência específica do Provimento 243/2026.',
};

/* ------------------------------------------------------------------ OBJETIVO (página 2) */
export const objective = {
  lead: 'O objetivo é simples:',
  text: 'reduzir riscos, manter o cartório operando e transformar a adequação em um processo organizado, documentado e contínuo.',
};

/* ------------------------------------------------------------------ CONTATO */
/**
 * ATENÇÃO: o folder não informa dados de contato da PSG Dados.
 * Preencha os campos abaixo quando os dados oficiais forem fornecidos.
 * Enquanto estiverem como null, a página exibe placeholders identificados.
 */
export const contact: ContactInfo & { title: string; text: string; placeholder: string } = {
  title: 'Fale com a PSG Dados',
  text: 'A PSG Dados dimensiona os componentes técnicos e os investimentos necessários após o diagnóstico do ambiente e da serventia.',
  placeholder: '[DADO DE CONTATO DA PSG DADOS A INSERIR]',
  addressLines: [],
  phones: [],
  whatsapp: null,
  email: null,
  website: null,
};
