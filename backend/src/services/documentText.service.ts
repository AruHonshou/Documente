import pdfParse from 'pdf-parse';
import type { ExtractedDocumentText, SupportedDocumentMimeType } from '../types/document.types.js';
import { sanitizeDocumentText } from '../utils/textSanitizer.js';

/**
 * @description Extrae texto limpio desde un archivo soportado cargado en memoria.
 * @why Existe para separar parsing de documentos de controllers y persistencia.
 * @param buffer - Contenido binario del archivo subido por el usuario.
 * @param mimeType - Tipo MIME validado previamente por el upload middleware.
 * @returns Texto sanitizado junto con el MIME type procesado.
 * @example const extracted = await extractDocumentText(file.buffer, 'application/pdf');
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: SupportedDocumentMimeType,
): Promise<ExtractedDocumentText> {
  const rawText = await extractRawText(buffer, mimeType);
  const text = sanitizeDocumentText(rawText);

  if (text.length === 0) {
    throw new Error('EMPTY_DOCUMENT_TEXT');
  }

  return {
    text,
    mimeType,
  };
}

/**
 * @description Selecciona el extractor correcto segun el MIME type del documento.
 * @why Existe para mantener el flujo extensible cuando aprobemos soporte DOCX.
 * @param buffer - Archivo en memoria.
 * @param mimeType - MIME type soportado.
 * @returns Texto crudo antes de sanitizar.
 * @example const text = await extractRawText(buffer, 'text/plain');
 */
async function extractRawText(buffer: Buffer, mimeType: SupportedDocumentMimeType): Promise<string> {
  if (mimeType === 'text/plain') {
    return buffer.toString('utf8');
  }

  if (mimeType === 'application/pdf') {
    const parsed = await pdfParse(buffer);

    return parsed.text;
  }

  return assertNever(mimeType);
}

/**
 * @description Fuerza exhaustividad cuando agregamos nuevos MIME types.
 * @why Existe para que TypeScript nos avise si falta implementar un extractor futuro.
 * @param value - Valor imposible si todos los casos fueron cubiertos.
 * @returns Nunca retorna; lanza error si el tipo no fue cubierto.
 * @example assertNever(mimeType);
 */
function assertNever(value: never): never {
  throw new Error(`Extractor no implementado para MIME type: ${String(value)}`);
}

/**
 * Responsabilidades del archivo:
 * - Extraer texto desde PDF y TXT cargados en memoria.
 * - Sanitizar texto antes de embeddings.
 * - Dejar una extension clara para DOCX sin agregar librerias no aprobadas.
 */

