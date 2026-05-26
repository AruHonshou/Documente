import { create } from 'zustand';
import type { StoredDocument } from '../types/api.types';

interface DocumentState {
  documents: StoredDocument[];
  setDocuments: (documents: StoredDocument[]) => void;
  addDocument: (document: StoredDocument) => void;
  removeDocument: (documentId: number) => void;
}

/**
 * @description Mantiene documentos cargados en memoria del frontend.
 * @why Existe para compartir dashboard y chat sin pedir siempre la misma lista.
 * @returns Store Zustand con documentos y acciones.
 * @example const documents = useDocumentStore((state) => state.documents);
 */
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  setDocuments: (documents: StoredDocument[]): void => {
    set({ documents });
  },
  addDocument: (document: StoredDocument): void => {
    set((state) => ({ documents: [document, ...state.documents] }));
  },
  removeDocument: (documentId: number): void => {
    set((state) => ({ documents: state.documents.filter((document) => document.id !== documentId) }));
  },
}));

/**
 * Responsabilidades del archivo:
 * - Guardar documentos visibles en dashboard.
 * - Agregar documentos nuevos sin recargar toda la pagina.
 * - Remover documentos eliminados de forma inmediata.
 * - Mantener UI sincronizada despues de uploads.
 */
