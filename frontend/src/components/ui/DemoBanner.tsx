import { Github, MonitorPlay } from 'lucide-react';
import type { ReactElement } from 'react';

/**
 * @component DemoBanner
 * @description Muestra que la app esta corriendo en modo demo estatico.
 * @why Existe para ser transparente en GitHub Pages: la UI funciona, pero no consume OpenAI ni SQLite real.
 * @props No recibe props porque lee el modo demo desde el arbol de renderizado superior.
 */
export function DemoBanner(): ReactElement {
  return (
    <aside className="border-b border-teal-300/20 bg-teal-950/80 px-4 py-2 text-teal-50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <MonitorPlay size={16} />
          Modo demo: datos simulados para GitHub Pages, sin backend ni API key.
        </span>
        <span className="inline-flex items-center gap-2 text-teal-100">
          <Github size={16} />
          El backend real, seguridad y RAG viven en el repositorio.
        </span>
      </div>
    </aside>
  );
}

/**
 * Responsabilidades del archivo:
 * - Avisar con claridad cuando la publicacion es estatica.
 * - Evitar que evaluadores confundan demo visual con ambiente productivo.
 * - Mantener transparencia sobre secretos y costos de OpenAI.
 */
