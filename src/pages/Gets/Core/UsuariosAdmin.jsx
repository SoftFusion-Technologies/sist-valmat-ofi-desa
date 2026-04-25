// Benjamin Orellana - 25/04/2026 - Administración premium de usuarios VALMAT con tabla, filtros, CRUD, password y asignaciones de sucursales.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  ArrowLeft,
  Crown,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';
import UsuarioFormModal from './Forms/UsuarioFormModal';
import UsuarioPasswordModal from './UsuarioPasswordModal';

const API_URL = import.meta.env.VITE_API_URL;

const ROLES_GLOBALES = [
  'SUPER_ADMIN',
  'ADMIN',
  'COMERCIAL',
  'ENCARGADO',
  'OPERARIO'
];
const ESTADOS_USUARIO = ['ACTIVO', 'INACTIVO', 'BLOQUEADO'];
const ROLES_SUCURSAL = ['ADMIN_SUCURSAL', 'ENCARGADO', 'OPERARIO', 'COMERCIAL'];
const ESTADOS_ASIGNACION = ['ACTIVO', 'INACTIVO'];

const formatRole = (role) => {
  if (!role) return 'Sin rol';

  return String(role)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return 'Sin registro';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Sin registro';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getInitials = (usuario) => {
  const nombre = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();

  if (!nombre) return 'U';

  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const getPivot = (sucursal) => {
  return sucursal?.usuarios_sucursales || sucursal?.usuario_sucursal || {};
};

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback || 'Ocurrió un error inesperado.';
};

const showError = async (message) => {
  await Swal.fire({
    title: 'No se pudo completar',
    text: message || 'Ocurrió un error inesperado.',
    icon: 'error',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#19d3df',
    background: '#ffffff',
    color: '#111111',
    customClass: {
      popup: 'rounded-[28px]',
      title: 'titulo',
      confirmButton: 'rounded-2xl px-5 py-3 font-bold'
    }
  });
};

const showSuccess = async (message) => {
  await Swal.fire({
    toast: true,
    position: 'top-end',
    title: message,
    icon: 'success',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    background: '#ffffff',
    color: '#111111'
  });
};

export default function UsuariosAdmin() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [rolGlobal, setRolGlobal] = useState('');
  const [sucursalId, setSucursalId] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUsuario, setPasswordUsuario] = useState(null);

  const [asignacionesOpen, setAsignacionesOpen] = useState(false);
  const [asignacionesUsuario, setAsignacionesUsuario] = useState(null);
  const [asignacionForm, setAsignacionForm] = useState({
    sucursal_id: '',
    rol_sucursal: 'OPERARIO',
    es_principal: false,
    estado: 'ACTIVO'
  });

  const headers = useMemo(() => {
    const baseHeaders = {
      'Content-Type': 'application/json'
    };

    if (authToken) {
      baseHeaders.Authorization = `Bearer ${authToken}`;
    }

    return baseHeaders;
  }, [authToken]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter((item) => item.estado === 'ACTIVO').length;
    const bloqueados = usuarios.filter(
      (item) => item.estado === 'BLOQUEADO'
    ).length;
    const admins = usuarios.filter((item) =>
      ['SUPER_ADMIN', 'ADMIN'].includes(item.rol_global)
    ).length;

    return {
      total,
      activos,
      bloqueados,
      admins
    };
  }, [usuarios]);

  const request = useCallback(
    async (endpoint, options = {}) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || 'Error de comunicación con el servidor.'
        );
      }

      return data;
    },
    [headers]
  );

  const fetchSucursales = useCallback(async () => {
    try {
      const data = await request('/sucursales', {
        method: 'GET'
      });

      setSucursales(Array.isArray(data?.sucursales) ? data.sucursales : []);
    } catch (error) {
      await showError(getErrorMessage(error, 'Error al obtener sucursales.'));
    }
  }, [request]);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (q.trim()) params.set('q', q.trim());
      if (estado) params.set('estado', estado);
      if (rolGlobal) params.set('rol_global', rolGlobal);
      if (sucursalId) params.set('sucursal_id', sucursalId);

      const queryString = params.toString();
      const endpoint = queryString ? `/usuarios?${queryString}` : '/usuarios';

      const data = await request(endpoint, {
        method: 'GET'
      });

      setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (error) {
      await showError(getErrorMessage(error, 'Error al obtener usuarios.'));
    } finally {
      setLoading(false);
    }
  }, [estado, q, request, rolGlobal, sucursalId]);

  useEffect(() => {
    fetchSucursales();
  }, [fetchSucursales]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsuarios();
    }, 350);

    return () => clearTimeout(timeout);
  }, [fetchUsuarios]);

  const openCreate = () => {
    setEditingUsuario(null);
    setFormOpen(true);
  };

  const openEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUsuario(null);
  };

  const handleSubmitUsuario = async (payload) => {
    const isEdit = Boolean(editingUsuario?.id);

    const endpoint = isEdit ? `/usuarios/${editingUsuario.id}` : '/usuarios';
    const method = isEdit ? 'PUT' : 'POST';

    await request(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    await fetchUsuarios();
  };

  const openPassword = (usuario) => {
    setPasswordUsuario(usuario);
    setPasswordOpen(true);
  };

  const closePassword = () => {
    setPasswordOpen(false);
    setPasswordUsuario(null);
  };

  const handleChangePassword = async (password) => {
    await request(`/usuarios/${passwordUsuario.id}`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });

    await fetchUsuarios();
  };

  const handleDelete = async (usuario) => {
    const result = await Swal.fire({
      title: 'Eliminar usuario',
      text: `¿Seguro que querés eliminar a "${usuario.nombre} ${usuario.apellido || ''}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#111111',
      customClass: {
        popup: 'rounded-[28px]',
        title: 'titulo',
        confirmButton: 'rounded-2xl px-5 py-3 font-bold',
        cancelButton: 'rounded-2xl px-5 py-3 font-bold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await request(`/usuarios/${usuario.id}`, {
        method: 'DELETE'
      });

      await fetchUsuarios();
      await showSuccess('Usuario eliminado correctamente.');
    } catch (error) {
      await showError(
        getErrorMessage(error, 'No se pudo eliminar el usuario.')
      );
    }
  };

  const openAsignaciones = (usuario) => {
    setAsignacionesUsuario(usuario);
    setAsignacionesOpen(true);
    setAsignacionForm({
      sucursal_id: '',
      rol_sucursal: 'OPERARIO',
      es_principal: false,
      estado: 'ACTIVO'
    });
  };

  const closeAsignaciones = () => {
    setAsignacionesOpen(false);
    setAsignacionesUsuario(null);
    setAsignacionForm({
      sucursal_id: '',
      rol_sucursal: 'OPERARIO',
      es_principal: false,
      estado: 'ACTIVO'
    });
  };

  const refreshUsuarioAsignaciones = async (usuarioId) => {
    const data = await request(`/usuarios/${usuarioId}`, {
      method: 'GET'
    });

    const usuarioActualizado = data?.usuario || null;

    if (usuarioActualizado) {
      setAsignacionesUsuario(usuarioActualizado);

      setUsuarios((prev) =>
        prev.map((item) =>
          String(item.id) === String(usuarioId) ? usuarioActualizado : item
        )
      );
    }
  };

  const handleAsignacionChange = (event) => {
    const { name, value, checked, type } = event.target;

    setAsignacionForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const prefillAsignacion = (sucursal) => {
    const pivot = getPivot(sucursal);

    setAsignacionForm({
      sucursal_id: sucursal.id,
      rol_sucursal: pivot?.rol_sucursal || 'OPERARIO',
      es_principal: Boolean(pivot?.es_principal),
      estado: pivot?.estado || 'ACTIVO'
    });
  };

  const saveAsignacion = async (event) => {
    event.preventDefault();

    if (!asignacionForm.sucursal_id) {
      await showError('Seleccioná una sucursal para asignar.');
      return;
    }

    try {
      Swal.fire({
        title: 'Guardando asignación...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        background: '#ffffff',
        color: '#111111',
        customClass: {
          popup: 'rounded-[28px]',
          title: 'titulo'
        }
      });

      await request(`/usuarios/${asignacionesUsuario.id}/sucursales`, {
        method: 'POST',
        body: JSON.stringify({
          sucursal_id: asignacionForm.sucursal_id,
          rol_sucursal: asignacionForm.rol_sucursal,
          es_principal: asignacionForm.es_principal,
          estado: asignacionForm.estado
        })
      });

      await refreshUsuarioAsignaciones(asignacionesUsuario.id);

      Swal.close();
      await showSuccess('Asignación guardada correctamente.');

      setAsignacionForm({
        sucursal_id: '',
        rol_sucursal: 'OPERARIO',
        es_principal: false,
        estado: 'ACTIVO'
      });
    } catch (error) {
      Swal.close();
      await showError(
        getErrorMessage(error, 'No se pudo guardar la asignación.')
      );
    }
  };

  const deleteAsignacion = async (sucursal) => {
    const result = await Swal.fire({
      title: 'Eliminar asignación',
      text: `¿Quitar acceso a "${sucursal.nombre}" para este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#111111',
      customClass: {
        popup: 'rounded-[28px]',
        title: 'titulo',
        confirmButton: 'rounded-2xl px-5 py-3 font-bold',
        cancelButton: 'rounded-2xl px-5 py-3 font-bold'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await request(
        `/usuarios/${asignacionesUsuario.id}/sucursales/${sucursal.id}`,
        {
          method: 'DELETE'
        }
      );

      await refreshUsuarioAsignaciones(asignacionesUsuario.id);
      await showSuccess('Asignación eliminada correctamente.');
    } catch (error) {
      await showError(
        getErrorMessage(error, 'No se pudo eliminar la asignación.')
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#eef6fb] text-[var(--color-text)] cuerpo">
      <section className="relative overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,223,.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(90,151,208,.12),transparent_32%)]" />
        <div className="absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(217,226,232,.70)_1px,transparent_1px),linear-gradient(90deg,rgba(217,226,232,.70)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <header className="mb-5 flex flex-col gap-4 rounded-[32px] border border-white bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--color-border)] bg-white text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Core administrativo
                </p>

                <h1 className="titulo mt-1 text-4xl leading-none tracking-[-0.045em] text-slate-950 sm:text-5xl">
                  Usuarios
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                  Administrá accesos, roles globales, estados, sucursales
                  asignadas y contraseñas del sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.25)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary)]"
            >
              <Plus className="h-5 w-5" />
              Nuevo usuario
            </button>
          </header>

          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Total usuarios
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-950">
                {stats.total}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Activos</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-emerald-600">
                {stats.activos}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Administradores
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--color-primary)]">
                {stats.admins}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Bloqueados</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-red-500">
                {stats.bloqueados}
              </p>
            </article>
          </section>

          <section className="rounded-[32px] border border-white bg-white/86 p-4 shadow-sm backdrop-blur-xl sm:p-5">
            <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_180px_200px_220px_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                <Search className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Buscar por nombre, apellido, email o teléfono"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,211,223,.10)]"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_USUARIO.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={rolGlobal}
                onChange={(event) => setRolGlobal(event.target.value)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,211,223,.10)]"
              >
                <option value="">Todos los roles</option>
                {ROLES_GLOBALES.map((item) => (
                  <option key={item} value={item}>
                    {formatRole(item)}
                  </option>
                ))}
              </select>

              <select
                value={sucursalId}
                onChange={(event) => setSucursalId(event.target.value)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,211,223,.10)]"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchUsuarios}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Actualizar
              </button>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[1040px] w-full border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Usuario
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Contacto
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Rol
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Estado
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Sucursales
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Último login
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                            <p className="text-sm font-semibold text-slate-500">
                              Cargando usuarios...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-[var(--color-primary)]">
                            <Users className="h-6 w-6" />
                          </div>

                          <h3 className="titulo mt-4 text-3xl leading-none text-slate-950">
                            No hay usuarios
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            Creá el primer usuario para administrar VALMAT.
                          </p>

                          <button
                            type="button"
                            onClick={openCreate}
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--color-secondary)]"
                          >
                            <Plus className="h-5 w-5" />
                            Nuevo usuario
                          </button>
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usuario) => (
                        <tr
                          key={usuario.id}
                          className="transition hover:bg-cyan-50/35"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                                {getInitials(usuario)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-950">
                                  {usuario.nombre} {usuario.apellido || ''}
                                </p>
                                <p className="text-xs text-slate-400">
                                  ID #{usuario.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2 text-slate-700">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span className="max-w-[210px] truncate">
                                  {usuario.email || 'Sin email'}
                                </span>
                              </p>

                              <p className="flex items-center gap-2 text-slate-500">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {usuario.telefono || 'Sin teléfono'}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-black text-cyan-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {formatRole(usuario.rol_global)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                                usuario.estado === 'ACTIVO'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : usuario.estado === 'BLOQUEADO'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {usuario.estado}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => openAsignaciones(usuario)}
                              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                            >
                              <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                              {Array.isArray(usuario.sucursales)
                                ? usuario.sucursales.length
                                : 0}{' '}
                              asignadas
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-700">
                              {formatDateTime(usuario.ultimo_login)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(usuario)}
                                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                title="Editar"
                              >
                                <Pencil className="h-4.5 w-4.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openPassword(usuario)}
                                className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                                title="Cambiar contraseña"
                              >
                                <KeyRound className="h-4.5 w-4.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(usuario)}
                                className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </section>

      <UsuarioFormModal
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmitUsuario}
        initial={editingUsuario}
      />

      <UsuarioPasswordModal
        open={passwordOpen}
        onClose={closePassword}
        usuario={passwordUsuario}
        onSubmit={handleChangePassword}
      />

      <AnimatePresence>
        {asignacionesOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={closeAsignaciones}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Cerrar asignaciones"
            />

            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#08111f]/95 text-white shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
                  backgroundSize: '36px 36px'
                }}
              />

              <div className="relative z-10 border-b border-white/10 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={closeAsignaciones}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-200" />
                </button>

                <div className="flex items-center gap-3 pr-10">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                      Sucursales del usuario
                    </p>

                    <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {asignacionesUsuario?.nombre}{' '}
                      {asignacionesUsuario?.apellido || ''}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="relative z-10 max-h-[calc(88vh-112px)] overflow-y-auto p-5 sm:p-6">
                <form
                  onSubmit={saveAsignacion}
                  className="mb-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-200">
                        Sucursal
                      </span>

                      <select
                        name="sucursal_id"
                        value={asignacionForm.sucursal_id}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      >
                        <option value="" className="bg-slate-950">
                          Seleccionar sucursal
                        </option>

                        {sucursales.map((sucursal) => (
                          <option
                            key={sucursal.id}
                            value={sucursal.id}
                            className="bg-slate-950"
                          >
                            {sucursal.nombre}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-200">
                        Rol en sucursal
                      </span>

                      <select
                        name="rol_sucursal"
                        value={asignacionForm.rol_sucursal}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      >
                        {ROLES_SUCURSAL.map((role) => (
                          <option
                            key={role}
                            value={role}
                            className="bg-slate-950"
                          >
                            {formatRole(role)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-200">
                        Estado asignación
                      </span>

                      <select
                        name="estado"
                        value={asignacionForm.estado}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      >
                        {ESTADOS_ASIGNACION.map((item) => (
                          <option
                            key={item}
                            value={item}
                            className="bg-slate-950"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex cursor-pointer select-none items-end gap-3 pb-3">
                      <input
                        type="checkbox"
                        name="es_principal"
                        checked={asignacionForm.es_principal}
                        onChange={handleAsignacionChange}
                        className="peer sr-only"
                      />

                      <span
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors duration-200 peer-checked:bg-emerald-500/70"
                        aria-hidden
                      >
                        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
                      </span>

                      <span className="text-sm text-gray-200">
                        Sucursal principal
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 font-semibold text-white transition hover:brightness-110"
                    >
                      Guardar asignación
                    </button>
                  </div>
                </form>

                {!Array.isArray(asignacionesUsuario?.sucursales) ||
                asignacionesUsuario.sucursales.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                    <p className="text-sm font-semibold text-gray-200">
                      Este usuario no tiene sucursales asignadas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {asignacionesUsuario.sucursales.map((sucursal) => {
                      const pivot = getPivot(sucursal);

                      return (
                        <article
                          key={sucursal.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:bg-white/[0.08]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h4 className="truncate text-base font-bold text-white">
                                {sucursal.nombre}
                              </h4>

                              <p className="mt-1 text-sm text-gray-400">
                                {sucursal.localidad || 'Sin localidad'} ·{' '}
                                {sucursal.provincia || 'Sin provincia'}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                                  {formatRole(pivot?.rol_sucursal)}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    pivot?.estado === 'ACTIVO'
                                      ? 'bg-emerald-400/10 text-emerald-200'
                                      : 'bg-white/10 text-gray-300'
                                  }`}
                                >
                                  {pivot?.estado || 'SIN_ESTADO'}
                                </span>

                                {pivot?.es_principal && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                                    <Crown className="h-3.5 w-3.5" />
                                    Principal
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => prefillAsignacion(sucursal)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 transition hover:bg-white/10"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteAsignacion(sucursal)}
                                className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-400/20"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
