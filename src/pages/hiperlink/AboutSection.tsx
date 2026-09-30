import { Check, Quote } from 'lucide-react';
import { about } from '../../data/hiperlink';
import { Counter } from '../../components/common/Counter';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useParallax } from '../../hooks/useParallax';

export function AboutSection() {
  const stackRef = useParallax<HTMLDivElement>(0.06);

  return (
    <section id="sobre" className="section hl-about" aria-labelledby="sobre-title">
      <div className="container hl-about__grid">
        <div className="hl-about__copy">
          <SectionHeading
            id="sobre-title"
            eyebrow={about.eyebrow}
            title={
              <>
                Sobre a <span className="hl">Hiperlink</span>
              </>
            }
          />
          <div className="hl-about__text">
            {about.paragraphs.map((p, i) => (
              <p key={i} data-reveal data-reveal-delay={String(i * 80)}>
                {p}
              </p>
            ))}
          </div>

          <ul className="hl-about__areas" aria-label="Áreas de atuação">
            {about.areas.map((area, i) => (
              <li key={area} data-reveal data-reveal-delay={String(i * 50)}>
                <span className="hl-about__check" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div className="hl-about__visual">
          <div className="iso-stack" ref={stackRef} data-reveal="scale">
            {about.stats.map((s, i) => (
              <div key={s.label} className={`iso-slab iso-slab--${i + 1}`}>
                <div className="iso-slab__face glass">
                  <span className="iso-slab__value">
                    {s.value !== undefined ? <Counter value={s.value} suffix={s.suffix} /> : s.text}
                  </span>
                  <span className="iso-slab__label">{s.label}</span>
                </div>
              </div>
            ))}
            <div className="iso-stack__beam" aria-hidden="true" />
          </div>

          <div className="hl-about__cards">
            <article className="card hl-diff" data-reveal>
              <h3>
                <Icon name="gem" size={20} />
                {about.differential.title}
              </h3>
              <p>{about.differential.text}</p>
            </article>

            <figure className="hl-quote" data-reveal data-reveal-delay="100">
              <Quote className="hl-quote__mark" size={28} aria-hidden="true" />
              <blockquote>
                <p>{about.quote.text}</p>
              </blockquote>
              <figcaption>
                <strong>{about.quote.author}</strong>
                <span>{about.quote.role}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
