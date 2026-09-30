import type { Client, Testimonial } from '../data/siteContent';

export type AdminClient = Client & { active: boolean; order: number };
export type AdminTestimonial = Testimonial & { active: boolean; order: number };
export interface AdminContent {
  clients: AdminClient[];
  testimonials: AdminTestimonial[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json', 'x-requested-with': 'fetch' };
  let payload: BodyInit | undefined;
  if (body instanceof File) {
    headers['content-type'] = body.type;
    payload = body;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api/admin${path}`, { method, headers, body: payload, credentials: 'same-origin' });
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem JSON */
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? 'Não foi possível concluir a operação.';
    if (res.status === 401) window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const api = {
  session: () => request<{ authenticated: boolean; user: string | null; enabled: boolean }>('GET', '/session'),
  login: (username: string, password: string) =>
    request<{ ok: true; user: string }>('POST', '/login', { username, password }),
  logout: () => request<{ ok: true }>('POST', '/logout', {}),
  content: () => request<AdminContent>('GET', '/content'),

  createClient: (data: Partial<AdminClient>) => request<AdminClient>('POST', '/clients', data),
  updateClient: (id: string, data: Partial<AdminClient>) =>
    request<AdminClient>('PUT', `/clients/${encodeURIComponent(id)}`, data),
  deleteClient: (id: string) => request<void>('DELETE', `/clients/${encodeURIComponent(id)}`),
  saveClientSettings: (data: {
    superId?: string | null;
    highlights?: Record<string, 'normal' | 'destaque'>;
    order?: string[];
  }) => request<AdminClient[]>('PUT', '/client-settings', data),

  createTestimonial: (data: Partial<AdminTestimonial>) => request<AdminTestimonial>('POST', '/testimonials', data),
  updateTestimonial: (id: string, data: Partial<AdminTestimonial>) =>
    request<AdminTestimonial>('PUT', `/testimonials/${encodeURIComponent(id)}`, data),
  deleteTestimonial: (id: string) => request<void>('DELETE', `/testimonials/${encodeURIComponent(id)}`),
  reorderTestimonials: (order: string[]) => request<AdminTestimonial[]>('PUT', '/testimonials-order', { order }),

  upload: (file: File) => request<{ url: string }>('POST', '/upload', file),
};
