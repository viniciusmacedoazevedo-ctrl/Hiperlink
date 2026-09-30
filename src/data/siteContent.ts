/**
 * Conteúdo administrável exibido no site (clientes e depoimentos).
 * Fonte oficial: API pública somente leitura (/api/public/*), alimentada pelo painel /admin.
 * server/seed.json é o conteúdo inicial e também a reserva quando a API não estiver disponível
 * (ex.: publicação em hospedagem puramente estática).
 */
import seed from '../../server/seed.json';

export interface PublicClient {
  id: string;
  name: string;
  slug: string;
  /** URL de imagem da biblioteca de mídia (/media/…) ou vazio. */
  logo: string;
  /** Ícone exibido quando não há logo. */
  icon: string;
  category: string;
  description: string;
  caseText: string;
  services: string[];
}

/** Estrutura entregue pelo backend: o frontend não precisa decidir quem é destaque. */
export interface PublicClients {
  featured: PublicClient | null;
  highlights: PublicClient[];
  normal: PublicClient[];
}

export interface PublicTestimonial {
  id: string;
  company: string;
  companyLogo: string;
  personName: string;
  personRole: string;
  personPhoto: string;
  content: string;
  featured: boolean;
}

interface SeedClient {
  name: string;
  slug: string;
  icon?: string;
  caseText?: string;
  services?: string[];
  status?: string;
  highlightLevel?: string;
}

const seedClients = (seed.clients as SeedClient[])
  .filter((c) => (c.status ?? 'PUBLISHED') === 'PUBLISHED')
  .map((c) => ({
    level: c.highlightLevel ?? 'NORMAL',
    client: {
      id: c.slug,
      name: c.name,
      slug: c.slug,
      logo: '',
      icon: c.icon ?? 'building',
      category: '',
      description: '',
      caseText: c.caseText ?? '',
      services: c.services ?? [],
    } satisfies PublicClient,
  }));

export const seedPublicClients: PublicClients = {
  featured: seedClients.find((c) => c.level === 'FEATURED')?.client ?? null,
  highlights: seedClients.filter((c) => c.level === 'HIGHLIGHT').map((c) => c.client),
  normal: seedClients.filter((c) => c.level === 'NORMAL').map((c) => c.client),
};
