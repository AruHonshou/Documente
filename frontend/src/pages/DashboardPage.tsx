import { Files, LogOut, RefreshCcw, ShieldCheck } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DocumentList } from '../components/documents/DocumentList';
import { UploadZone } from '../components/documents/UploadZone';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { useAuthStore } from '../store/authStore';

/**
 * @component DashboardPage
 * @description Renderiza el panel de documentos con sidebar, metricas y acciones principales.
 * @why Existe como punto de entrada autenticado antes de elegir un documento para chat.
 * @props No recibe props; consume auth y documentos desde hooks/stores.
 */
export function DashboardPage(): ReactElement {
  const { isAuthenticated, logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const { documents, isLoading, error, refreshDocuments, uploadDocument, deleteDocument } = useDocuments();
  const totalChunks = documents.reduce((total, document): number => total + document.chunkCount, 0);

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return (
    <main className="app-shell min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[280px_1fr]">
        <aside className="panel flex flex-col justify-between p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">DocuMente</p>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal text-white">Workspace</h1>
            <p className="mt-2 break-all text-sm leading-6 text-zinc-400">{user?.email ?? 'Sesion activa'}</p>
            <div className="mt-6 grid gap-3">
              <div className="muted-panel flex items-center justify-between p-3">
                <span className="flex items-center gap-2 text-sm text-zinc-300"><Files size={16} /> Documentos</span>
                <strong className="text-sm text-white">{documents.length}</strong>
              </div>
              <div className="muted-panel flex items-center justify-between p-3">
                <span className="flex items-center gap-2 text-sm text-zinc-300"><ShieldCheck size={16} /> Chunks</span>
                <strong className="text-sm text-white">{totalChunks}</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-2">
            <Button disabled={isLoading} icon={isLoading ? <Spinner /> : <RefreshCcw size={16} />} onClick={(): void => void refreshDocuments()} variant="secondary">
              Refrescar
            </Button>
            <Button icon={<LogOut size={16} />} onClick={logout} variant="ghost">
              Salir
            </Button>
            <Link className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white" to="/settings">
              Configuracion
            </Link>
          </div>
        </aside>

        <section className="space-y-6">
          <header className="panel p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">Dashboard</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-4xl font-semibold tracking-normal text-white">Biblioteca inteligente</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  Gestiona archivos procesados, revisa cuantos chunks existen y abre conversaciones basadas en fuentes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                <div className="muted-panel p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Archivos</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{documents.length}</p>
                </div>
                <div className="muted-panel p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Chunks</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{totalChunks}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <UploadZone isLoading={isLoading} onUpload={uploadDocument} />
            <section className="space-y-3">
              {error !== null && <p className="rounded-md border border-red-400/20 bg-red-950/70 px-3 py-2 text-sm text-red-100">{error}</p>}
              <DocumentList documents={documents} isBusy={isLoading} onDelete={deleteDocument} />
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

/**
 * Responsabilidades del archivo:
 * - Proteger acceso al dashboard.
 * - Mostrar upload, lista de documentos y metricas.
 * - Dar controles de refresco y logout.
 */
