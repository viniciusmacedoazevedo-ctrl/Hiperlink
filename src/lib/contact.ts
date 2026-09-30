/** Utilitários de contato (links tel:, mailto:, mapas). */

export const telHref = (phone: string) => `tel:+55${phone.replace(/\D/g, '')}`;

export const mapsHref = (lines: string[]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lines.join(', '))}`;

export const websiteHref = (site: string) => (site.startsWith('http') ? site : `https://${site}`);

export const whatsappHref = (digits: string) => `https://wa.me/${digits.replace(/\D/g, '')}`;

export function mailtoHref(email: string, subject: string, body?: string) {
  const params = new URLSearchParams({ subject });
  if (body) params.set('body', body);
  // URLSearchParams codifica espaço como "+", que alguns clientes de e-mail não decodificam
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
}
