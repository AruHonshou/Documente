import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DemoBanner } from './components/ui/DemoBanner';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { isDemoMode } from './utils/constants';

/**
 * @component App
 * @description Define las rutas principales de la aplicacion React.
 * @why Existe para separar routing del bootstrap de React en `main.tsx`.
 * @props No recibe props; React Router maneja navegacion internamente.
 */
export function App(): ReactElement {
  return (
    <>
      {isDemoMode && <DemoBanner />}
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<ChatPage />} path="/chat/:documentId" />
        <Route element={<SettingsPage />} path="/settings" />
        <Route element={<Navigate replace to="/dashboard" />} path="*" />
      </Routes>
    </>
  );
}

/**
 * Responsabilidades del archivo:
 * - Declarar rutas frontend.
 * - Redirigir rutas desconocidas.
 * - Mostrar aviso de modo demo cuando se publica como sitio estatico.
 * - Mantener `main.tsx` enfocado solo en montaje.
 */
