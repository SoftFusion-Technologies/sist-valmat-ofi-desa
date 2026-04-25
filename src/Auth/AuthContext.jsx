/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 25 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AuthContext.jsx) contiene el contexto de autenticación del frontend VALMAT.
 *
 * Funcionalidades:
 * - Persistir token JWT
 * - Persistir datos del usuario autenticado
 * - Persistir rol global
 * - Persistir sucursales asignadas
 * - Manejar sucursal activa
 * - Login
 * - Logout
 * - Validaciones rápidas de rol y acceso a sucursal
 *
 * Tema: Autenticación
 * Capa: Frontend
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const AuthContext = createContext();

const STORAGE_KEYS = {
  authToken: 'valmat_authToken',
  user: 'valmat_user',
  sucursalActiva: 'valmat_sucursalActiva'
};

const parseJsonSeguro = (valor, fallback = null) => {
  try {
    if (!valor) return fallback;
    return JSON.parse(valor);
  } catch {
    return fallback;
  }
};

const normalizarUsuario = (usuario) => {
  if (!usuario) return null;

  return {
    id: usuario.id ?? null,
    nombre: usuario.nombre ?? '',
    apellido: usuario.apellido ?? '',
    email: usuario.email ?? '',
    telefono: usuario.telefono ?? '',
    rol_global: usuario.rol_global ?? '',
    estado: usuario.estado ?? '',
    ultimo_login: usuario.ultimo_login ?? null,
    created_at: usuario.created_at ?? null,
    updated_at: usuario.updated_at ?? null,
    sucursales: Array.isArray(usuario.sucursales) ? usuario.sucursales : []
  };
};

const obtenerSucursalPrincipal = (sucursales = []) => {
  if (!Array.isArray(sucursales) || sucursales.length === 0) return null;

  const principal = sucursales.find((sucursal) => {
    const pivot =
      sucursal.usuarios_sucursales || sucursal.usuariosSucursales || {};
    return pivot.es_principal === true || pivot.es_principal === 1;
  });

  return principal || sucursales[0];
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sucursalActiva, setSucursalActivaState] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const tokenStorage = localStorage.getItem(STORAGE_KEYS.authToken);
    const userStorage = parseJsonSeguro(
      localStorage.getItem(STORAGE_KEYS.user),
      null
    );
    const sucursalStorage = parseJsonSeguro(
      localStorage.getItem(STORAGE_KEYS.sucursalActiva),
      null
    );

    if (tokenStorage) {
      setAuthToken(tokenStorage);
    }

    if (userStorage) {
      const usuarioNormalizado = normalizarUsuario(userStorage);
      setUser(usuarioNormalizado);

      if (sucursalStorage) {
        setSucursalActivaState(sucursalStorage);
      } else {
        const principal = obtenerSucursalPrincipal(
          usuarioNormalizado?.sucursales || []
        );
        setSucursalActivaState(principal);

        if (principal) {
          localStorage.setItem(
            STORAGE_KEYS.sucursalActiva,
            JSON.stringify(principal)
          );
        }
      }
    }

    setLoadingAuth(false);
  }, []);

  const login = (dataLogin) => {
    const token = dataLogin?.token || dataLogin?.authToken || null;
    const usuario = normalizarUsuario(
      dataLogin?.usuario || dataLogin?.user || null
    );

    if (!token || !usuario) {
      throw new Error(
        'No se recibió token o usuario válido para iniciar sesión.'
      );
    }

    const sucursalPrincipal = obtenerSucursalPrincipal(usuario.sucursales);

    setAuthToken(token);
    setUser(usuario);
    setSucursalActivaState(sucursalPrincipal);

    localStorage.setItem(STORAGE_KEYS.authToken, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(usuario));

    if (sucursalPrincipal) {
      localStorage.setItem(
        STORAGE_KEYS.sucursalActiva,
        JSON.stringify(sucursalPrincipal)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.sucursalActiva);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setSucursalActivaState(null);

    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.sucursalActiva);
  };

  const setSucursalActiva = (sucursal) => {
    setSucursalActivaState(sucursal || null);

    if (sucursal) {
      localStorage.setItem(
        STORAGE_KEYS.sucursalActiva,
        JSON.stringify(sucursal)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.sucursalActiva);
    }
  };

  const hasRole = (rolesPermitidos = []) => {
    if (!user?.rol_global) return false;

    if (!Array.isArray(rolesPermitidos) || rolesPermitidos.length === 0) {
      return true;
    }

    return rolesPermitidos.includes(user.rol_global);
  };

  const hasSucursalAccess = (sucursalId) => {
    if (!user) return false;

    if (['SUPER_ADMIN', 'ADMIN'].includes(user.rol_global)) {
      return true;
    }

    const idComparar = Number(sucursalId);

    return (
      Array.isArray(user.sucursales) &&
      user.sucursales.some((sucursal) => {
        const pivot =
          sucursal.usuarios_sucursales || sucursal.usuariosSucursales || {};

        return (
          Number(sucursal.id) === idComparar && pivot.estado !== 'INACTIVO'
        );
      })
    );
  };

  const value = useMemo(() => {
    const nombreCompleto = user
      ? `${user.nombre || ''} ${user.apellido || ''}`.trim()
      : '';

    return {
      authToken,
      user,
      usuario: user,

      userId: user?.id || null,
      userName: user?.email || user?.telefono || '',
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      nombreCompleto,
      email: user?.email || '',
      telefono: user?.telefono || '',
      rolGlobal: user?.rol_global || '',
      estadoUsuario: user?.estado || '',

      sucursales: user?.sucursales || [],
      sucursalActiva,

      isAuthenticated: Boolean(authToken && user),
      loadingAuth,

      login,
      logout,
      setSucursalActiva,
      hasRole,
      hasSucursalAccess
    };
  }, [authToken, user, sucursalActiva, loadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
