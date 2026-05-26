import { apiClient } from './apiClient';
import { getDemoSystemStatus } from './demo.service';
import type { SystemStatus } from '../types/api.types';
import { isDemoMode } from '../utils/constants';

/**
 * @description Solicita estado operativo no sensible del backend.
 * @why Existe para mostrar configuracion relevante sin exponer API keys ni secretos.
 * @returns Estado del sistema para la vista de configuracion.
 * @example const status = await getSystemStatusRequest();
 */
export async function getSystemStatusRequest(): Promise<SystemStatus> {
  if (isDemoMode) {
    return getDemoSystemStatus();
  }

  const response = await apiClient.get<SystemStatus>('/api/system/status');

  return response.data;
}

/**
 * Responsabilidades del archivo:
 * - Encapsular endpoints de estado del sistema.
 * - Mantener secretos fuera del frontend.
 * - Entregar datos tipados a la pagina de settings.
 */
