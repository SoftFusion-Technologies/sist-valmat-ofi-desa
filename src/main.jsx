// Benjamin Orellana - 2026/04/24 - BrowserRouter global único para toda la aplicación.
// Benjamin Orellana - 25/04/2026 - Se agrega AuthProvider global para manejar sesión, token y usuario autenticado en VALMAT.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './Auth/AuthContext.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
