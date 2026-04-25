// Benjamin Orellana - 25/04/2026 - Administración de sucursales VALMAT con filtros dinámicos, formulario separado y detalle de usuarios asignados.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  ChevronsUpDown,
  Crown,
  Eye,
  Filter,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
  Users,
  X
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

// Benjamin Orellana - 25/04/2026 - Metadatos visuales centralizados para mejorar legibilidad de estados.
const STATUS_META = {
  ACTIVA: {
    label: 'Activa',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    card: 'from-emerald-50/90 to-white'
  },
  INACTIVA: {
    label: 'Inactiva',
    icon: Ban,
    pill: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
    card: 'from-slate-50/95 to-white'
  }
};

const getStatusMeta = (estado) => {
  return (
    STATUS_META[estado] || {
      label: estado || 'Sin estado',
      icon: Building2,
      pill: 'bg-slate-100 text-slate-600 ring-slate-200',
      dot: 'bg-slate-400',
      card: 'from-slate-50/95 to-white'
    }
  );
};

const sortText = (value) => {
  return String(value || '').toLowerCase();
};

const SucursalStatusPill = ({ estado }) => {
  const meta = getStatusMeta(estado);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ring-1 ${meta.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const SucursalSkeleton = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <article
          key={item}
          className="overflow-hidden rounded-[30px] border border-white bg-white/80 p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </article>
      ))}
    </div>
  );
};

export default function SucursalesAdmin() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [estado, setEstado] = useState('');

  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');

  const [formOpen, setFormOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersQ, setUsersQ] = useState('');
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

  // Benjamin Orellana - 25/04/2026 - Se agrega debounce para evitar consultas innecesarias mientras el usuario escribe.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 380);

    return () => clearTimeout(timeout);
  }, [q]);

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

  const filtrosActivos = useMemo(() => {
    return Boolean(q.trim() || estado);
  }, [estado, q]);

  const sucursalesOrdenadas = useMemo(() => {
    const ordered = [...sucursales].sort((a, b) => {
      let left = '';
      let right = '';

      if (sortBy === 'usuarios') {
        left = getUsersCount(a);
        right = getUsersCount(b);
      } else if (sortBy === 'estado') {
        left = sortText(a.estado);
        right = sortText(b.estado);
      } else if (sortBy === 'localidad') {
        left = sortText(`${a.localidad || ''} ${a.provincia || ''}`);
        right = sortText(`${b.localidad || ''} ${b.provincia || ''}`);
      } else {
        left = sortText(a.nombre);
        right = sortText(b.nombre);
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return sortDirection === 'asc' ? left - right : right - left;
      }

      return sortDirection === 'asc'
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });

    return ordered;
  }, [sortBy, sortDirection, sucursales]);

  const selectedUsersFiltered = useMemo(() => {
    const search = usersQ.trim().toLowerCase();

    if (!search) return selectedUsers;

    return selectedUsers.filter((usuario) => {
      const searchable = [
        usuario.nombre,
        usuario.apellido,
        usuario.email,
        usuario.telefono,
        usuario.rol_global,
        usuario.estado
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(search);
    });
  }, [selectedUsers, usersQ]);

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

  const fetchSucursales = useCallback(
    async (searchOverride) => {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        const searchValue =
          typeof searchOverride === 'string'
            ? searchOverride.trim()
            : debouncedQ;

        params.set('incluir_usuarios', 'true');

        if (searchValue) params.set('q', searchValue);
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
    },
    [debouncedQ, estado, request]
  );

  useEffect(() => {
    fetchSucursales();
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

    await fetchSucursales(q);
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

      await fetchSucursales(q);
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
    setUsersQ('');

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
    setUsersQ('');
    setSelectedSucursal(null);
    setSelectedUsers([]);
  };

  const resetFilters = () => {
    setQ('');
    setDebouncedQ('');
    setEstado('');
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(key);
    setSortDirection('asc');
  };

  const statCards = [
    {
      label: 'Sucursales cargadas',
      value: stats.total,
      helper: 'Resultado actual',
      icon: Building2,
      className: 'text-slate-950',
      bg: 'bg-slate-950'
    },
    {
      label: 'Activas',
      value: stats.activas,
      helper: 'Operativas',
      icon: CheckCircle2,
      className: 'text-emerald-600',
      bg: 'bg-emerald-500'
    },
    {
      label: 'Inactivas',
      value: stats.inactivas,
      helper: 'Pausadas',
      icon: Ban,
      className: 'text-slate-500',
      bg: 'bg-slate-400'
    },
    {
      label: 'Usuarios asignados',
      value: stats.usuarios,
      helper: 'Entre sucursales',
      icon: Users,
      className: 'text-[var(--color-primary)]',
      bg: 'bg-[var(--color-primary)]'
    }
  ];

  const renderSucursalCard = (sucursal, index = 0) => {
    const meta = getStatusMeta(sucursal.estado);

    return (
      <motion.article
        key={sucursal.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: Math.min(index * 0.035, 0.18) }}
        className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_70px_rgba(25,211,223,.16)]"
      >
        <div
          className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${meta.card}`}
        />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-4">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[var(--color-primary)] shadow-sm ring-1 ring-cyan-100">
                <Building2 className="h-6 w-6" />
                <span
                  className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white ${meta.dot}`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-black tracking-[-0.03em] text-slate-950">
                    {sucursal.nombre}
                  </h3>

                  <SucursalStatusPill estado={sucursal.estado} />
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {sucursal.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openEdit(sucursal)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Editar sucursal"
              >
                <Pencil className="h-[18px] w-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(sucursal)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500 shadow-sm transition hover:bg-red-100 hover:text-red-700"
                aria-label="Eliminar sucursal"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Ubicación
              </p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {sucursal.localidad || 'Sin localidad'}
              </p>

              <p className="text-xs font-semibold text-slate-500">
                {sucursal.provincia || 'Sin provincia'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openUsuarios(sucursal)}
              className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:ring-2 hover:ring-cyan-100"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Usuarios
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900">
                <Users className="h-4 w-4 text-[var(--color-primary)]" />
                {getUsersCount(sucursal)} asignados
              </div>

              <p className="mt-1 inline-flex items-center gap-1 text-xs font-black text-[var(--color-primary)]">
                Ver detalle
                <Eye className="h-3.5 w-3.5" />
              </p>
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              <span>{sucursal.direccion || 'Sin dirección registrada'}</span>
            </div>

            <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2">
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
      </motion.article>
    );
  };

  const renderSortButton = (key, label) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.13em] text-slate-500 transition hover:text-slate-950"
    >
      {label}
      <ChevronsUpDown
        className={`h-3.5 w-3.5 ${
          sortBy === key ? 'text-[var(--color-primary)]' : 'text-slate-300'
        }`}
      />
    </button>
  );

  return (
    <main className="min-h-screen bg-[#eef6fb] text-[var(--color-text)] cuerpo">
      <section className="relative overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,223,.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(90,151,208,.16),transparent_32%)]" />

        <div className="absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(217,226,232,.70)_1px,transparent_1px),linear-gradient(90deg,rgba(217,226,232,.70)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative z-10 mx-auto ">
          <header className="mb-5 overflow-hidden rounded-[34px] border border-white bg-white/85 shadow-[0_22px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(25,211,223,.16),transparent_42%)]" />

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--color-border)] bg-white text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    aria-label="Volver al dashboard"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)]">
                      <Building2 className="h-3.5 w-3.5" />
                      Core administrativo
                    </div>

                    <h1 className="titulo uppercase mt-3 text-4xl leading-none tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                      Sucursales
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                      Gestioná bases operativas, ubicación, contacto, estado y
                      usuarios asignados desde una vista más clara, rápida y
                      cómoda para administración.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                  <button
                    type="button"
                    onClick={() => fetchSucursales(q)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    Actualizar
                  </button>

                  <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.28)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary)]"
                  >
                    <Plus className="h-5 w-5" />
                    Nueva sucursal
                  </button>
                </div>
              </div>
            </div>
          </header>

          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.article
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-[28px] border border-white bg-white/90 p-5 shadow-[0_16px_45px_rgba(15,23,42,.05)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {stat.label}
                      </p>

                      <p
                        className={`mt-3 text-4xl font-black tracking-[-0.06em] ${stat.className}`}
                      >
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        {stat.helper}
                      </p>
                    </div>

                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-sm ${stat.bg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>

          <section className="rounded-[34px] border border-white bg-white/86 p-4 shadow-[0_22px_70px_rgba(15,23,42,.07)] backdrop-blur-xl sm:p-5">
            <div className="mb-5 rounded-[28px] border border-slate-100 bg-white p-3 shadow-sm">
              <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                  <Search className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                  <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Buscar por nombre, localidad, provincia, teléfono o email"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-slate-400 transition hover:text-slate-800"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { value: '', label: 'Todas' },
                    { value: 'ACTIVA', label: 'Activas' },
                    { value: 'INACTIVA', label: 'Inactivas' }
                  ].map((item) => {
                    const active = estado === item.value;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setEstado(item.value)}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                          active
                            ? 'bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,.18)]'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-1 lg:flex">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                        viewMode === 'table'
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Table2 className="h-4 w-4" />
                      Tabla
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                        viewMode === 'cards'
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Cards
                    </button>
                  </div>

                  {filtrosActivos && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:border-red-200 hover:text-red-600"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <SucursalSkeleton />
            ) : sucursalesOrdenadas.length === 0 ? (
              <div className="grid min-h-[340px] place-items-center rounded-[30px] border border-dashed border-slate-200 bg-white/75 p-6 text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cyan-50 text-[var(--color-primary)] ring-8 ring-cyan-50/60">
                    <Building2 className="h-7 w-7" />
                  </div>

                  <h3 className="titulo mt-5 text-3xl leading-none text-slate-950">
                    No hay sucursales para mostrar
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Ajustá los filtros o creá una nueva base operativa para
                    comenzar a administrar VALMAT.
                  </p>

                  <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                    {filtrosActivos && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Limpiar filtros
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={openCreate}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--color-secondary)]"
                    >
                      <Plus className="h-5 w-5" />
                      Nueva sucursal
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="lg:hidden">
                  <div className="grid gap-4">
                    {sucursalesOrdenadas.map((sucursal, index) =>
                      renderSucursalCard(sucursal, index)
                    )}
                  </div>
                </div>

                <div
                  className={
                    viewMode === 'cards'
                      ? 'hidden gap-4 lg:grid lg:grid-cols-2'
                      : 'hidden'
                  }
                >
                  {sucursalesOrdenadas.map((sucursal, index) =>
                    renderSucursalCard(sucursal, index)
                  )}
                </div>

                <div
                  className={
                    viewMode === 'table'
                      ? 'hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:block'
                      : 'hidden'
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-[1040px] w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90">
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('nombre', 'Sucursal')}
                          </th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('localidad', 'Ubicación')}
                          </th>
                          <th className="px-5 py-4 text-left">Contacto</th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('usuarios', 'Usuarios')}
                          </th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('estado', 'Estado')}
                          </th>
                          <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {sucursalesOrdenadas.map((sucursal, index) => (
                          <motion.tr
                            key={sucursal.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(index * 0.025, 0.16)
                            }}
                            className="border-b border-slate-100 transition hover:bg-cyan-50/45"
                          >
                            <td className="px-5 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-[var(--color-primary)] ring-1 ring-cyan-100">
                                  <Building2 className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-slate-950">
                                    {sucursal.nombre}
                                  </p>

                                  <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-500">
                                    {sucursal.descripcion ||
                                      'Sin descripción registrada.'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-slate-800">
                                {sucursal.localidad || 'Sin localidad'}
                              </p>

                              <p className="text-xs font-semibold text-slate-500">
                                {sucursal.provincia || 'Sin provincia'}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                {sucursal.direccion ||
                                  'Sin dirección registrada'}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="space-y-1 text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                                  {sucursal.telefono || 'Sin teléfono'}
                                </span>

                                <span className="flex max-w-[230px] items-center gap-2 truncate">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate">
                                    {sucursal.email || 'Sin email'}
                                  </span>
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => openUsuarios(sucursal)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-black text-slate-900 transition hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary)]"
                              >
                                <Users className="h-4 w-4" />
                                {getUsersCount(sucursal)}
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </td>

                            <td className="px-5 py-4">
                              <SucursalStatusPill estado={sucursal.estado} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openUsuarios(sucursal)}
                                  className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-[var(--color-primary)]"
                                  aria-label="Ver usuarios"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEdit(sucursal)}
                                  className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                  aria-label="Editar sucursal"
                                >
                                  <Pencil className="h-[18px] w-[18px]" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(sucursal)}
                                  className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                                  aria-label="Eliminar sucursal"
                                >
                                  <Trash2 className="h-[18px] w-[18px]" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
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
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
              aria-label="Cerrar usuarios"
            />

            <motion.section
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[#08111f]/96 text-white shadow-[0_30px_100px_rgba(0,0,0,.48)] backdrop-blur-xl"
            >
              

              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="relative z-10 border-b border-white/10 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={closeUsuarios}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-200" />
                </button>

                <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-13 w-13 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/15">
                      <Users className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                        Usuarios asignados
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {selectedSucursal?.nombre || 'Sucursal'}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        {selectedUsers.length} usuarios vinculados a esta
                        sucursal.
                      </p>
                    </div>
                  </div>

                  <SucursalStatusPill estado={selectedSucursal?.estado} />
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 transition focus-within:border-cyan-200/50 focus-within:bg-white/[0.08]">
                  <Search className="h-5 w-5 shrink-0 text-cyan-100/70" />

                  <input
                    value={usersQ}
                    onChange={(event) => setUsersQ(event.target.value)}
                    placeholder="Buscar usuario por nombre, email, teléfono, rol o estado"
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-gray-500"
                  />

                  {usersQ && (
                    <button
                      type="button"
                      onClick={() => setUsersQ('')}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
                      aria-label="Limpiar búsqueda de usuarios"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative z-10 max-h-[calc(90vh-190px)] overflow-y-auto p-5 sm:p-6">
                {usersLoading ? (
                  <div className="grid min-h-[240px] place-items-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
                      <p className="text-sm font-semibold text-gray-300">
                        Cargando usuarios...
                      </p>
                    </div>
                  </div>
                ) : selectedUsersFiltered.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-cyan-100">
                      <Users className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-200">
                      {selectedUsers.length === 0
                        ? 'Esta sucursal no tiene usuarios asignados.'
                        : 'No se encontraron usuarios con ese criterio.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUsersFiltered.map((usuario, index) => {
                      const pivot = getUsuarioSucursalData(
                        usuario,
                        selectedSucursal?.id
                      );

                      return (
                        <motion.article
                          key={usuario.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(index * 0.03, 0.18)
                          }}
                          className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 transition hover:border-cyan-200/20 hover:bg-white/[0.08]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-sm font-black text-cyan-100 ring-1 ring-white/10">
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
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 ring-1 ring-cyan-200/10">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {formatRole(usuario.rol_global)}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                                  usuario.estado === 'ACTIVO'
                                    ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/10'
                                    : 'bg-white/10 text-gray-300 ring-white/10'
                                }`}
                              >
                                {usuario.estado || 'SIN_ESTADO'}
                              </span>

                              {pivot?.es_principal && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100 ring-1 ring-amber-200/10">
                                  <Crown className="h-3.5 w-3.5" />
                                  Principal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                Rol en sucursal
                              </p>

                              <p className="mt-1 text-sm font-bold text-gray-100">
                                {formatRole(pivot?.rol_sucursal)}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                Relación
                              </p>

                              <p className="mt-1 text-sm font-bold text-gray-100">
                                {pivot?.es_principal
                                  ? 'Usuario principal'
                                  : 'Usuario asignado'}
                              </p>
                            </div>
                          </div>
                        </motion.article>
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
