import hiperlinkLogo from '../../assets/logos/hiperlink-logo.webp';
import hiperlinkMark from '../../assets/logos/hiperlink-simbolo.webp';
import psgLogo from '../../assets/logos/psg-dados-logo-transparent.png';

/**
 * Logos oficiais SEM fundo (o desenho não é alterado).
 * - hiperlink: logo completo enviado pelo cliente (letras claras, feito para fundo escuro);
 * - hiperlink-mark: símbolo “HL”, para espaços pequenos;
 * - psg: fundo branco removido (docs/remove-logo-bg.py). Como as letras são escuras,
 *   recebe um contorno claro fino (.logo-img--outline) para leitura nos fundos escuros.
 */
const logos = {
  hiperlink: {
    src: hiperlinkLogo,
    width: 732,
    height: 212,
    alt: 'Hiperlink — Gestão em Tecnologia',
    outline: false,
  },
  'hiperlink-mark': {
    src: hiperlinkMark,
    width: 252,
    height: 212,
    alt: 'Hiperlink',
    outline: false,
  },
  psg: {
    src: psgLogo,
    width: 720,
    height: 353,
    alt: 'PSG Dados — Políticas, Segurança e Governança de Dados',
    outline: true,
  },
} as const;

interface LogoProps {
  brand: keyof typeof logos;
  /** Altura de exibição (px); a largura segue a proporção original. */
  height: number;
  className?: string;
  eager?: boolean;
  /** Sobre fundos claros o contorno não é necessário. */
  onLight?: boolean;
  /** Texto alternativo; use '' quando houver texto visível ao lado. */
  alt?: string;
}

export function Logo({ brand, height, className = '', eager = false, onLight = false, alt }: LogoProps) {
  const logo = logos[brand];
  const width = Math.round((logo.width / logo.height) * height);
  return (
    <img
      src={logo.src}
      alt={alt ?? logo.alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`logo-img ${logo.outline && !onLight ? 'logo-img--outline' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}
