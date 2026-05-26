import { apiClient } from './apiClient';
import { deleteDemoDocument, listDemoDocuments, uploadDemoDocument } from './demo.service';
import type { StoredDocument } from '../types/api.types';
import { isDemoMode } from '../utils/constants';

interface ListDocumentsResponse {
  documents: StoredDocument[];
}

interface UploadDocumentResponse {
  document: StoredDocument;
}

/**
 * @description Solicita los documentos del usuario autenticado.
 * @why Existe para centralizar el endpoint del dashboard.
 * @returns Lista de documentos propios del usuario.
 * @example const documents = await listDocumentsRequest();
 */
export async function listDocumentsRequest(): Promise<StoredDocument[]> {
  if (isDemoMode) {
    return listDemoDocuments();
  }

  const response = await apiClient.get<ListDocumentsResponse>('/api/documents');

  return response.data.documents;
}

/**
 * @description Sube un archivo al backend usando multipart/form-data.
 * @why Existe para ocultar FormData y el nombre del campo `document` a los componentes.
 * @param file - Archivo PDF o TXT elegido por el usuario.
 * @returns Documento persistido por el backend.
 * @example const document = await uploadDocumentRequest(file);
 */
export async function uploadDocumentRequest(file: File): Promise<StoredDocument> {
  if (isDemoMode) {
    return uploadDemoDocument(file);
  }

  const formData = new FormData();

  formData.append('document', file);

  const response = await apiClient.post<UploadDocumentResponse>('/api/documents', formData);

  return response.data.document;
}

/**
 * @description Elimina un documento propio del usuario autenticado.
 * @why Existe para permitir gestion completa de la base de conocimiento desde el dashboard.
 * @param documentId - Identificador del documento a eliminar.
 * @returns Promesa sin valor cuando el backend confirma la eliminacion.
 * @example await deleteDocumentRequest(1);
 */
export async function deleteDocumentRequest(documentId: number): Promise<void> {
  if (isDemoMode) {
    await deleteDemoDocument(documentId);
    return;
  }

  await apiClient.delete(`/api/documents/${documentId}`);
}

/**
 * Responsabilidades del archivo:
 * - Encapsular endpoints de documentos.
 * - Mantener FormData fuera de la UI.
 * - Devolver documentos ya tipados.
 * - Exponer eliminacion segura de documentos.
 */
