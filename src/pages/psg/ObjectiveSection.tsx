import { ShieldCheck } from 'lucide-react';
import { objective, responsibilityNotice } from '../../data/psgDados';

export function ObjectiveSection() {
  return (
    <section className="psg-objective" aria-label="Objetivo da PSG Dados">
      <div className="container">
        <p className="psg-objective__statement" data-reveal>
          <strong>{objective.lead}</strong> {objective.text}
        </p>
        <p className="psg-objective__notice" data-reveal data-reveal-delay="120">
          <ShieldCheck size={20} aria-hidden="true" />
          {responsibilityNotice}
        </p>
      </div>
    </section>
  );
}
