import type { IconName } from '../components/common/Icon';

export interface NavLink {
  label: string;
  href: string;
}

export interface IconCard {
  icon: IconName;
  title: string;
  text: string;
  /** Rótulo curto exibido no rodapé do card (ex.: "COMPROMISSO"). */
  tag?: string;
}

export interface ContactInfo {
  addressLines: string[];
  phones: string[];
  /** Não informado nos materiais — preencher quando disponível (apenas dígitos com DDI, ex.: "5584999999999"). */
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  cnpj?: string;
}
