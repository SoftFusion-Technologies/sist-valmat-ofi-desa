// Benjamin Orellana - 25/04/2026 - Administración de sucursales VALMAT con filtros dinámicos, formulario separado y detalle de usuarios asignados.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  ShieldCheck,
  Crown,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';
import SucursalFormModal from './Forms/SucursalFormModal';

const API_URL = import.meta.env.VITE_API_URL;

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback || 'Ocurrió un error inesperado.';
};

const normalizar = (value) => {
  if (value === undefined || value === null) return '';
  return String(value);
};

const getUsersCount = (sucursal) => {
  if (!Array.isArray(sucursal?.usuarios)) return 0;
  return sucursal.usuarios.length;
};

const formatRole = (role) => {
  if (!role) return 'Sin rol';

  return String(role)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

const getUsuarioSucursalData = (usuario, sucursalId) => {
  const sucursal = Array.isArray(usuario?.sucursales)
    ? usuario.sucursales.find((item) => String(item.id) === String(sucursalId))
    : null;

  return (
    sucursal?.usuarios_sucursales ||
    usuario?.usuarios_sucursales ||
    usuario?.usuario_sucursal ||
    null
  );
};

const filterUsuariosBySucursal = (usuarios, sucursalId) => {
  if (!Array.isArray(usuarios)) return [];

  return usuarios.filter((usuario) => {
    if (Array.isArray(usuario?.sucursales)) {
      return usuario.sucursales.some(
        (sucursal) => String(sucursal.id) === String(sucursalId)
      );
    }

    return String(usuario?.sucursal_id) === String(sucursalId);
  });
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

export default function SucursalesAdmin() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

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
    const total = sucursales.length;
    const activas = sucursales.filter(
      (item) => item.estado === 'ACTIVA'
    ).length;
    const inactivas = sucursales.filter(
      (item) => item.estado === 'INACTIVA'
    ).length;
    const usuarios = sucursales.reduce(
      (acc, item) => acc + getUsersCount(item),
      0
    );

    return {
      total,
      activas,
      inactivas,
      usuarios
    };
  }, [sucursales]);

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
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set('incluir_usuarios', 'true');

      if (q.trim()) params.set('q', q.trim());
      if (estado) params.set('estado', estado);

      const data = await request(`/sucursales?${params.toString()}`, {
        method: 'GET'
      });

      setSucursales(Array.isArray(data?.sucursales) ? data.sucursales : []);
    } catch (error) {
      await showError(getErrorMessage(error, 'Error al obtener sucursales.'));
    } finally {
      setLoading(false);
    }
  }, [estado, q, request]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSucursales();
    }, 50);

    return () => clearTimeout(timeout);
  }, [fetchSucursales]);

  const openCreate = () => {
    setEditingSucursal(null);
    setFormOpen(true);
  };

  const openEdit = (sucursal) => {
    setEditingSucursal(sucursal);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSucursal(null);
  };

  const handleSubmitSucursal = async (payload) => {
    const isEdit = Boolean(editingSucursal?.id);

    const endpoint = isEdit
      ? `/sucursales/${editingSucursal.id}`
      : '/sucursales';

    const method = isEdit ? 'PUT' : 'POST';

    await request(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    await fetchSucursales();
  };

  const handleDelete = async (sucursal) => {
    const result = await Swal.fire({
      title: 'Eliminar sucursal',
      text: `¿Seguro que querés eliminar "${sucursal.nombre}"? Esta acción no se puede deshacer.`,
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
      await request(`/sucursales/${sucursal.id}`, {
        method: 'DELETE'
      });

      await fetchSucursales();
      await showSuccess('Sucursal eliminada correctamente.');
    } catch (error) {
      await showError(
        getErrorMessage(error, 'No se pudo eliminar la sucursal.')
      );
    }
  };

  const openUsuarios = async (sucursal) => {
    setSelectedSucursal(sucursal);
    setUsersOpen(true);

    const usuariosPrecargados = Array.isArray(sucursal?.usuarios)
      ? sucursal.usuarios
      : [];
    setSelectedUsers(usuariosPrecargados);
    setUsersLoading(true);

    try {
      const data = await request('/usuarios', {
        method: 'GET'
      });

      const usuariosFiltrados = filterUsuariosBySucursal(
        data?.usuarios,
        sucursal.id
      );

      setSelectedUsers(usuariosFiltrados);
    } catch (error) {
      if (usuariosPrecargados.length === 0) {
        await showError(
          getErrorMessage(
            error,
            'No se pudieron obtener los usuarios de la sucursal.'
          )
        );
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const closeUsuarios = () => {
    setUsersOpen(false);
    setUsersLoading(false);
    setSelectedSucursal(null);
    setSelectedUsers([]);
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

                <h1 className="titulo uppercase mt-1 text-4xl leading-none tracking-[-0.045em] text-slate-950 sm:text-5xl">
                  Sucursales
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                  Gestioná las bases operativas de VALMAT, ubicación, contacto,
                  estado y usuarios asignados.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.25)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary)]"
            >
              <Plus className="h-5 w-5" />
              Nueva sucursal
            </button>
          </header>

          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Total sucursales
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-950">
                {stats.total}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Activas</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-emerald-600">
                {stats.activas}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Inactivas</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-500">
                {stats.inactivas}
              </p>
            </article>

            <article className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Usuarios asignados
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--color-primary)]">
                {stats.usuarios}
              </p>
            </article>
          </section>

          <section className="rounded-[32px] border border-white bg-white/86 p-4 shadow-sm backdrop-blur-xl sm:p-5">
            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                <Search className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Buscar por nombre, localidad, provincia, teléfono o email"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,211,223,.10)]"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activas</option>
                <option value="INACTIVA">Inactivas</option>
              </select>

              <button
                type="button"
                onClick={fetchSucursales}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Actualizar
              </button>
            </div>

            {loading ? (
              <div className="grid min-h-[320px] place-items-center rounded-[28px] border border-dashed border-slate-200 bg-white/70">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                  <p className="text-sm font-semibold text-slate-500">
                    Cargando sucursales...
                  </p>
                </div>
              </div>
            ) : sucursales.length === 0 ? (
              <div className="grid min-h-[320px] place-items-center rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-6 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-[var(--color-primary)]">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <h3 className="titulo mt-4 text-3xl leading-none text-slate-950">
                    No hay sucursales
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Creá la primera base operativa para comenzar a administrar
                    VALMAT.
                  </p>

                  <button
                    type="button"
                    onClick={openCreate}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--color-secondary)]"
                  >
                    <Plus className="h-5 w-5" />
                    Nueva sucursal
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {sucursales.map((sucursal) => (
                  <article
                    key={sucursal.id}
                    className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-4">
                          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-[var(--color-primary)]">
                            <Building2 className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-black tracking-[-0.03em] text-slate-950">
                                {sucursal.nombre}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                                  sucursal.estado === 'ACTIVA'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {sucursal.estado}
                              </span>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {sucursal.descripcion ||
                                'Sin descripción registrada.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(sucursal)}
                            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                            aria-label="Editar sucursal"
                          >
                            <Pencil className="h-4.5 w-4.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sucursal)}
                            className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                            aria-label="Eliminar sucursal"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Ubicación
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {sucursal.localidad || 'Sin localidad'}
                          </p>

                          <p className="text-xs text-slate-500">
                            {sucursal.provincia || 'Sin provincia'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openUsuarios(sucursal)}
                          className="rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-cyan-50 hover:ring-2 hover:ring-cyan-100"
                        >
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Usuarios
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <Users className="h-4 w-4 text-[var(--color-primary)]" />
                            {getUsersCount(sucursal)} asignados
                          </div>

                          <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">
                            Ver usuarios
                          </p>
                        </button>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                        <div className="flex gap-2 text-sm font-semibold text-slate-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span>
                            {sucursal.direccion || 'Sin dirección registrada'}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <span className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {sucursal.telefono || 'Sin teléfono'}
                          </span>

                          <span className="flex items-center gap-2 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">
                              {sucursal.email || 'Sin email'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <SucursalFormModal
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmitSucursal}
        initial={editingSucursal}
      />

      <AnimatePresence>
        {usersOpen && (
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
              onClick={closeUsuarios}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Cerrar usuarios"
            />

            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#08111f]/95 text-white shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl"
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
                  onClick={closeUsuarios}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-200" />
                </button>

                <div className="flex items-center gap-3 pr-10">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                    <Users className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                      Usuarios asignados
                    </p>

                    <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {selectedSucursal?.nombre || 'Sucursal'}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="relative z-10 max-h-[calc(88vh-112px)] overflow-y-auto p-5 sm:p-6">
                {usersLoading ? (
                  <div className="grid min-h-[220px] place-items-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
                      <p className="text-sm text-gray-300">
                        Cargando usuarios...
                      </p>
                    </div>
                  </div>
                ) : selectedUsers.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                    <p className="text-sm font-semibold text-gray-200">
                      Esta sucursal no tiene usuarios asignados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUsers.map((usuario) => {
                      const pivot = getUsuarioSucursalData(
                        usuario,
                        selectedSucursal?.id
                      );

                      return (
                        <article
                          key={usuario.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:bg-white/[0.08]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-sm font-black text-cyan-100">
                                {getInitials(usuario)}
                              </div>

                              <div className="min-w-0">
                                <h4 className="truncate text-base font-bold text-white">
                                  {normalizar(usuario.nombre)}{' '}
                                  {normalizar(usuario.apellido)}
                                </h4>

                                <p className="mt-1 truncate text-sm text-gray-300">
                                  {usuario.email || 'Sin email'}
                                </p>

                                <p className="mt-0.5 text-sm text-gray-400">
                                  {usuario.telefono || 'Sin teléfono'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {formatRole(usuario.rol_global)}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  usuario.estado === 'ACTIVO'
                                    ? 'bg-emerald-400/10 text-emerald-200'
                                    : 'bg-white/10 text-gray-300'
                                }`}
                              >
                                {usuario.estado || 'SIN_ESTADO'}
                              </span>

                              {pivot?.es_principal && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                                  <Crown className="h-3.5 w-3.5" />
                                  Principal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                              Rol en sucursal
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-100">
                              {formatRole(pivot?.rol_sucursal)}
                            </p>
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
