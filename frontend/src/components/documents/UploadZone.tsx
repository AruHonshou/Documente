import { FileUp, Upload } from 'lucide-react';
import type { ChangeEvent, ReactElement } from 'react';
import { Spinner } from '../ui/Spinner';

interface UploadZoneProps {
  isLoading: boolean;
  onUpload: (file: File) => Promise<void>;
}

/**
 * @component UploadZone
 * @description Renderiza el control para seleccionar y subir documentos PDF/TXT.
 * @why Existe separado porque upload combina input de archivo, estado loading y validacion visual.
 * @props isLoading bloquea el control y onUpload procesa el archivo seleccionado.
 */
export function UploadZone({ isLoading, onUpload }: UploadZoneProps): ReactElement {
  /**
   * @description Toma el primer archivo elegido y lo envia al hook.
   * @why Existe para mantener el input nativo controlado por una funcion pequena.
   * @param event - Cambio del input file.
   * @returns Promesa que termina cuando el upload finaliza.
   * @example Se ejecuta al seleccionar un PDF.
   */
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    await onUpload(file);
    event.target.value = '';
  }

  return (
    <div className="panel flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-teal-300/20 bg-teal-300/10 p-3 text-teal-100">
          <FileUp size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Subir documento</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">PDF o TXT se procesan en memoria, se dividen en chunks y quedan listos para RAG.</p>
        </div>
      </div>
      <label>
        <input accept="application/pdf,text/plain" className="sr-only" disabled={isLoading} onChange={(event): void => void handleFileChange(event)} type="file" />
        <span className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 shadow-lg shadow-teal-950/20 transition hover:bg-teal-200 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" aria-disabled={isLoading}>
          {isLoading ? <Spinner /> : <Upload size={16} />}
          Seleccionar archivo
        </span>
      </label>
      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <span className="muted-panel px-3 py-2">PDF/TXT</span>
        <span className="muted-panel px-3 py-2">Max 10 MB</span>
      </div>
    </div>
  );
}

/**
 * Responsabilidades del archivo:
 * - Exponer upload de documentos al usuario.
 * - Mantener archivos en flujo controlado por hooks.
 * - Comunicar formatos soportados sin agregar logica de backend.
 */
