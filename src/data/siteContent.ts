/**
 * Conteúdo administrável (clientes e depoimentos).
 * A fonte oficial é o painel /admin (API em server/). O arquivo server/seed.json
 * é o conteúdo inicial e também o fallback quando a API não estiver disponível
 * (ex.: publicação em hospedagem puramente estática).
 */
import seed from '../../server/seed.json';
import type { IconName } from '../components/common/Icon';

export type Highlight = 'normal' | 'destaque' | 'super';

export interface Client {
  id: string;
  name: string;
  /** URL de imagem enviada pelo painel (/uploads/…) ou vazio. */
  logo: string;
  /** Ícone exibido quando não há logo. */
  icon: IconName | string;
  description: string;
  segment: string;
  caseText: string;
  services: string[];
  highlight: Highlight;
  active?: boolean;
  order?: number;
}

export interface Testimonial {
  id: string;
  company: string;
  personName: string;
  personRole: string;
  companyLogo: string;
  personPhoto: string;
  quote: string;
  featured: boolean;
  active?: boolean;
  order?: number;
}

export interface SiteContent {
  clients: Client[];
  testimonials: Testimonial[];
}

type Seed = { clients: Client[]; testimonials: Testimonial[] };

/** Conteúdo inicial: apenas itens ativos, na ordem definida. */
export const seedContent: SiteContent = {
  clients: (seed as Seed).clients.filter((c) => c.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  testimonials: (seed as Seed).testimonials
    .filter((t) => t.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
};
