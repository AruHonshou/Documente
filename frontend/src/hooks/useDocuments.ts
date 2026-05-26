import { useCallback, useEffect, useState } from 'react';
import { deleteDocumentRequest, listDocumentsRequest, uploadDocumentRequest } from '../services/document.service';
import { useDocumentStore } from '../store/documentStore';
import type { StoredDocument } from '../types/api.types';
import { getApiErrorMessage } from '../utils/apiErrors';

interface UseDocumentsResult {
  documents: StoredDocument[];
  isLoading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (documentId: number) => Promise<void>;
}

/**
 * @hook useDocuments
 * @description Encapsula carga, listado y subida de documentos.
 * @why Esta logica no vive en Dashboard para mantener UI enfocada en renderizado.
 * @returns Documentos, loading, error y acciones de refresco/upload.
 */
export function useDocuments(): UseDocumentsResult {
  const documents = useDocumentStore((state) => state.documents);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setDocuments(await listDocumentsRequest());
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'No se pudieron cargar los documentos.'));
    } finally {
      setIsLoading(false);
    }
  }, [setDocuments]);

  const uploadDocument = useCallback(async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const document = await uploadDocumentRequest(file);

      addDocument(document);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'No se pudo subir el documento. Verifica que sea PDF o TXT y que tu API key este configurada.'));
    } finally {
      setIsLoading(false);
    }
  }, [addDocument]);

  const deleteDocument = useCallback(async (documentId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteDocumentRequest(documentId);
      removeDocument(documentId);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'No se pudo eliminar el documento.'));
    } finally {
      setIsLoading(false);
    }
  }, [removeDocument]);

  useEffect((): void => {
    void refreshDocuments();
  }, [refreshDocuments]);

  return {
    documents,
    isLoading,
    error,
    refreshDocuments,
    uploadDocument,
    deleteDocument,
  };
}

/**
 * Responsabilidades del archivo:
 * - Sincronizar documentos del backend con Zustand.
 * - Encapsular estado de carga y errores.
 * - Exponer upload y eliminacion como acciones reusables.
 */
