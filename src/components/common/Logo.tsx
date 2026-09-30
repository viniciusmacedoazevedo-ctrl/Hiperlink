import hiperlinkLogo from '../../assets/logos/hiperlink-logo.png';
import hiperlinkLogoTransparent from '../../assets/logos/hiperlink-logo-transparent.png';
import psgLogo from '../../assets/logos/psg-dados-logo.webp';
import psgLogoTransparent from '../../assets/logos/psg-dados-logo-transparent.png';

/**
 * Logos oficiais, exibidos sem recoloração nem redesenho.
 * Os dois arquivos têm fundo branco e letras escuras; por isso ficam sobre uma
 * "placa" clara (.logo-plate) para manter a leitura em fundos escuros.
 */
const logos = {
  hiperlink: {
    src: hiperlinkLogo,
    /** Mesmo desenho, com o fundo branco convertido em transparência (para superfícies claras em gradiente). */
    transparent: hiperlinkLogoTransparent,
    width: 154,
    height: 59,
    alt: 'Hiperlink — Gestão em Tecnologia',
  },
  psg: {
    src: psgLogo,
    transparent: psgLogoTransparent,
    width: 720,
    height: 353,
    alt: 'PSG Dados — Políticas, Segurança e Governança de Dados',
  },
} as const;

interface LogoProps {
  brand: keyof typeof logos;
  /** Altura de exibição (px); a largura segue a proporção original. */
  height: number;
  className?: string;
  plate?: boolean;
  eager?: boolean;
  /** Usa a versão sem fundo branco (apenas sobre superfícies claras). */
  transparent?: boolean;
}

export function Logo({ brand, height, className = '', plate = true, eager = false, transparent = false }: LogoProps) {
  const logo = logos[brand];
  const width = Math.round((logo.width / logo.height) * height);
  const img = (
    <img
      src={transparent ? logo.transparent : logo.src}
      alt={logo.alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className="logo-img"
      style={{ width, height }}
    />
  );
  if (!plate) return img;
  return <span className={`logo-plate logo-plate--${brand} ${className}`}>{img}</span>;
}
