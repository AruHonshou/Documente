import axios from 'axios';
import { apiClient } from './apiClient';
import { getDemoAuthResponse } from './demo.service';
import type { AuthResponse } from '../types/api.types';
import { isDemoMode } from '../utils/constants';

/**
 * @description Extrae un mensaje entendible desde errores Axios o de red.
 * @why Existe para que la UI no muestre mensajes equivocados cuando el backend esta apagado.
 * @param error - Error desconocido lanzado por Axios.
 * @returns Mensaje seguro para mostrar al usuario.
 * @example const message = getAuthErrorMessage(error);
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrio un error inesperado.';
  }

  if (error.response?.data !== undefined && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return String(error.response.data.message);
  }

  if (error.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el backend. Verifica que la API este corriendo en el puerto 3000.';
  }

  return 'No se pudo completar la autenticacion.';
}

/**
 * @description Registra un usuario nuevo contra la API.
 * @why Existe para aislar el endpoint de auth del resto de la UI.
 * @param email - Email ingresado por el usuario.
 * @param password - Contraseña ingresada por el usuario.
 * @returns Usuario autenticado y tokens JWT.
 * @example const auth = await registerRequest(email, password);
 */
export async function registerRequest(email: string, password: string): Promise<AuthResponse> {
  if (isDemoMode) {
    return getDemoAuthResponse();
  }

  const response = await apiClient.post<AuthResponse>('/api/auth/register', { email, password });

  return response.data;
}

/**
 * @description Inicia sesion contra la API.
 * @why Existe para que formularios no conozcan detalles de Axios.
 * @param email - Email normalizado por el formulario.
 * @param password - Contraseña ingresada por el usuario.
 * @returns Usuario autenticado y tokens JWT.
 * @example const auth = await loginRequest(email, password);
 */
export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  if (isDemoMode) {
    return getDemoAuthResponse();
  }

  const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });

  return response.data;
}

/**
 * @description Obtiene el usuario actual usando el access token guardado.
 * @why Existe para restaurar sesion al recargar la aplicacion.
 * @returns Usuario autenticado dentro de un objeto `user`.
 * @example const { user } = await meRequest();
 */
export async function meRequest(): Promise<Pick<AuthResponse, 'user'>> {
  if (isDemoMode) {
    const auth = await getDemoAuthResponse();

    return { user: auth.user };
  }

  const response = await apiClient.get<Pick<AuthResponse, 'user'>>('/api/auth/me');

  return response.data;
}

/**
 * @description Renueva tokens usando el refresh token guardado por el cliente.
 * @why Existe para que el frontend pueda recuperarse automaticamente cuando expira el access token.
 * @param refreshToken - Token de refresco persistido en localStorage.
 * @returns Usuario autenticado y nuevo par de tokens.
 * @example const auth = await refreshTokenRequest(refreshToken);
 */
export async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
  if (isDemoMode) {
    return getDemoAuthResponse();
  }

  const response = await apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken });

  return response.data;
}

/**
 * Responsabilidades del archivo:
 * - Encapsular endpoints de autenticacion.
 * - Traducir errores de Axios a mensajes utiles.
 * - Devolver datos ya tipados para stores/hooks.
 * - Mantener formularios desacoplados de rutas HTTP.
 */
