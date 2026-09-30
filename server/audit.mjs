/** Registro de auditoria: quem fez o quê, em qual entidade, com os dados antes/depois. */
import { db, now } from './db.mjs';

const insert = db.prepare(
  `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

const clean = (data) => {
  if (data === undefined || data === null) return null;
  const copy = { ...data };
  delete copy.password_hash;
  return JSON.stringify(copy);
};

export function audit(req, action, entityType, entityId, oldData, newData) {
  insert.run(
    req.user?.id ?? null,
    action,
    entityType,
    entityId ?? null,
    clean(oldData),
    clean(newData),
    req.ip ?? null,
    String(req.headers['user-agent'] ?? '').slice(0, 300),
    now(),
  );
}
