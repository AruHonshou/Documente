/**
 * @description Limpia texto extraido de documentos antes de guardarlo o enviarlo a OpenAI.
 * @why Existe para reducir caracteres de control, espacios excesivos y contenido invisible que degrada embeddings.
 * @param text - Texto crudo extraido desde PDF o TXT.
 * @returns Texto normalizado y seguro para chunking/embeddings.
 * @example const clean = sanitizeDocumentText(rawText);
 */
export function sanitizeDocumentText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Responsabilidades del archivo:
 * - Remover caracteres de control no utiles.
 * - Normalizar saltos de linea y espacios.
 * - Proteger la calidad del texto antes de crear chunks y embeddings.
 */

