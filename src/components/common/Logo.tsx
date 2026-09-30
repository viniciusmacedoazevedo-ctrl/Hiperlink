import hiperlinkLogo from '../../assets/logos/hiperlink-logo.png';
import psgLogo from '../../assets/logos/psg-dados-logo.webp';

/**
 * Logos oficiais, exibidos sem recoloração nem redesenho.
 * Os dois arquivos têm fundo branco e letras escuras; por isso ficam sobre uma
 * "placa" clara (.logo-plate) para manter a leitura em fundos escuros.
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
  plate?: boolean;
  eager?: boolean;
}

export function Logo({ brand, height, className = '', plate = true, eager = false }: LogoProps) {
  const logo = logos[brand];
  const width = Math.round((logo.width / logo.height) * height);
  const img = (
    <img
      src={logo.src}
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
