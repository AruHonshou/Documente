import { Bot, FileText, ShieldCheck } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

/**
 * @component RegisterPage
 * @description Renderiza la pantalla de creacion de cuenta con contexto visual del flujo RAG.
 * @why Existe como pagina separada para aislar el flujo de registro del login.
 * @props No recibe props porque usa el hook de autenticacion.
 */
export function RegisterPage(): ReactElement {
  const { isAuthenticated, isLoading, error, register } = useAuth();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-md border border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/35 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">Nueva cuenta</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">Crear cuenta</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Tu cuenta separa documentos, sesiones y fuentes por usuario.</p>
            <div className="mt-8">
              <AuthForm error={error} isLoading={isLoading} mode="register" onSubmit={register} />
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              Ya tenes cuenta? <Link className="font-semibold text-teal-200 hover:text-teal-100" to="/login">Entrar</Link>
            </p>
          </div>
        </div>
        <div className="hidden min-h-[620px] flex-col justify-between border-l border-white/10 bg-white/[0.035] p-8 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">DocuMente</p>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-normal text-white">
              De archivo crudo a respuesta con fuentes.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
              El sistema valida usuario, procesa documentos en memoria, crea chunks, guarda embeddings y conversa contra contexto recuperado.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="muted-panel p-4">
              <FileText className="text-teal-200" size={20} />
              <p className="mt-3 text-sm font-medium text-white">PDF/TXT</p>
            </div>
            <div className="muted-panel p-4">
              <Bot className="text-teal-200" size={20} />
              <p className="mt-3 text-sm font-medium text-white">Agentes</p>
            </div>
            <div className="muted-panel p-4">
              <ShieldCheck className="text-teal-200" size={20} />
              <p className="mt-3 text-sm font-medium text-white">Seguro</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar formulario de registro.
 * - Redirigir usuarios autenticados.
 * - Conectar navegacion de vuelta al login.
 */
