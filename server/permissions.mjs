/**
 * Matriz de permissões por perfil.
 * ADMIN: acesso completo. EDITOR: conteúdo e mídia, sem exclusão e sem segurança do sistema.
 */
const EDITOR = [
  'dashboard.view',
  'clients.view',
  'clients.create',
  'clients.update',
  'clients.status',
  'clients.highlight',
  'clients.order',
  'testimonials.view',
  'testimonials.create',
  'testimonials.update',
  'testimonials.status',
  'testimonials.featured',
  'testimonials.order',
  'media.view',
  'media.upload',
  'media.update',
];

const ADMIN_ONLY = [
  'clients.delete',
  'clients.restore',
  'testimonials.delete',
  'testimonials.restore',
  'media.delete',
  'media.restore',
  'users.manage',
  'audit.view',
  'settings.manage',
];

export const PERMISSIONS = {
  ADMIN: [...EDITOR, ...ADMIN_ONLY],
  EDITOR,
};

export const can = (role, permission) => Boolean(PERMISSIONS[role]?.includes(permission));
