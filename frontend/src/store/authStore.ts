import { create } from 'zustand';
import type { AuthenticatedUser, AuthTokens } from '../types/api.types';
import { accessTokenStorageKey, refreshTokenStorageKey } from '../utils/constants';

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthenticatedUser, tokens: AuthTokens) => void;
  setUser: (user: AuthenticatedUser) => void;
  logout: () => void;
}

/**
 * @description Guarda usuario autenticado y sincroniza tokens con localStorage.
 * @why Existe para que auth sobreviva recargas y cualquier componente pueda leer sesion.
 * @returns Store Zustand con estado y acciones de autenticacion.
 * @example const user = useAuthStore((state) => state.user);
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: localStorage.getItem(accessTokenStorageKey) !== null,
  setAuth: (user: AuthenticatedUser, tokens: AuthTokens): void => {
    localStorage.setItem(accessTokenStorageKey, tokens.accessToken);
    localStorage.setItem(refreshTokenStorageKey, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },
  setUser: (user: AuthenticatedUser): void => {
    set({ user, isAuthenticated: true });
  },
  logout: (): void => {
    localStorage.removeItem(accessTokenStorageKey);
    localStorage.removeItem(refreshTokenStorageKey);
    set({ user: null, isAuthenticated: false });
  },
}));

/**
 * Responsabilidades del archivo:
 * - Mantener estado global de autenticacion.
 * - Persistir tokens JWT en localStorage.
 * - Exponer logout centralizado.
 */

