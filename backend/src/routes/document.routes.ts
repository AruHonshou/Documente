import { Router } from 'express';
import { deleteDocumentController, listDocumentsController, uploadDocumentController } from '../controllers/document.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleDocumentUpload } from '../middleware/upload.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { documentParamsSchema, listDocumentsSchema } from '../validators/document.validator.js';

export const documentRouter = Router();

documentRouter.get('/', requireAuth, validateRequest(listDocumentsSchema), listDocumentsController);
documentRouter.post('/', requireAuth, handleDocumentUpload, uploadDocumentController);
documentRouter.delete('/:documentId', requireAuth, validateRequest(documentParamsSchema), deleteDocumentController);

/**
 * Responsabilidades del archivo:
 * - Definir endpoints de documentos sin logica de negocio.
 * - Proteger todas las rutas con JWT.
 * - Conectar upload en memoria antes del controller de procesamiento.
 * - Validar params antes de eliminar documentos.
 */
