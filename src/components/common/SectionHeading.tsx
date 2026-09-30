import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: 'left' | 'center' | 'split';
  as?: 'h1' | 'h2';
}

export function SectionHeading({ eyebrow, title, intro, id, align = 'left', as: Tag = 'h2' }: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      <div>
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__line" aria-hidden="true" />
          {eyebrow}
        </p>
        <Tag id={id} className="section-title" data-reveal data-reveal-delay="60">
          {title}
        </Tag>
      </div>
      {intro && (
        <p className="section-intro" data-reveal data-reveal-delay="120">
          {intro}
        </p>
      )}
    </header>
  );
}
