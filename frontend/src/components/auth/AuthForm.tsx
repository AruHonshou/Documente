import { LogIn, UserPlus } from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface AuthFormProps {
  mode: 'login' | 'register';
  isLoading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}

/**
 * @component AuthForm
 * @description Renderiza formulario reutilizable de login o registro.
 * @why Existe separado para evitar duplicar campos y validacion visual entre paginas auth.
 * @props mode cambia textos, isLoading bloquea submit, error muestra feedback y onSubmit ejecuta auth.
 */
export function AuthForm({ mode, isLoading, error, onSubmit }: AuthFormProps): ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const isLogin = mode === 'login';

  /**
   * @description Maneja submit del formulario evitando recarga del navegador.
   * @why Existe para validar campos minimos antes de llamar al hook de autenticacion.
   * @param event - Evento de submit del form.
   * @returns Promesa que termina cuando auth responde.
   * @example Se ejecuta al presionar el boton principal.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit(email.trim(), password);
  }

  return (
    <form className="w-full max-w-md space-y-5" onSubmit={(event): void => void handleSubmit(event)}>
      <div>
        <label className="text-sm font-medium text-zinc-200" htmlFor="email">
          Email
        </label>
        <input
          className="field mt-2"
          id="email"
          onChange={(event): void => setEmail(event.target.value)}
          placeholder="kendall@example.com"
          type="email"
          value={email}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-200" htmlFor="password">
          Contraseña
        </label>
        <input
          className="field mt-2"
          id="password"
          minLength={isLogin ? 1 : 8}
          onChange={(event): void => setPassword(event.target.value)}
          placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
          type="password"
          value={password}
          required
        />
      </div>

      {error !== null && <p className="rounded-md border border-red-400/20 bg-red-950/70 px-3 py-2 text-sm text-red-100">{error}</p>}

      <Button
        className="w-full"
        disabled={isLoading}
        icon={isLoading ? <Spinner /> : isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
        type="submit"
      >
        {isLogin ? 'Entrar' : 'Crear cuenta'}
      </Button>
    </form>
  );
}

/**
 * Responsabilidades del archivo:
 * - Capturar credenciales del usuario.
 * - Reutilizar UI para login y registro.
 * - Delegar autenticacion al hook recibido por props.
 */
