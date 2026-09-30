/** Cliente HTTP do painel + tipos das entidades. */

export type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type HighlightLevel = 'NORMAL' | 'HIGHLIGHT' | 'FEATURED';
export type Role = 'ADMIN' | 'EDITOR';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  icon: string;
  category: string;
  description: string;
  caseText: string;
  services: string[];
  status: Status;
  highlightLevel: HighlightLevel;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Testimonial {
  id: string;
  clientId: string | null;
  clientName: string | null;
  clientLogoUrl: string;
  companyName: string;
  companyLogoUrl: string;
  personName: string;
  personRole: string;
  personPhotoUrl: string;
  content: string;
  status: Status;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Media {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string;
  uploadedBy: string | null;
  uploadedByName: string | null;
  createdAt: string;
  deletedAt: string | null;
  usage: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Dashboard {
  clients: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    highlights: number;
    featured: Client | null;
  };
  testimonials: { total: number; published: number; draft: number; archived: number; featured: number };
  trash: number;
  media: number;
  latestClients: Client[];
  latestTestimonials: Testimonial[];
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
    headers['x-filename'] = encodeURIComponent(body.name);
    payload = body;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload, credentials: 'same-origin' });
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem JSON */
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? 'Não foi possível concluir a operação.';
    if (res.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : '';
};

export const api = {
  // autenticação
  me: () => request<{ user: SessionUser | null }>('GET', '/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: SessionUser }>('POST', '/auth/login', { email, password }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout', {}),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('POST', '/auth/password', { currentPassword, newPassword }),

  dashboard: () => request<Dashboard>('GET', '/admin/dashboard'),

  // clientes
  clients: (p: { deleted?: boolean; status?: string; q?: string } = {}) =>
    request<Client[]>('GET', `/admin/clients${q({ deleted: p.deleted ? '1' : undefined, status: p.status, q: p.q })}`),
  client: (id: string) => request<Client>('GET', `/admin/clients/${encodeURIComponent(id)}`),
  createClient: (data: Partial<Client>) => request<Client>('POST', '/admin/clients', data),
  updateClient: (id: string, data: Partial<Client>) =>
    request<Client>('PUT', `/admin/clients/${encodeURIComponent(id)}`, data),
  clientStatus: (id: string, status: Status) =>
    request<Client>('PATCH', `/admin/clients/${encodeURIComponent(id)}/status`, { status }),
  clientHighlight: (id: string, highlightLevel: HighlightLevel) =>
    request<Client>('PATCH', `/admin/clients/${encodeURIComponent(id)}/highlight`, { highlightLevel }),
  clientOrder: (id: string, displayOrder: number) =>
    request<Client>('PATCH', `/admin/clients/${encodeURIComponent(id)}/order`, { displayOrder }),
  deleteClient: (id: string) => request<void>('DELETE', `/admin/clients/${encodeURIComponent(id)}`),
  restoreClient: (id: string) => request<Client>('POST', `/admin/clients/${encodeURIComponent(id)}/restore`),

  // depoimentos
  testimonials: (p: { deleted?: boolean; status?: string; q?: string } = {}) =>
    request<Testimonial[]>(
      'GET',
      `/admin/testimonials${q({ deleted: p.deleted ? '1' : undefined, status: p.status, q: p.q })}`,
    ),
  testimonial: (id: string) => request<Testimonial>('GET', `/admin/testimonials/${encodeURIComponent(id)}`),
  createTestimonial: (data: Partial<Testimonial>) => request<Testimonial>('POST', '/admin/testimonials', data),
  updateTestimonial: (id: string, data: Partial<Testimonial>) =>
    request<Testimonial>('PUT', `/admin/testimonials/${encodeURIComponent(id)}`, data),
  testimonialStatus: (id: string, status: Status) =>
    request<Testimonial>('PATCH', `/admin/testimonials/${encodeURIComponent(id)}/status`, { status }),
  testimonialFeatured: (id: string, featured: boolean) =>
    request<Testimonial>('PATCH', `/admin/testimonials/${encodeURIComponent(id)}/featured`, { featured }),
  testimonialOrder: (id: string, displayOrder: number) =>
    request<Testimonial>('PATCH', `/admin/testimonials/${encodeURIComponent(id)}/order`, { displayOrder }),
  deleteTestimonial: (id: string) => request<void>('DELETE', `/admin/testimonials/${encodeURIComponent(id)}`),
  restoreTestimonial: (id: string) =>
    request<Testimonial>('POST', `/admin/testimonials/${encodeURIComponent(id)}/restore`),

  // mídia
  media: (deleted = false) => request<Media[]>('GET', `/admin/media${deleted ? '?deleted=1' : ''}`),
  uploadMedia: (file: File) => request<Media>('POST', '/admin/media', file),
  updateMedia: (id: string, altText: string) =>
    request<Media>('PATCH', `/admin/media/${encodeURIComponent(id)}`, { altText }),
  deleteMedia: (id: string) => request<void>('DELETE', `/admin/media/${encodeURIComponent(id)}`),
  restoreMedia: (id: string) => request<Media>('POST', `/admin/media/${encodeURIComponent(id)}/restore`),

  // usuários e logs
  users: () => request<User[]>('GET', '/admin/users'),
  createUser: (data: Partial<User> & { password: string }) => request<User>('POST', '/admin/users', data),
  updateUser: (id: string, data: Partial<User>) => request<User>('PUT', `/admin/users/${encodeURIComponent(id)}`, data),
  resetPassword: (id: string, password: string) =>
    request<{ ok: true }>('PATCH', `/admin/users/${encodeURIComponent(id)}/password`, { password }),
  deleteUser: (id: string) => request<void>('DELETE', `/admin/users/${encodeURIComponent(id)}`),
  auditLogs: (p: { limit?: number; offset?: number; entityType?: string } = {}) =>
    request<{ total: number; items: AuditEntry[] }>(
      'GET',
      `/admin/audit-logs${q({ limit: String(p.limit ?? 50), offset: String(p.offset ?? 0), entityType: p.entityType })}`,
    ),
};
