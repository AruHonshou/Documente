import type { Request, Response } from 'express';
import { deleteUserDocument, listUserDocuments, processUploadedDocument } from '../services/document.service.js';
import { logger } from '../utils/logger.js';
import { getOpenAiClientErrorMessage } from '../utils/openAiError.js';

/**
 * @description Procesa un documento subido por el usuario autenticado y devuelve su metadata.
 * @why Existe para orquestar la request HTTP sin mezclar parsing, embeddings ni SQL.
 * @param req - Request Express con `req.user` y `req.file` agregados por middlewares.
 * @param res - Response Express usada para devolver el resultado al frontend.
 * @returns Promesa sin valor; responde al cliente directamente.
 * @example POST /api/documents con multipart field `document`.
 */
export async function uploadDocumentController(req: Request, res: Response): Promise<void> {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  if (req.file === undefined) {
    res.status(400).json({ message: 'El archivo `document` es requerido.' });
    return;
  }

  try {
    const result = await processUploadedDocument(req.user, req.file);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error al procesar documento.', {
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      requestId: req.requestId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.message === 'EMPTY_DOCUMENT_TEXT') {
      res.status(422).json({ message: 'No se encontro texto util dentro del documento.' });
      return;
    }

    const openAiMessage = getOpenAiClientErrorMessage(error);

    if (openAiMessage !== null) {
      res.status(openAiMessage.includes('cuota') ? 429 : 500).json({ message: openAiMessage });
      return;
    }

    res.status(500).json({ message: 'No se pudo procesar el documento.' });
  }
}

/**
 * @description Lista documentos del usuario autenticado.
 * @why Existe para que el frontend pueda renderizar el dashboard sin acceder a datos de otros usuarios.
 * @param req - Request Express con `req.user` agregado por `requireAuth`.
 * @param res - Response Express usada para devolver documentos.
 * @returns No devuelve valor; responde al cliente directamente.
 * @example GET /api/documents
 */
export function listDocumentsController(req: Request, res: Response): void {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  const documents = listUserDocuments(req.user);

  res.status(200).json({ documents });
}

/**
 * @description Elimina un documento del usuario autenticado.
 * @why Existe para completar la gestion del ciclo de vida de documentos.
 * @param req - Request Express con usuario y `documentId` validado.
 * @param res - Response Express usada para confirmar eliminacion.
 * @returns No devuelve valor; responde al cliente directamente.
 * @example DELETE /api/documents/1
 */
export function deleteDocumentController(req: Request, res: Response): void {
  if (req.user === undefined) {
    res.status(401).json({ message: 'Usuario autenticado requerido.' });
    return;
  }

  try {
    deleteUserDocument(req.user, Number(req.params.documentId));
    res.status(204).send();
  } catch {
    logger.warn('Documento no encontrado al eliminar.', {
      documentId: req.params.documentId,
      requestId: req.requestId,
      userId: req.user.id,
    });
    res.status(404).json({ message: 'Documento no encontrado para este usuario.' });
  }
}

/**
 * Responsabilidades del archivo:
 * - Orquestar endpoints HTTP de documentos.
 * - Validar presencia de usuario y archivo antes del service.
 * - Convertir errores de negocio en status HTTP comprensibles.
 * - Permitir eliminacion segura de documentos propios.
 */
