import { Quote, UserRound } from 'lucide-react';
import { testimonials as texts } from '../../data/hiperlink';
import { usePublicTestimonials } from '../../hooks/useSiteContent';
import { SectionHeading } from '../../components/common/SectionHeading';

/**
 * Depoimentos cadastrados no painel /admin. Só os ATIVOS chegam aqui.
 * Sem depoimentos ativos, a seção não é exibida (nenhum texto fictício é mostrado).
 */
export function TestimonialsSection() {
  const items = usePublicTestimonials();
  if (!items?.length) return null;
  // a API já entrega na ordem correta (destaques primeiro)
  const ordered = items;

  return (
    <section id="depoimentos" className="section section--light hl-testimonials" aria-labelledby="depoimentos-title">
      <div className="container">
        <SectionHeading
          id="depoimentos-title"
          align="center"
          eyebrow={texts.eyebrow}
          title={texts.title}
          intro={texts.intro}
        />
        <ul className={`testimonials-grid testimonials-grid--${Math.min(ordered.length, 3)}`}>
          {ordered.map((t, i) => (
            <li
              key={t.id}
              className={t.featured ? 'is-featured' : undefined}
              data-reveal
              data-reveal-delay={String((i % 3) * 90)}
            >
              <figure className={`testimonial-card card ${t.featured ? 'testimonial-card--featured' : ''}`}>
                <div className="testimonial-card__company">
                  {t.companyLogo ? <img src={t.companyLogo} alt={`Logo ${t.company}`} loading="lazy" /> : null}
                  <span>{t.company}</span>
                </div>
                <Quote className="testimonial-card__mark" size={26} aria-hidden="true" />
                <blockquote>
                  <p>{t.content}</p>
                </blockquote>
                <figcaption>
                  {t.personPhoto ? (
                    <img src={t.personPhoto} alt="" className="testimonial-card__photo" loading="lazy" />
                  ) : (
                    <span className="testimonial-card__photo testimonial-card__photo--empty" aria-hidden="true">
                      <UserRound size={20} />
                    </span>
                  )}
                  <span>
                    <strong>{t.personName}</strong>
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
