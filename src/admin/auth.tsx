import { createContext, useContext } from 'react';
import type { SessionUser } from './api';

interface AuthCtx {
  user: SessionUser;
  can: (permission: string) => boolean;
  logout: () => void;
}
export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthContext');
  return ctx;
}
