import { getDatabase } from '../db/connection.js';
import type { AuthenticatedUser } from '../types/auth.types.js';
import type { AskQuestionResult, ChatMessage, ChatSession } from '../types/chat.types.js';
import type { ChatHistoryMessage, SourceChunk } from '../types/rag.types.js';
import type { AskQuestionInput } from '../validators/chat.validator.js';
import { detectRagIntent, runRagAgent } from './agent.service.js';
import { searchDocuments } from './skills/searchDocuments.skill.js';
import { streamAnswer } from './skills/generateAnswer.skill.js';

interface ChatSessionRow {
  id: number;
  user_id: number;
  document_id: number;
  title: string;
  created_at: string;
}

interface ChatMessageRow {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  sources: string | null;
  created_at: string;
}

/**
 * @description Crea una sesion de chat para un documento del usuario.
 * @why Existe para agrupar mensajes por documento y validar propiedad antes de conversar.
 * @param user - Usuario autenticado que sera propietario de la sesion.
 * @param documentId - Documento sobre el que se conversara.
 * @param title - Titulo opcional para mostrar en UI.
 * @returns Sesion persistida.
 * @example const session = createChatSession(user, 10, 'Contrato');
 */
export function createChatSession(user: AuthenticatedUser, documentId: number, title?: string): ChatSession {
  assertDocumentBelongsToUser(user.id, documentId);

  const db = getDatabase();
  const result = db
    .prepare('INSERT INTO chat_sessions (user_id, document_id, title) VALUES (?, ?, ?)')
    .run(user.id, documentId, title ?? 'Nueva conversacion');

  return getChatSessionForUser(user.id, Number(result.lastInsertRowid));
}

/**
 * @description Lista sesiones de chat del usuario.
 * @why Existe para que el frontend pueda reabrir conversaciones por documento.
 * @param user - Usuario autenticado usado como filtro de propiedad.
 * @returns Sesiones ordenadas desde la mas reciente.
 * @example const sessions = listChatSessions(user);
 */
export function listChatSessions(user: AuthenticatedUser): ChatSession[] {
  const rows = getDatabase()
    .prepare(
      `SELECT id, user_id, document_id, title, created_at
       FROM chat_sessions
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
    )
    .all(user.id) as ChatSessionRow[];

  return rows.map(mapSessionRow);
}

/**
 * @description Lista mensajes de una sesion validando que pertenece al usuario.
 * @why Existe para reconstruir el historial sin filtrar mensajes de otros usuarios.
 * @param user - Usuario autenticado.
 * @param sessionId - Sesion solicitada.
 * @returns Mensajes ordenados cronologicamente.
 * @example const messages = listSessionMessages(user, 5);
 */
export function listSessionMessages(user: AuthenticatedUser, sessionId: number): ChatMessage[] {
  getChatSessionForUser(user.id, sessionId);

  const rows = getDatabase()
    .prepare(
      `SELECT id, session_id, role, content, sources, created_at
       FROM messages
       WHERE session_id = ?
       ORDER BY created_at ASC, id ASC`,
    )
    .all(sessionId) as ChatMessageRow[];

  return rows.map(mapMessageRow);
}

/**
 * @description Ejecuta una pregunta contra el RAGAgent y guarda user/assistant messages.
 * @why Existe para mantener transaccional la experiencia conversacional y centralizar persistencia.
 * @param user - Usuario autenticado.
 * @param input - Documento, pregunta y sesion opcional validados por Zod.
 * @returns Sesion usada, mensaje del usuario y respuesta del asistente.
 * @example const result = await askQuestion(user, { documentId, question });
 */
export async function askQuestion(user: AuthenticatedUser, input: AskQuestionInput): Promise<AskQuestionResult> {
  const session = input.sessionId === undefined
    ? createChatSession(user, input.documentId, createTitle(input.question))
    : getChatSessionForUser(user.id, input.sessionId);

  if (session.documentId !== input.documentId) {
    throw new Error('SESSION_DOCUMENT_MISMATCH');
  }

  const history = listSessionMessages(user, session.id).map((message): ChatHistoryMessage => ({
    role: message.role,
    content: message.content,
  }));
  const userMessage = saveMessage(session.id, 'user', input.question, []);
  const agentOutput = await runRagAgent({
    userId: user.id,
    documentId: input.documentId,
    query: input.question,
    chatHistory: history,
  });
  const assistantMessage = saveMessage(session.id, 'assistant', agentOutput.answer, agentOutput.sources);

  return {
    session,
    userMessage,
    assistantMessage,
  };
}

/**
 * @description Ejecuta una pregunta y transmite tokens reales desde OpenAI antes de persistir la respuesta final.
 * @why Existe para entregar streaming real al frontend sin perder historial, fuentes ni validacion de propiedad.
 * @param user - Usuario autenticado.
 * @param input - Documento, pregunta y sesion opcional validados por Zod.
 * @param onDelta - Callback llamado por cada fragmento generado por OpenAI.
 * @param onStart - Callback opcional para emitir sesion y mensaje de usuario antes del primer token.
 * @returns Sesion, mensaje del usuario, mensaje del asistente y fuentes usadas.
 * @example const result = await askQuestionStreaming(user, input, sendDelta, sendStart);
 */
export async function askQuestionStreaming(
  user: AuthenticatedUser,
  input: AskQuestionInput,
  onDelta: (delta: string) => void,
  onStart?: (session: ChatSession, userMessage: ChatMessage) => void,
): Promise<AskQuestionResult> {
  const session = input.sessionId === undefined
    ? createChatSession(user, input.documentId, createTitle(input.question))
    : getChatSessionForUser(user.id, input.sessionId);

  if (session.documentId !== input.documentId) {
    throw new Error('SESSION_DOCUMENT_MISMATCH');
  }

  const history = listSessionMessages(user, session.id).map((message): ChatHistoryMessage => ({
    role: message.role,
    content: message.content,
  }));
  const userMessage = saveMessage(session.id, 'user', input.question, []);
  onStart?.(session, userMessage);

  if (detectRagIntent(input.question) !== 'answer') {
    const agentOutput = await runRagAgent({
      userId: user.id,
      documentId: input.documentId,
      query: input.question,
      chatHistory: history,
    });
    onDelta(agentOutput.answer);

    const assistantMessage = saveMessage(session.id, 'assistant', agentOutput.answer, agentOutput.sources);

    return {
      session,
      userMessage,
      assistantMessage,
    };
  }

  const sources = await searchDocuments(input.question, user.id, input.documentId);
  let answer = '';

  for await (const delta of streamAnswer(input.question, sources, history)) {
    answer += delta;
    onDelta(delta);
  }

  const assistantMessage = saveMessage(
    session.id,
    'assistant',
    answer.trim() || 'No pude generar una respuesta con el contexto disponible.',
    sources,
  );

  return {
    session,
    userMessage,
    assistantMessage,
  };
}

/**
 * @description Verifica que un documento pertenece a un usuario.
 * @why Existe para aplicar la regla de seguridad `user_id check` antes de crear sesiones.
 * @param userId - Usuario autenticado.
 * @param documentId - Documento que se quiere consultar.
 * @returns No devuelve valor; lanza error si no existe o no pertenece.
 * @example assertDocumentBelongsToUser(1, 10);
 */
function assertDocumentBelongsToUser(userId: number, documentId: number): void {
  const row = getDatabase()
    .prepare('SELECT id FROM documents WHERE id = ? AND user_id = ?')
    .get(documentId, userId) as { id: number } | undefined;

  if (row === undefined) {
    throw new Error('DOCUMENT_NOT_FOUND');
  }
}

/**
 * @description Obtiene una sesion verificando propiedad por usuario.
 * @why Existe para que ninguna ruta pueda leer o escribir sesiones ajenas.
 * @param userId - Usuario autenticado.
 * @param sessionId - Sesion solicitada.
 * @returns Sesion encontrada.
 * @example const session = getChatSessionForUser(1, 5);
 */
function getChatSessionForUser(userId: number, sessionId: number): ChatSession {
  const row = getDatabase()
    .prepare(
      `SELECT id, user_id, document_id, title, created_at
       FROM chat_sessions
       WHERE id = ? AND user_id = ?`,
    )
    .get(sessionId, userId) as ChatSessionRow | undefined;

  if (row === undefined) {
    throw new Error('SESSION_NOT_FOUND');
  }

  return mapSessionRow(row);
}

/**
 * @description Guarda un mensaje de chat con fuentes serializadas como JSON.
 * @why Existe para persistir respuestas citables y mantener historial conversacional.
 * @param sessionId - Sesion a la que pertenece el mensaje.
 * @param role - Rol del mensaje: user o assistant.
 * @param content - Texto del mensaje.
 * @param sources - Chunks usados como fuente por el assistant.
 * @returns Mensaje persistido.
 * @example const message = saveMessage(1, 'assistant', answer, sources);
 */
function saveMessage(sessionId: number, role: ChatMessage['role'], content: string, sources: SourceChunk[]): ChatMessage {
  const db = getDatabase();
  const result = db
    .prepare('INSERT INTO messages (session_id, role, content, sources) VALUES (?, ?, ?, ?)')
    .run(sessionId, role, content, role === 'assistant' ? JSON.stringify(sources) : null);
  const row = db
    .prepare('SELECT id, session_id, role, content, sources, created_at FROM messages WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as ChatMessageRow | undefined;

  if (row === undefined) {
    throw new Error('MESSAGE_SAVE_FAILED');
  }

  return mapMessageRow(row);
}

/**
 * @description Crea un titulo corto desde la primera pregunta del usuario.
 * @why Existe para dar contexto visual en la UI sin pedir un titulo manual.
 * @param question - Pregunta original del usuario.
 * @returns Titulo de maximo 80 caracteres.
 * @example const title = createTitle('Que dice el contrato sobre pagos?');
 */
function createTitle(question: string): string {
  return question.length <= 80 ? question : `${question.slice(0, 77)}...`;
}

/**
 * @description Convierte fila SQLite de sesion a objeto camelCase.
 * @why Existe para no filtrar snake_case fuera de la capa de datos.
 * @param row - Fila de chat_sessions.
 * @returns Sesion tipada para controllers.
 * @example const session = mapSessionRow(row);
 */
function mapSessionRow(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    documentId: row.document_id,
    title: row.title,
    createdAt: row.created_at,
  };
}

/**
 * @description Convierte fila SQLite de mensaje a objeto seguro para API.
 * @why Existe para parsear fuentes JSON en un solo lugar.
 * @param row - Fila de messages.
 * @returns Mensaje tipado con fuentes como arreglo.
 * @example const message = mapMessageRow(row);
 */
function mapMessageRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    sources: parseSources(row.sources),
    createdAt: row.created_at,
  };
}

/**
 * @description Parsea fuentes serializadas desde SQLite.
 * @why Existe para tolerar mensajes antiguos o corruptos sin romper el historial.
 * @param sources - JSON guardado o null.
 * @returns Lista de fuentes valida.
 * @example const sources = parseSources(row.sources);
 */
function parseSources(sources: string | null): SourceChunk[] {
  if (sources === null) {
    return [];
  }

  try {
    return JSON.parse(sources) as SourceChunk[];
  } catch {
    return [];
  }
}

/**
 * Responsabilidades del archivo:
 * - Crear y listar sesiones de chat.
 * - Ejecutar preguntas a traves del RAGAgent.
 * - Guardar mensajes y fuentes verificando propiedad por usuario.
 * - Soportar streaming real desde OpenAI.
 */
