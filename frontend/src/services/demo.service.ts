import type { AuthResponse, ChatMessage, ChatSession, SourceChunk, StoredDocument, SystemStatus } from '../types/api.types';

const demoUser = {
  id: 1,
  email: 'demo@documente.dev',
};

const demoSources: SourceChunk[] = [
  {
    chunkId: 101,
    documentId: 1,
    documentName: 'Arquitectura RAG - Demo.pdf',
    text: 'El backend valida JWT, procesa documentos en memoria, divide texto en chunks y guarda embeddings serializados en SQLite.',
    score: 0.91,
    chunkIndex: 0,
  },
  {
    chunkId: 102,
    documentId: 1,
    documentName: 'Arquitectura RAG - Demo.pdf',
    text: 'El RAGAgent decide entre busqueda normal, resumen y extraccion de keywords antes de generar una respuesta con fuentes.',
    score: 0.87,
    chunkIndex: 1,
  },
];

let demoDocuments: StoredDocument[] = [
  {
    id: 1,
    userId: demoUser.id,
    name: 'Arquitectura RAG - Demo.pdf',
    size: 248000,
    chunkCount: 18,
    createdAt: new Date('2026-05-20T12:00:00.000Z').toISOString(),
  },
  {
    id: 2,
    userId: demoUser.id,
    name: 'Checklist Seguridad IA.txt',
    size: 42000,
    chunkCount: 7,
    createdAt: new Date('2026-05-21T16:30:00.000Z').toISOString(),
  },
];

let demoSessions: ChatSession[] = [];
let demoMessages: ChatMessage[] = [];

/**
 * @description Simula una espera corta de red para el modo demo.
 * @why Existe para que GitHub Pages muestre una experiencia realista sin backend ni API key.
 * @param milliseconds - Duracion artificial de la espera.
 * @returns Promesa que se resuelve despues del tiempo indicado.
 * @example await waitForDemoNetwork(200);
 */
async function waitForDemoNetwork(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

/**
 * @description Devuelve una respuesta de autenticacion falsa para la demo estatica.
 * @why Existe para mostrar el flujo completo en GitHub Pages sin exponer un backend publico.
 * @returns Usuario demo y tokens no validos para APIs reales.
 * @example const auth = await getDemoAuthResponse();
 */
export async function getDemoAuthResponse(): Promise<AuthResponse> {
  await waitForDemoNetwork(250);

  return {
    user: demoUser,
    tokens: {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    },
  };
}

/**
 * @description Lista documentos de ejemplo y documentos subidos durante la sesion demo.
 * @why Existe para que el dashboard pueda ensenar gestion de documentos sin SQLite real.
 * @returns Documentos disponibles en memoria del navegador.
 * @example const documents = await listDemoDocuments();
 */
export async function listDemoDocuments(): Promise<StoredDocument[]> {
  await waitForDemoNetwork(200);

  return demoDocuments;
}

/**
 * @description Crea un documento demo desde un archivo seleccionado.
 * @why Existe para demostrar el flujo visual de upload sin procesar embeddings reales.
 * @param file - Archivo elegido por el usuario en la UI.
 * @returns Documento simulado que representa el resultado del backend real.
 * @example const document = await uploadDemoDocument(file);
 */
export async function uploadDemoDocument(file: File): Promise<StoredDocument> {
  await waitForDemoNetwork(400);

  const document: StoredDocument = {
    id: Date.now(),
    userId: demoUser.id,
    name: file.name,
    size: file.size,
    chunkCount: Math.max(3, Math.ceil(file.size / 30000)),
    createdAt: new Date().toISOString(),
  };

  demoDocuments = [document, ...demoDocuments];

  return document;
}

/**
 * @description Elimina un documento de la lista demo en memoria.
 * @why Existe para mostrar la experiencia de administracion aunque GitHub Pages sea estatico.
 * @param documentId - Identificador del documento demo.
 * @returns Promesa sin valor al terminar la simulacion.
 * @example await deleteDemoDocument(1);
 */
export async function deleteDemoDocument(documentId: number): Promise<void> {
  await waitForDemoNetwork(200);
  demoDocuments = demoDocuments.filter((document) => document.id !== documentId);
  demoSessions = demoSessions.filter((session) => session.documentId !== documentId);
  demoMessages = demoMessages.filter((message) => demoSessions.some((session) => session.id === message.sessionId));
}

/**
 * @description Lista sesiones de chat creadas durante la demo.
 * @why Existe para mantener el contrato del backend en la publicacion estatica.
 * @returns Sesiones demo ordenadas por creacion.
 * @example const sessions = await listDemoSessions();
 */
export async function listDemoSessions(): Promise<ChatSession[]> {
  await waitForDemoNetwork(150);

  return demoSessions;
}

/**
 * @description Lista mensajes de una sesion demo.
 * @why Existe para permitir reabrir conversaciones en memoria durante la demo.
 * @param sessionId - Identificador de sesion demo.
 * @returns Mensajes asociados a la sesion.
 * @example const messages = await listDemoMessages(1);
 */
export async function listDemoMessages(sessionId: number): Promise<ChatMessage[]> {
  await waitForDemoNetwork(150);

  return demoMessages.filter((message) => message.sessionId === sessionId);
}

/**
 * @description Emite eventos de chat simulando streaming de una respuesta RAG.
 * @why Existe para que GitHub Pages demuestre UX, fuentes y agentes sin consumir OpenAI.
 * @param documentId - Documento consultado.
 * @param question - Pregunta escrita por el usuario.
 * @param onEvent - Callback que recibe los mismos eventos que el backend NDJSON.
 * @param sessionId - Sesion existente opcional.
 * @returns Promesa que finaliza cuando la respuesta demo fue emitida.
 * @example await streamDemoAnswer(1, 'Resumen', handleEvent);
 */
export async function streamDemoAnswer(
  documentId: number,
  question: string,
  onEvent: (event: { type: string; [key: string]: unknown }) => void,
  sessionId?: number,
): Promise<void> {
  const session = getOrCreateDemoSession(documentId, question, sessionId);
  const userMessage = createDemoMessage(session.id, 'user', question, []);
  const answer = buildDemoAnswer(question);
  const assistantMessage = createDemoMessage(session.id, 'assistant', answer, demoSources);

  onEvent({ type: 'session', session });
  onEvent({ type: 'user_message', message: userMessage });

  for (const token of answer.split(' ')) {
    await waitForDemoNetwork(45);
    onEvent({ type: 'assistant_delta', delta: `${token} ` });
  }

  onEvent({ type: 'assistant_done', message: assistantMessage });
}

/**
 * @description Devuelve estado tecnico simulado para la pantalla de settings.
 * @why Existe para que la demo publica explique la configuracion sin backend real.
 * @returns Estado compatible con `GET /api/system/status`.
 * @example const status = await getDemoSystemStatus();
 */
export async function getDemoSystemStatus(): Promise<SystemStatus> {
  await waitForDemoNetwork(150);

  return {
    status: 'ok',
    openAiConfigured: false,
    chatModel: 'gpt-4o',
    maxChunksContext: 5,
    minSimilarityScore: 0.15,
    maxFileSizeMb: 10,
  };
}

/**
 * @description Obtiene o crea una sesion demo para un documento.
 * @why Existe para que mensajes consecutivos compartan historial visual.
 * @param documentId - Documento seleccionado.
 * @param question - Primera pregunta usada para titulo.
 * @param sessionId - Sesion opcional existente.
 * @returns Sesion demo persistida en memoria.
 * @example const session = getOrCreateDemoSession(1, 'Resumen');
 */
function getOrCreateDemoSession(documentId: number, question: string, sessionId?: number): ChatSession {
  const existing = sessionId === undefined ? undefined : demoSessions.find((session) => session.id === sessionId);

  if (existing !== undefined) {
    return existing;
  }

  const session: ChatSession = {
    id: Date.now(),
    userId: demoUser.id,
    documentId,
    title: question.length <= 80 ? question : `${question.slice(0, 77)}...`,
    createdAt: new Date().toISOString(),
  };

  demoSessions = [session, ...demoSessions];

  return session;
}

/**
 * @description Crea y guarda un mensaje demo en memoria.
 * @why Existe para mantener la misma forma de datos que el backend real.
 * @param sessionId - Sesion asociada al mensaje.
 * @param role - Rol del mensaje en la conversacion.
 * @param content - Texto del mensaje.
 * @param sources - Fuentes usadas por respuestas del asistente.
 * @returns Mensaje demo tipado.
 * @example const message = createDemoMessage(1, 'assistant', 'Hola', []);
 */
function createDemoMessage(sessionId: number, role: ChatMessage['role'], content: string, sources: SourceChunk[]): ChatMessage {
  const message: ChatMessage = {
    id: Date.now() + demoMessages.length,
    sessionId,
    role,
    content,
    sources,
    createdAt: new Date().toISOString(),
  };

  demoMessages = [...demoMessages, message];

  return message;
}

/**
 * @description Construye una respuesta demo segun la intencion de la pregunta.
 * @why Existe para demostrar agentes, RAG y fuentes sin depender de OpenAI.
 * @param question - Pregunta del usuario.
 * @returns Respuesta didactica lista para streaming simulado.
 * @example const answer = buildDemoAnswer('resumen');
 */
function buildDemoAnswer(question: string): string {
  if (/\b(resumen|resumir|summary)\b/i.test(question)) {
    return 'Resumen demo: DocuMente procesa documentos en memoria, genera chunks con overlap, calcula embeddings y usa un agente RAG para responder con fuentes verificables.';
  }

  if (/\b(keyword|keywords|palabras clave|temas)\b/i.test(question)) {
    return 'Palabras clave demo: autenticacion JWT, ownership check, SQLite, embeddings, similitud coseno, agentes, skills, streaming y CI.';
  }

  return 'Respuesta demo: el sistema buscaria chunks semanticamente cercanos, construiria contexto seguro y pediria al modelo una respuesta basada solo en esas fuentes.';
}

/**
 * Responsabilidades del archivo:
 * - Simular backend, SQLite y OpenAI para GitHub Pages.
 * - Mantener contratos TypeScript iguales a la API real.
 * - Permitir una demo publica sin secretos ni costos.
 */
