// Benjamin Orellana - 25/04/2026 - Administración premium de usuarios VALMAT con tabla, filtros, CRUD, password y asignaciones de sucursales.

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
  KeyRound,
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

// Benjamin Orellana - 25/04/2026 - Se centralizan estilos visuales de estados para una lectura más rápida en tabla, cards y modales.
const ESTADO_META = {
  ACTIVO: {
    label: 'Activo',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    card: 'from-emerald-50/90 to-white'
  },
  INACTIVO: {
    label: 'Inactivo',
    icon: Ban,
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-600 ring-slate-200',
    card: 'from-slate-50/95 to-white'
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    icon: Ban,
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-600 ring-red-100',
    card: 'from-red-50/80 to-white'
  }
};

const getEstadoMeta = (estado) => {
  return (
    ESTADO_META[estado] || {
      label: estado || 'Sin estado',
      icon: User,
      dot: 'bg-slate-400',
      pill: 'bg-slate-100 text-slate-600 ring-slate-200',
      card: 'from-slate-50/95 to-white'
    }
  );
};

const getRoleAccent = (role) => {
  if (role === 'SUPER_ADMIN') {
    return 'bg-slate-950 text-white ring-slate-900';
  }

  if (role === 'ADMIN') {
    return 'bg-cyan-50 text-cyan-700 ring-cyan-100';
  }

  if (role === 'ENCARGADO') {
    return 'bg-indigo-50 text-indigo-700 ring-indigo-100';
  }

  if (role === 'COMERCIAL') {
    return 'bg-sky-50 text-sky-700 ring-sky-100';
  }

  return 'bg-slate-100 text-slate-600 ring-slate-200';
};

const sortText = (value) => String(value || '').toLowerCase();

const EstadoPill = ({ estado }) => {
  const meta = getEstadoMeta(estado);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] ring-1 ${meta.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const RolePill = ({ role }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getRoleAccent(
        role
      )}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {formatRole(role)}
    </span>
  );
};

const UsuariosSkeleton = () => {
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

export default function UsuariosAdmin() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [estado, setEstado] = useState('');
  const [rolGlobal, setRolGlobal] = useState('');
  const [sucursalId, setSucursalId] = useState('');

  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Benjamin Orellana - 25/04/2026 - Se agrega debounce para evitar recargar la tabla en cada tecla escrita.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 380);

    return () => clearTimeout(timeout);
  }, [q]);

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

  const filtrosActivos = useMemo(() => {
    return Boolean(q.trim() || estado || rolGlobal || sucursalId);
  }, [estado, q, rolGlobal, sucursalId]);

  const usuariosOrdenados = useMemo(() => {
    const ordered = [...usuarios].sort((a, b) => {
      let left = '';
      let right = '';

      if (sortBy === 'estado') {
        left = sortText(a.estado);
        right = sortText(b.estado);
      } else if (sortBy === 'rol') {
        left = sortText(a.rol_global);
        right = sortText(b.rol_global);
      } else if (sortBy === 'sucursales') {
        left = Array.isArray(a.sucursales) ? a.sucursales.length : 0;
        right = Array.isArray(b.sucursales) ? b.sucursales.length : 0;
      } else if (sortBy === 'login') {
        left = a.ultimo_login ? new Date(a.ultimo_login).getTime() : 0;
        right = b.ultimo_login ? new Date(b.ultimo_login).getTime() : 0;
      } else {
        left = sortText(`${a.nombre || ''} ${a.apellido || ''}`);
        right = sortText(`${b.nombre || ''} ${b.apellido || ''}`);
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return sortDirection === 'asc' ? left - right : right - left;
      }

      return sortDirection === 'asc'
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });

    return ordered;
  }, [sortBy, sortDirection, usuarios]);

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

  const fetchUsuarios = useCallback(
    async (searchOverride) => {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        const searchValue =
          typeof searchOverride === 'string'
            ? searchOverride.trim()
            : debouncedQ;

        if (searchValue) params.set('q', searchValue);
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
    },
    [debouncedQ, estado, request, rolGlobal, sucursalId]
  );

  useEffect(() => {
    fetchSucursales();
  }, [fetchSucursales]);

  useEffect(() => {
    fetchUsuarios();
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

    await fetchUsuarios(q);
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

    await fetchUsuarios(q);
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

      await fetchUsuarios(q);
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

  const resetFilters = () => {
    setQ('');
    setDebouncedQ('');
    setEstado('');
    setRolGlobal('');
    setSucursalId('');
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(key);
    setSortDirection('asc');
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

  const statCards = [
    {
      label: 'Total usuarios',
      value: stats.total,
      helper: 'Resultado actual',
      icon: Users,
      className: 'text-slate-950',
      bg: 'bg-slate-950'
    },
    {
      label: 'Activos',
      value: stats.activos,
      helper: 'Con acceso habilitado',
      icon: CheckCircle2,
      className: 'text-emerald-600',
      bg: 'bg-emerald-500'
    },
    {
      label: 'Administradores',
      value: stats.admins,
      helper: 'Roles críticos',
      icon: ShieldCheck,
      className: 'text-[var(--color-primary)]',
      bg: 'bg-[var(--color-primary)]'
    },
    {
      label: 'Bloqueados',
      value: stats.bloqueados,
      helper: 'Acceso restringido',
      icon: Ban,
      className: 'text-red-500',
      bg: 'bg-red-500'
    }
  ];

  const renderUsuarioCard = (usuario, index = 0) => {
    const estadoMeta = getEstadoMeta(usuario.estado);
    const sucursalesCount = Array.isArray(usuario.sucursales)
      ? usuario.sucursales.length
      : 0;

    return (
      <motion.article
        key={usuario.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: Math.min(index * 0.035, 0.18) }}
        className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_70px_rgba(25,211,223,.16)]"
      >
        <div
          className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${estadoMeta.card}`}
        />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-4">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-sm ring-1 ring-slate-900/10">
                {getInitials(usuario)}
                <span
                  className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white ${estadoMeta.dot}`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-black tracking-[-0.03em] text-slate-950">
                    {usuario.nombre} {usuario.apellido || ''}
                  </h3>

                  <EstadoPill estado={usuario.estado} />
                </div>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  ID #{usuario.id}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openEdit(usuario)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Editar usuario"
              >
                <Pencil className="h-[18px] w-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => openPassword(usuario)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 shadow-sm transition hover:bg-amber-100"
                aria-label="Cambiar contraseña"
              >
                <KeyRound className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Rol global
              </p>

              <div className="mt-2">
                <RolePill role={usuario.rol_global} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAsignaciones(usuario)}
              className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:ring-2 hover:ring-cyan-100"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Sucursales
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900">
                <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                {sucursalesCount} asignadas
              </div>

              <p className="mt-1 inline-flex items-center gap-1 text-xs font-black text-[var(--color-primary)]">
                Gestionar accesos
                <Eye className="h-3.5 w-3.5" />
              </p>
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2">
              <span className="flex min-w-0 items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{usuario.email || 'Sin email'}</span>
              </span>

              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {usuario.telefono || 'Sin teléfono'}
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Último login
              </p>

              <p className="mt-1 text-sm font-black text-slate-800">
                {formatDateTime(usuario.ultimo_login)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => openAsignaciones(usuario)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <MapPin className="h-4 w-4" />
              Sucursales
            </button>

            <button
              type="button"
              onClick={() => handleDelete(usuario)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <main className="min-h-screen bg-[#eef6fb] text-[var(--color-text)] cuerpo">
      <section className="relative overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,223,.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(90,151,208,.16),transparent_32%)]" />
        <div className="absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(217,226,232,.70)_1px,transparent_1px),linear-gradient(90deg,rgba(217,226,232,.70)_1px,transparent_1px)] [background-size:54px_54px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative z-10 mx-auto">
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
                      <Users className="h-3.5 w-3.5" />
                      Core administrativo
                    </div>

                    <h1 className="titulo uppercase mt-3 text-4xl leading-none tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                      Usuarios
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                      Administrá accesos, roles globales, estados, sucursales
                      asignadas y cambios de contraseña desde una vista más
                      rápida, clara y segura.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                  <button
                    type="button"
                    onClick={() => fetchUsuarios(q)}
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
                    Nuevo usuario
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
              <div className="grid gap-3 2xl:grid-cols-[1fr_auto_auto]">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                  <Search className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                  <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Buscar por nombre, apellido, email o teléfono"
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

                <div className="grid gap-2 sm:grid-cols-3 2xl:flex 2xl:items-center">
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
                </div>

                <div className="flex flex-wrap items-center gap-2">
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

                  <button
                    type="button"
                    onClick={() => fetchUsuarios(q)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Filter className="h-4 w-4" />
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <UsuariosSkeleton />
            ) : usuariosOrdenados.length === 0 ? (
              <div className="grid min-h-[340px] place-items-center rounded-[30px] border border-dashed border-slate-200 bg-white/75 p-6 text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cyan-50 text-[var(--color-primary)] ring-8 ring-cyan-50/60">
                    <Users className="h-7 w-7" />
                  </div>

                  <h3 className="titulo mt-5 text-3xl leading-none text-slate-950">
                    No hay usuarios para mostrar
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Ajustá los filtros o creá un nuevo usuario para comenzar a
                    administrar accesos en VALMAT.
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
                      Nuevo usuario
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="lg:hidden">
                  <div className="grid gap-4">
                    {usuariosOrdenados.map((usuario, index) =>
                      renderUsuarioCard(usuario, index)
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
                  {usuariosOrdenados.map((usuario, index) =>
                    renderUsuarioCard(usuario, index)
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
                    <table className="min-w-[1180px] w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90">
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('nombre', 'Usuario')}
                          </th>
                          <th className="px-5 py-4 text-left">Contacto</th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('rol', 'Rol')}
                          </th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('estado', 'Estado')}
                          </th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('sucursales', 'Sucursales')}
                          </th>
                          <th className="px-5 py-4 text-left">
                            {renderSortButton('login', 'Último login')}
                          </th>
                          <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {usuariosOrdenados.map((usuario, index) => {
                          const sucursalesCount = Array.isArray(
                            usuario.sucursales
                          )
                            ? usuario.sucursales.length
                            : 0;

                          return (
                            <motion.tr
                              key={usuario.id}
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
                                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white ring-1 ring-slate-900/10">
                                    {getInitials(usuario)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-slate-950">
                                      {usuario.nombre} {usuario.apellido || ''}
                                    </p>

                                    <p className="text-xs font-semibold text-slate-400">
                                      ID #{usuario.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1 text-sm">
                                  <p className="flex min-w-0 items-center gap-2 text-slate-700">
                                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span className="max-w-[230px] truncate">
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
                                <RolePill role={usuario.rol_global} />
                              </td>

                              <td className="px-5 py-4">
                                <EstadoPill estado={usuario.estado} />
                              </td>

                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => openAsignaciones(usuario)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-black text-slate-900 transition hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary)]"
                                >
                                  <MapPin className="h-4 w-4" />
                                  {sucursalesCount}
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-bold text-slate-700">
                                  {formatDateTime(usuario.ultimo_login)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openAsignaciones(usuario)}
                                    className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-[var(--color-primary)]"
                                    title="Sucursales"
                                  >
                                    <MapPin className="h-[18px] w-[18px]" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEdit(usuario)}
                                    className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                    title="Editar"
                                  >
                                    <Pencil className="h-[18px] w-[18px]" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openPassword(usuario)}
                                    className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                                    title="Cambiar contraseña"
                                  >
                                    <KeyRound className="h-[18px] w-[18px]" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(usuario)}
                                    className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-[18px] w-[18px]" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
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
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
              aria-label="Cerrar asignaciones"
            />

            <motion.section
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[#08111f]/96 text-white shadow-[0_30px_100px_rgba(0,0,0,.48)] backdrop-blur-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
                  backgroundSize: '36px 36px'
                }}
              />

              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="relative z-10 border-b border-white/10 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={closeAsignaciones}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-200" />
                </button>

                <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/15">
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

                      <p className="mt-1 text-sm text-gray-400">
                        Gestioná acceso, rol, estado y sucursal principal.
                      </p>
                    </div>
                  </div>

                  <RolePill role={asignacionesUsuario?.rol_global} />
                </div>
              </div>

              <div className="relative z-10 max-h-[calc(90vh-120px)] overflow-y-auto p-5 sm:p-6">
                <form
                  onSubmit={saveAsignacion}
                  className="mb-5 rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.18)]"
                >
                  <div className="mb-4 flex flex-col gap-1">
                    <p className="text-sm font-black text-white">
                      Nueva asignación o edición rápida
                    </p>

                    <p className="text-xs leading-5 text-gray-400">
                      Seleccioná una sucursal existente, definí el rol operativo
                      y guardá los cambios.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-200">
                        Sucursal
                      </span>

                      <select
                        name="sucursal_id"
                        value={asignacionForm.sucursal_id}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-cyan-300/40"
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
                      <span className="mb-2 block text-sm font-bold text-gray-200">
                        Rol en sucursal
                      </span>

                      <select
                        name="rol_sucursal"
                        value={asignacionForm.rol_sucursal}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-cyan-300/40"
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
                      <span className="mb-2 block text-sm font-bold text-gray-200">
                        Estado asignación
                      </span>

                      <select
                        name="estado"
                        value={asignacionForm.estado}
                        onChange={handleAsignacionChange}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-cyan-300/40"
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

                    <label className="flex cursor-pointer select-none items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                      <input
                        type="checkbox"
                        name="es_principal"
                        checked={asignacionForm.es_principal}
                        onChange={handleAsignacionChange}
                        className="peer sr-only"
                      />

                      <span
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors duration-200 peer-checked:bg-emerald-500/70"
                        aria-hidden="true"
                      >
                        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
                      </span>

                      <span>
                        <span className="block text-sm font-bold text-gray-100">
                          Sucursal principal
                        </span>

                        <span className="block text-xs text-gray-500">
                          Marcar como acceso principal del usuario.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setAsignacionForm({
                          sucursal_id: '',
                          rol_sucursal: 'OPERARIO',
                          es_principal: false,
                          estado: 'ACTIVO'
                        })
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-gray-200 transition hover:bg-white/10"
                    >
                      Limpiar formulario
                    </button>

                    <button
                      type="submit"
                      className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.18)] transition hover:-translate-y-0.5 hover:brightness-110"
                    >
                      Guardar asignación
                    </button>
                  </div>
                </form>

                {!Array.isArray(asignacionesUsuario?.sucursales) ||
                asignacionesUsuario.sucursales.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-cyan-100">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-200">
                      Este usuario no tiene sucursales asignadas.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {asignacionesUsuario.sucursales.map((sucursal, index) => {
                      const pivot = getPivot(sucursal);

                      return (
                        <motion.article
                          key={sucursal.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(index * 0.03, 0.18)
                          }}
                          className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 transition hover:border-cyan-200/20 hover:bg-white/[0.08]"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-200/10">
                                <Building2 className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <h4 className="truncate text-base font-bold text-white">
                                  {sucursal.nombre}
                                </h4>

                                <p className="mt-1 text-sm text-gray-400">
                                  {sucursal.localidad || 'Sin localidad'} ·{' '}
                                  {sucursal.provincia || 'Sin provincia'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 ring-1 ring-cyan-200/10">
                                {formatRole(pivot?.rol_sucursal)}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                                  pivot?.estado === 'ACTIVO'
                                    ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/10'
                                    : 'bg-white/10 text-gray-300 ring-white/10'
                                }`}
                              >
                                {pivot?.estado || 'SIN_ESTADO'}
                              </span>

                              {pivot?.es_principal && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100 ring-1 ring-amber-200/10">
                                  <Crown className="h-3.5 w-3.5" />
                                  Principal
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2 sm:justify-end">
                              <button
                                type="button"
                                onClick={() => prefillAsignacion(sucursal)}
                                className="rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-bold text-gray-200 transition hover:bg-white/10"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteAsignacion(sucursal)}
                                className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-2.5 text-xs font-bold text-red-100 transition hover:bg-red-400/20"
                              >
                                Quitar
                              </button>
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
