import { Database, FileSearch, LockKeyhole } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

/**
 * @component LoginPage
 * @description Renderiza la pantalla de inicio de sesion con una presentacion visual del producto.
 * @why Existe como pagina separada para mapear la ruta `/login` y redirigir usuarios autenticados.
 * @props No recibe props porque obtiene auth desde hooks globales.
 */
export function LoginPage(): ReactElement {
  const { isAuthenticated, isLoading, error, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-md border border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/35 backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 bg-white/[0.035] p-8 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">DocuMente</p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-normal text-white">
              Consulta documentos con contexto, fuentes y memoria.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
              Un flujo privado para cargar archivos, generar embeddings, recuperar chunks relevantes y conversar con citas inspeccionables.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="muted-panel flex items-center gap-3 p-4">
              <FileSearch className="text-teal-200" size={20} />
              <span className="text-sm text-zinc-300">Recuperacion semantica por documento</span>
            </div>
            <div className="muted-panel flex items-center gap-3 p-4">
              <Database className="text-teal-200" size={20} />
              <span className="text-sm text-zinc-300">SQLite local con chunks y sesiones</span>
            </div>
            <div className="muted-panel flex items-center gap-3 p-4">
              <LockKeyhole className="text-teal-200" size={20} />
              <span className="text-sm text-zinc-300">JWT y aislamiento por usuario</span>
            </div>
          </div>
        </div>
        <div className="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">Bienvenido</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white">Entrar</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Accede a tus documentos, chunks y conversaciones RAG.</p>
            <div className="mt-8">
              <AuthForm error={error} isLoading={isLoading} mode="login" onSubmit={login} />
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              No tenes cuenta? <Link className="font-semibold text-teal-200 hover:text-teal-100" to="/register">Crear cuenta</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar formulario de login.
 * - Redirigir al dashboard si ya hay sesion.
 * - Conectar navegacion hacia registro.
 */
