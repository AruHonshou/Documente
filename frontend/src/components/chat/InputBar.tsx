import { Send } from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface InputBarProps {
  disabled: boolean;
  onSend: (message: string) => Promise<void>;
}

/**
 * @component InputBar
 * @description Renderiza el campo de pregunta y boton de envio del chat.
 * @why Existe separado para manejar estado local del input sin mezclarlo con mensajes.
 * @props disabled bloquea envio durante carga y onSend envia el texto al hook.
 */
export function InputBar({ disabled, onSend }: InputBarProps): ReactElement {
  const [message, setMessage] = useState<string>('');

  /**
   * @description Envia el texto si no esta vacio.
   * @why Existe para centralizar trim, limpieza del input y prevencion de submit vacio.
   * @param event - Evento submit del formulario.
   * @returns Promesa que termina cuando el envio finaliza.
   * @example Se ejecuta al presionar Enter o el boton enviar.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return;
    }

    setMessage('');
    await onSend(trimmedMessage);
  }

  return (
    <form className="flex gap-2 border-t border-white/10 bg-zinc-950/90 p-3" onSubmit={(event): void => void handleSubmit(event)}>
      <input
        className="field min-w-0 flex-1"
        disabled={disabled}
        onChange={(event): void => setMessage(event.target.value)}
        placeholder="Preguntale algo al documento..."
        value={message}
      />
      <Button disabled={disabled} icon={disabled ? <Spinner /> : <Send size={16} />} type="submit">
        Enviar
      </Button>
    </form>
  );
}

/**
 * Responsabilidades del archivo:
 * - Capturar preguntas del usuario.
 * - Prevenir envios vacios.
 * - Mostrar estado de carga durante respuestas.
 */
