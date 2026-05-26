import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';
import { isDemoMode, routerBaseName } from './utils/constants';

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement === null) {
  throw new Error('No se encontro el elemento #root para montar React.');
}

const root: Root = createRoot(rootElement);

root.render(
  <StrictMode>
    {isDemoMode ? (
      <HashRouter>
        <App />
      </HashRouter>
    ) : (
      <BrowserRouter basename={routerBaseName}>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
);

/**
 * Responsabilidades del archivo:
 * - Montar React dentro del DOM generado por Vite.
 * - Activar StrictMode para detectar problemas temprano en desarrollo.
 * - Envolver la app con BrowserRouter para rutas de cliente.
 * - Usar HashRouter en modo demo para que GitHub Pages soporte recargas y enlaces directos.
 */
