import { z } from 'zod';

export const listDocumentsSchema = z.object({
  query: z.object({}).passthrough(),
});

export const documentParamsSchema = z.object({
  params: z.object({
    documentId: z.coerce.number().int().positive(),
  }),
});

/**
 * Responsabilidades del archivo:
 * - Reservar el punto central de validacion para endpoints de documentos.
 * - Validar params de documentos antes de llegar a controllers.
 * - Facilitar agregar paginacion o busqueda sin tocar rutas ni controllers.
 */
