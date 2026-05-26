import { ArrowLeft, CheckCircle2, Settings, XCircle } from 'lucide-react';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getSystemStatusRequest } from '../services/system.service';
import type { SystemStatus } from '../types/api.types';
import { useAuth } from '../hooks/useAuth';

/**
 * @component SettingsPage
 * @description Renderiza configuracion operativa no sensible de DocuMente.
 * @why Existe para diagnosticar API key, modelo y limites sin abrir logs o exponer secretos.
 * @props No recibe props; carga estado desde el backend autenticado.
 */
export function SettingsPage(): ReactElement {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect((): void => {
    void getSystemStatusRequest().then(setStatus);
  }, []);

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return (
    <main className="app-shell min-h-screen">
      <section className="mx-auto max-w-5xl px-5 py-5">
        <header className="mb-5 flex items-center justify-between">
          <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-zinc-100" to="/dashboard">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </header>

        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-teal-300/20 bg-teal-300/10 p-3 text-teal-100">
              <Settings size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">DocuMente</p>
              <h1 className="text-3xl font-semibold text-white">Configuracion</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="muted-panel p-4">
              <p className="text-sm text-zinc-400">OpenAI</p>
              <div className="mt-2 flex items-center gap-2 text-white">
                {status?.openAiConfigured === true ? <CheckCircle2 className="text-teal-200" size={18} /> : <XCircle className="text-red-200" size={18} />}
                {status?.openAiConfigured === true ? 'Configurado' : 'No configurado'}
              </div>
            </div>
            <div className="muted-panel p-4">
              <p className="text-sm text-zinc-400">Modelo de chat</p>
              <p className="mt-2 text-white">{status?.chatModel ?? 'Cargando...'}</p>
            </div>
            <div className="muted-panel p-4">
              <p className="text-sm text-zinc-400">Contexto</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{status?.maxChunksContext ?? '-'} chunks</Badge>
                <Badge>score min {status?.minSimilarityScore ?? '-'}</Badge>
              </div>
            </div>
            <div className="muted-panel p-4">
              <p className="text-sm text-zinc-400">Upload</p>
              <p className="mt-2 text-white">Max {status?.maxFileSizeMb ?? '-'} MB</p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={(): void => { void getSystemStatusRequest().then(setStatus); }} variant="secondary">
              Refrescar estado
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar estado operativo de OpenAI y limites.
 * - Evitar exponer secretos en el frontend.
 * - Dar una pantalla de diagnostico antes de publicar.
 */

