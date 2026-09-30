import { useEffect, useRef, useState } from 'react';
import { Link2 } from 'lucide-react';
import { stages } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';

/**
 * Linha do tempo interativa das 5 etapas.
 * Desktop: painel fixo à esquerda acompanha a etapa em foco durante a rolagem.
 * Celular: linha vertical com os cartões empilhados.
 */
export function StagesSection() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const els = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!('IntersectionObserver' in window) || !els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // progresso da linha conforme a rolagem pela lista
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = list.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
      list.style.setProperty('--line', p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const current = stages.items[active];

  return (
    <section id="etapas" className="section psg-stages" aria-labelledby="etapas-title">
      <div className="psg-stages__bg" aria-hidden="true" />
      <div className="container">
        <header className="stages-heading">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            {stages.eyebrow}
          </p>
          <h2 id="etapas-title" className="section-title" data-reveal data-reveal-delay="60">
            <span className="stages-heading__big">5 etapas</span>
            <span className="stages-heading__sub">Uma jornada completa de adequação</span>
          </h2>
          <p className="section-intro" data-reveal data-reveal-delay="120">
            {stages.intro}
          </p>
        </header>

        <div className="stages-layout">
          <div className="stages-visual" aria-hidden="true">
            <div className="stages-visual__sticky">
              <div className="stage-orbit">
                <div className="stage-orbit__ring" />
                <div className="stage-orbit__ring stage-orbit__ring--2" />
                {stages.items.map((s, i) => (
                  <span
                    key={s.number}
                    className={`stage-orbit__dot ${i <= active ? 'is-done' : ''} ${i === active ? 'is-active' : ''}`}
                    style={{ ['--a' as string]: `${-90 + i * 72}deg` }}
                  >
                    {s.number}
                  </span>
                ))}
                <div className="stage-orbit__core" key={current.number}>
                  <span className="stage-orbit__num">{current.number}</span>
                  <span className="stage-orbit__icon">
                    <Icon name={current.icon} size={34} />
                  </span>
                  <span className="stage-orbit__title">{current.title}</span>
                </div>
              </div>
              <div className="stage-progress">
                <span style={{ ['--p' as string]: (active + 1) / stages.items.length }} />
              </div>
              <p className="stage-progress__label">
                Etapa {active + 1} de {stages.items.length} · sucessivas e cumulativas
              </p>
            </div>
          </div>

          <ol className="stages-list" ref={listRef}>
            {stages.items.map((s, i) => (
              <li
                key={s.number}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-index={i}
                className={`stage-card ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
              >
                <span className="stage-card__node" aria-hidden="true">
                  <Icon name={s.icon} size={20} />
                </span>
                <div className="stage-card__body">
                  <p className="stage-card__num">
                    <span className="sr-only">Etapa </span>
                    {s.number}
                  </p>
                  <h3>{s.title}</h3>
                  <p className="stage-card__desc">{s.description}</p>
                  <div className="stage-card__connection">
                    <p className="stage-card__connection-label">
                      <Link2 size={15} aria-hidden="true" />
                      {stages.connectionLabel}
                    </p>
                    <p>{s.connection}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
