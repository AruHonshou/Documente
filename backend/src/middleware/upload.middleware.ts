import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import type { SupportedDocumentMimeType } from '../types/document.types.js';

const supportedMimeTypes = new Set<SupportedDocumentMimeType>(['application/pdf', 'text/plain']);

/**
 * @middleware documentUploadMiddleware
 * @description Recibe un archivo `document` en memoria y valida MIME/tamano antes del controller.
 * @why Necesitamos este middleware para cumplir la regla de no guardar archivos raw en disco.
 * @flow req -> documentUploadMiddleware -> document controller si el archivo es valido
 */
export const documentUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback): void => {
    if (!isSupportedMimeType(file.mimetype)) {
      callback(new Error('UNSUPPORTED_DOCUMENT_TYPE'));
      return;
    }

    callback(null, true);
  },
}).single('document');

/**
 * @middleware handleDocumentUpload
 * @description Ejecuta Multer y traduce errores de upload a respuestas JSON consistentes.
 * @why Existe para que errores de tamano o MIME no lleguen como HTML generico de Express.
 * @flow req -> handleDocumentUpload -> document controller si el archivo pasa validaciones
 */
export function handleDocumentUpload(req: Request, res: Response, next: NextFunction): void {
  documentUploadMiddleware(req, res, (error: unknown): void => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ message: `El archivo supera el limite de ${env.MAX_FILE_SIZE_MB} MB.` });
      return;
    }

    if (error instanceof Error && error.message === 'UNSUPPORTED_DOCUMENT_TYPE') {
      res.status(415).json({ message: 'Tipo de documento no soportado. Por ahora se aceptan PDF y TXT.' });
      return;
    }

    if (error !== undefined) {
      res.status(400).json({ message: 'No se pudo procesar el archivo subido.' });
      return;
    }

    next();
  });
}

/**
 * @description Verifica si el MIME type pertenece a los formatos soportados por el pipeline actual.
 * @why Existe para evitar procesar archivos que no sabemos extraer de forma segura todavia.
 * @param mimeType - MIME type reportado por Multer.
 * @returns `true` si el documento puede procesarse; `false` si debe rechazarse.
 * @example isSupportedMimeType('application/pdf');
 */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedDocumentMimeType {
  return supportedMimeTypes.has(mimeType as SupportedDocumentMimeType);
}

/**
 * Responsabilidades del archivo:
 * - Configurar Multer con memoria en lugar de disco.
 * - Validar tamano maximo desde variables de entorno.
 * - Traducir errores de carga a JSON estable para el frontend.
 * - Aceptar solamente PDF y TXT hasta aprobar una libreria para DOCX.
 */
