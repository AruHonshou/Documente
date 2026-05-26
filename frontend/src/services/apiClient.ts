import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types/api.types';
import { accessTokenStorageKey, apiBaseUrl, refreshTokenStorageKey } from '../utils/constants';

interface RetriableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * @description Crea la instancia Axios central del frontend.
 * @why Existe para compartir URL base, header Authorization y refresh automatico entre services.
 * @returns Cliente Axios configurado para la API del backend.
 * @example const response = await apiClient.get('/api/health');
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: apiBaseUrl,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(accessTokenStorageKey);

    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<unknown> => {
      const originalRequest = error.config as RetriableAxiosRequestConfig | undefined;
      const refreshToken = localStorage.getItem(refreshTokenStorageKey);

      if (error.response?.status !== 401 || originalRequest === undefined || originalRequest._retry === true || refreshToken === null) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post<AuthResponse>(`${apiBaseUrl}/api/auth/refresh`, { refreshToken });

        useAuthStore.getState().setAuth(response.data.user, response.data.tokens);
        originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    },
  );

  return client;
}

export const apiClient = createApiClient();

/**
 * Responsabilidades del archivo:
 * - Configurar Axios una sola vez.
 * - Inyectar access token en requests autenticadas.
 * - Renovar tokens automaticamente cuando el access token expira.
 * - Aislar la URL base del resto de services.
 */

