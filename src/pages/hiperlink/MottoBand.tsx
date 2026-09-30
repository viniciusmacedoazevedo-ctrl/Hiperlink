import { brand } from '../../data/hiperlink';

/** Faixa com a ideia central do material: "Tecnologia que gera resultados". */
export function MottoBand() {
  const items = ['Tecnologia que gera resultados', brand.tagline, 'Desde 2005'];
  const row = [...items, ...items, ...items];
  return (
    <section className="motto-wrap" aria-label="Tecnologia que gera resultados desde 2005">
      <div className="motto-band">
        <div className="motto-band__track" aria-hidden="true">
          {[0, 1].map((dup) => (
            <div className="motto-band__row" key={dup}>
              {row.map((t, i) => (
                <span key={`${dup}-${i}`} className={i % 3 === 0 ? 'is-strong' : undefined}>
                  {t}
                  <i className="motto-band__sep" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
