import type { Request, Response } from 'express';
import { askQuestion, askQuestionStreaming, createChatSession, listChatSessions, listSessionMessages } from '../services/chat.service.js';
import { getOpenAiClientErrorMessage } from '../utils/openAiError.js';
import type { AskQuestionInput, CreateSessionInput } from '../validators/chat.validator.js';

/**
 * @description Crea una nueva sesion de chat para un documento.
 * @why Existe para separar la request HTTP de la persistencia de sesiones.
 * @param req - Request con usuario autenticado y body validado.
 * @param res - Response usada para devolver la sesion.
 * @returns No devuelve valor; responde JSON.
 * @example POST /api/chat/sessions
 */
export function createSessionController(req: Request, res: Response): void {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  try {
    const input = req.body as CreateSessionInput;
    const session = createChatSession(req.user, input.documentId, input.title);

    res.status(201).json({ session });
  } catch {
    res.status(404).json({ message: 'Documento no encontrado para este usuario.' });
  }
}

/**
 * @description Lista sesiones de chat del usuario autenticado.
 * @why Existe para que el frontend pueda mostrar conversaciones recientes.
 * @param req - Request con usuario autenticado.
 * @param res - Response usada para devolver sesiones.
 * @returns No devuelve valor; responde JSON.
 * @example GET /api/chat/sessions
 */
export function listSessionsController(req: Request, res: Response): void {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  res.status(200).json({ sessions: listChatSessions(req.user) });
}

/**
 * @description Lista mensajes de una sesion protegida.
 * @why Existe para restaurar una conversacion al abrir el chat.
 * @param req - Request con usuario autenticado y sessionId validado.
 * @param res - Response usada para devolver mensajes.
 * @returns No devuelve valor; responde JSON.
 * @example GET /api/chat/sessions/1/messages
 */
export function listMessagesController(req: Request, res: Response): void {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  try {
    const sessionId = Number(req.params.sessionId);
    const messages = listSessionMessages(req.user, sessionId);

    res.status(200).json({ messages });
  } catch {
    res.status(404).json({ message: 'Sesion no encontrada para este usuario.' });
  }
}

/**
 * @description Procesa una pregunta del usuario contra un documento.
 * @why Existe para conectar HTTP con el chat service y el RAGAgent.
 * @param req - Request con pregunta validada.
 * @param res - Response usada para devolver mensajes creados.
 * @returns Promesa sin valor; responde JSON.
 * @example POST /api/chat/ask
 */
export async function askQuestionController(req: Request, res: Response): Promise<void> {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  try {
    const input = req.body as AskQuestionInput;
    const result = await askQuestion(req.user, input);

    res.status(201).json(result);
  } catch (error) {
    const openAiMessage = getOpenAiClientErrorMessage(error);

    if (openAiMessage !== null) {
      res.status(openAiMessage.includes('cuota') ? 429 : 500).json({ message: openAiMessage });
      return;
    }

    res.status(400).json({ message: 'No se pudo responder la pregunta con el documento seleccionado.' });
  }
}

/**
 * @description Procesa una pregunta y emite la respuesta como eventos NDJSON.
 * @why Existe para que el frontend pueda pintar la respuesta de forma progresiva usando fetch streaming con JWT.
 * @param req - Request con pregunta validada.
 * @param res - Response configurada como stream.
 * @returns Promesa sin valor; escribe eventos hasta cerrar la respuesta.
 * @example POST /api/chat/ask/stream
 */
export async function askQuestionStreamController(req: Request, res: Response): Promise<void> {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const input = req.body as AskQuestionInput;
    const result = await askQuestionStreaming(
      req.user,
      input,
      (delta): void => {
        writeStreamEvent(res, { type: 'assistant_delta', delta });
      },
      (session, userMessage): void => {
        writeStreamEvent(res, { type: 'session', session });
        writeStreamEvent(res, { type: 'user_message', message: userMessage });
      },
    );

    writeStreamEvent(res, { type: 'assistant_done', message: result.assistantMessage });
    res.end();
  } catch (error) {
    writeStreamEvent(res, { type: 'error', message: getOpenAiClientErrorMessage(error) ?? 'No se pudo generar una respuesta RAG.' });
    res.end();
  }
}

/**
 * @description Escribe un objeto JSON como linea NDJSON.
 * @why Existe para mantener un formato facil de parsear en streams de fetch.
 * @param res - Response Express abierta.
 * @param event - Evento serializable que recibira el frontend.
 * @returns No devuelve valor; escribe en el stream.
 * @example writeStreamEvent(res, { type: 'assistant_delta', delta: 'hola' });
 */
function writeStreamEvent(res: Response, event: Record<string, unknown>): void {
  res.write(`${JSON.stringify(event)}\n`);
}

/**
 * Responsabilidades del archivo:
 * - Exponer sesiones y preguntas por HTTP.
 * - Verificar usuario autenticado antes de delegar.
 * - Traducir errores de dominio a respuestas JSON o eventos NDJSON.
 */
