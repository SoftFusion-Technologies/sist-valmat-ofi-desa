// Benjamin Orellana - 2026/04/24 - App principal con rutas internas. El BrowserRouter queda únicamente en main.jsx para evitar Router anidado.
// Benjamin Orellana - 25/04/2026 - Se agregan rutas públicas y privadas para login y dashboard protegido de VALMAT.

import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import logoValmat from './Images/logo_1.png';

import Home from './pages/Home';
import ServicioDetalle from './pages/ServicioDetalle';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ProtectedRoute from './Auth/ProtectedRoute';

import SucursalesAdmin from './pages/Gets/Core/SucursalesAdmin';
import UsuariosAdmin from './pages/Gets/Core/UsuariosAdmin';
import ServiciosAdmin from './pages/Dashboard/Servicios/ServiciosAdmin';
import ServiciosTiposClientesAdmin from './pages/Dashboard/Servicios/ServiciosTiposClientesAdmin';

import Footer from './components/Footer';
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 120);

      return () => clearTimeout(timer);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Benjamin Orellana - 25/04/2026 - Rutas públicas del sitio institucional VALMAT. */}
        <Route path="/" element={<Home logoSrc={logoValmat} />} />

        <Route
          path="/servicios/:slug"
          element={<ServicioDetalle logoSrc={logoValmat} />}
        />

        {/* Benjamin Orellana - 25/04/2026 - Ruta pública de login administrativo VALMAT. */}
        <Route path="/login" element={<Login logoSrc={logoValmat} />} />

        {/* Benjamin Orellana - 25/04/2026 - Ruta privada inicial para el dashboard interno VALMAT. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard logoSrc={logoValmat} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/sucursales"
          element={
            <ProtectedRoute>
              <SucursalesAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/usuarios"
          element={
            <ProtectedRoute>
              <UsuariosAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/servicios"
          element={
            <ProtectedRoute>
              <ServiciosAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/servicios/tipos-clientes"
          element={
            <ProtectedRoute>
              <ServiciosTiposClientesAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound logoSrc={logoValmat} />} />
      </Routes>
      <Footer logoSrc={logoValmat} />
    </>
  );
}

export default App;
