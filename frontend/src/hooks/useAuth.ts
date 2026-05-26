import { useCallback, useEffect, useState } from 'react';
import { getAuthErrorMessage, loginRequest, meRequest, registerRequest } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * @hook useAuth
 * @description Encapsula login, registro, restauracion de sesion y logout.
 * @why Esta logica no vive en componentes para evitar duplicar manejo de loading/error.
 * @returns Acciones y estado de autenticacion listos para UI.
 */
export function useAuth(): UseAuthResult {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (!isAuthenticated) {
      return;
    }

    meRequest()
      .then((response): void => {
        setUser(response.user);
      })
      .catch((): void => {
        logout();
      });
  }, [isAuthenticated, logout, setUser]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginRequest(email, password);

      setAuth(response.user, response.tokens);
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerRequest(email, password);

      setAuth(response.user, response.tokens);
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}

/**
 * Responsabilidades del archivo:
 * - Coordinar llamadas de autenticacion.
 * - Restaurar usuario desde `/api/auth/me`.
 * - Exponer estado simple a formularios y rutas protegidas.
 */
