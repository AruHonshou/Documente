/**
 * @description Convierte errores de OpenAI en mensajes seguros para el cliente.
 * @why Existe para evitar respuestas genericas cuando la causa real es cuota, billing o API key.
 * @param error - Error desconocido capturado desde servicios que llaman a OpenAI.
 * @returns Mensaje amigable si el error es reconocible; null si debe usarse fallback.
 * @example const message = getOpenAiClientErrorMessage(error);
 */
export function getOpenAiClientErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  if (error.message.includes('OPENAI_API_KEY_REQUIRED')) {
    return 'OPENAI_API_KEY no esta configurada en el backend.';
  }

  if (error.message.includes('429')) {
    return 'OpenAI rechazo la solicitud por falta de cuota o billing. Revisa el plan del proyecto asociado a la API key.';
  }

  if (error.message.includes('401')) {
    return 'OpenAI rechazo la API key. Verifica que la key sea valida y pertenezca al proyecto correcto.';
  }

  if (error.message.includes('model')) {
    return 'OpenAI no pudo usar el modelo configurado. Verifica OPENAI_CHAT_MODEL y permisos del proyecto.';
  }

  return null;
}

/**
 * Responsabilidades del archivo:
 * - Centralizar mensajes seguros para errores OpenAI.
 * - Evitar duplicar checks por status en controllers.
 * - Mantener secretos fuera de respuestas y logs.
 */

