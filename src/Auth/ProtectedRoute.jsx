/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 25 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (ProtectedRoute.jsx) contiene el componente que protege rutas privadas
 * del frontend VALMAT.
 *
 * Funcionalidades:
 * - Bloquear acceso si no hay token
 * - Validar roles permitidos opcionalmente
 * - Redireccionar al login si no está autenticado
 * - Redireccionar a no autorizado si no tiene permisos
 *
 * Tema: Rutas protegidas
 * Capa: Frontend
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
  unauthorizedTo = '/no-autorizado'
}) => {
  const location = useLocation();

  const { authToken, isAuthenticated, loadingAuth, hasRole } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm font-medium tracking-wide text-white/90">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!authToken || !isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !hasRole(allowedRoles)
  ) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
