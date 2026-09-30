import { Quote, UserRound } from 'lucide-react';
import { testimonials } from '../../data/hiperlink';
import { SectionHeading } from '../../components/common/SectionHeading';

/**
 * Estrutura para depoimentos reais.
 * Itens com isPlaceholder: true são exibidos com o selo "Espaço reservado"
 * e nunca como depoimento real. Edite em src/data/hiperlink.ts.
 */
export function TestimonialsSection() {
  if (!testimonials.showSection) return null;
  return (
    <section id="depoimentos" className="section section--light hl-testimonials" aria-labelledby="depoimentos-title">
      <div className="container">
        <SectionHeading
          id="depoimentos-title"
          align="center"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          intro={testimonials.intro}
        />
        <ul className="testimonials-grid">
          {testimonials.items.map((t, i) => (
            <li key={i} data-reveal data-reveal-delay={String(i * 90)}>
              <figure className={`testimonial-card ${t.isPlaceholder ? 'is-placeholder' : 'card'}`}>
                {t.isPlaceholder && <span className="placeholder-badge">Espaço reservado</span>}
                <div className="testimonial-card__company">
                  {t.companyLogo ? (
                    <img src={t.companyLogo} alt={`Logo ${t.company}`} loading="lazy" />
                  ) : (
                    <span className="testimonial-card__logo-slot" aria-hidden="true">
                      LOGO
                    </span>
                  )}
                  <span>{t.company}</span>
                </div>
                <Quote className="testimonial-card__mark" size={26} aria-hidden="true" />
                <blockquote>
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption>
                  {t.personPhoto ? (
                    <img src={t.personPhoto} alt={t.personName ?? ''} className="testimonial-card__photo" />
                  ) : (
                    <span className="testimonial-card__photo testimonial-card__photo--empty" aria-hidden="true">
                      <UserRound size={20} />
                    </span>
                  )}
                  <span>
                    {t.personName && <strong>{t.personName}</strong>}
                    {t.personRole && <small>{t.personRole}</small>}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
