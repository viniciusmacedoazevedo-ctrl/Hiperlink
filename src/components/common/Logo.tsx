import hiperlinkLogo from '../../assets/logos/hiperlink-logo-transparent.png';
import psgLogo from '../../assets/logos/psg-dados-logo-transparent.png';

/**
 * Logos oficiais SEM fundo branco (o desenho não é alterado — veja docs/remove-logo-bg.py).
 * Como parte das letras é escura (preto/azul-marinho), um contorno claro fino
 * (.logo-img) garante a leitura sobre os fundos escuros do site.
 */
const logos = {
  hiperlink: {
    src: hiperlinkLogo,
    width: 154,
    height: 59,
    alt: 'Hiperlink — Gestão em Tecnologia',
  },
  psg: {
    src: psgLogo,
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
  eager?: boolean;
  /** Sobre fundos claros o contorno não é necessário. */
  onLight?: boolean;
}

export function Logo({ brand, height, className = '', eager = false, onLight = false }: LogoProps) {
  const logo = logos[brand];
  const width = Math.round((logo.width / logo.height) * height);
  return (
    <img
      src={logo.src}
      alt={logo.alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`logo-img ${onLight ? 'logo-img--on-light' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}
