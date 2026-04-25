// Benjamin Orellana - 2026/04/24 - App principal con rutas internas. El BrowserRouter queda únicamente en main.jsx para evitar Router anidado.

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import logoValmat from './Images/logo_1.png';
import Home from './pages/Home';
import ServicioDetalle from './pages/ServicioDetalle';
import NotFound from './pages/NotFound';
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
      behavior: 'instant'
    });
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home logoSrc={logoValmat} />} />

        <Route
          path="/servicios/:slug"
          element={<ServicioDetalle logoSrc={logoValmat} />}
        />

        <Route path="*" element={<NotFound logoSrc={logoValmat} />} />
      </Routes>
    </>
  );
}

export default App;
