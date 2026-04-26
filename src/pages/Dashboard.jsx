// Benjamin Orellana - 25/04/2026 - Dashboard administrativo inicial premium para VALMAT usando datos reales del AuthContext.
// Benjamin Orellana - 25/04/2026 - Rediseño UX del dashboard: layout claro, sidebar con íconos, sin bloque de último acceso ni próximo paso.

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const PanelIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 5.75A1.75 1.75 0 0 1 5.75 4h4.5A1.75 1.75 0 0 1 12 5.75v4.5A1.75 1.75 0 0 1 10.25 12h-4.5A1.75 1.75 0 0 1 4 10.25v-4.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M14 5.75A1.75 1.75 0 0 1 15.75 4h2.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20h-2.5A1.75 1.75 0 0 1 14 18.25V5.75Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4 15.75A1.75 1.75 0 0 1 5.75 14h4.5A1.75 1.75 0 0 1 12 15.75v2.5A1.75 1.75 0 0 1 10.25 20h-4.5A1.75 1.75 0 0 1 4 18.25v-2.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);

const LogoutIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.75 7.75V6A2 2 0 0 0 12.75 4h-6A2 2 0 0 0 4.75 6v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1.75"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M10.75 12h8.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="m16.25 8.75 3.25 3.25-3.25 3.25"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 21V4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4 21h16M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const UserIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 12.25A4.25 4.25 0 1 0 12 3.75a4.25 4.25 0 0 0 0 8.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4.75 20.25c.85-3.4 3.38-5.25 7.25-5.25s6.4 1.85 7.25 5.25"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const HomeIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4.75 10.75 12 4.5l7.25 6.25"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 10.25v8A1.75 1.75 0 0 0 8 20h8a1.75 1.75 0 0 0 1.75-1.75v-8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M10 20v-5.25h4V20"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpacesIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 5.75A1.75 1.75 0 0 1 6.75 4h3.5A1.75 1.75 0 0 1 12 5.75v3.5A1.75 1.75 0 0 1 10.25 11h-3.5A1.75 1.75 0 0 1 5 9.25v-3.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M12 14.75A1.75 1.75 0 0 1 13.75 13h3.5A1.75 1.75 0 0 1 19 14.75v3.5A1.75 1.75 0 0 1 17.25 20h-3.5A1.75 1.75 0 0 1 12 18.25v-3.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M14 4h4v4M18 4l-5.25 5.25M10 20H6v-4M6 20l5.25-5.25"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ServiceIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.5 5.5 18.5 9.5M4.75 19.25l4.75-1 8.75-8.75a2.12 2.12 0 0 0-3-3L6.5 15.25l-1.75 4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.25 7.5 16.5 10.75"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const CertificateIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7.75 4h8.5A1.75 1.75 0 0 1 18 5.75v12.5A1.75 1.75 0 0 1 16.25 20h-8.5A1.75 1.75 0 0 1 6 18.25V5.75A1.75 1.75 0 0 1 7.75 4Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M9 8h6M9 11.5h6M9 15h3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const ReportIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 19V5M5 19h14"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M8.25 16v-4.5M12 16V8M15.75 16v-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const SettingsIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 14.75A2.75 2.75 0 1 0 12 9.25a2.75 2.75 0 0 0 0 5.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M18.4 13.35c.06-.44.06-.88 0-1.32l1.35-1.05-1.5-2.6-1.6.65a7.08 7.08 0 0 0-1.15-.66L15.25 6.7h-3l-.25 1.67c-.4.16-.79.38-1.15.66l-1.6-.65-1.5 2.6 1.35 1.05c-.06.44-.06.88 0 1.32L7.75 14.4l1.5 2.6 1.6-.65c.36.28.75.5 1.15.66l.25 1.67h3l.25-1.67c.4-.16.79-.38 1.15-.66l1.6.65 1.5-2.6-1.35-1.05Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatRole = (role) => {
  if (!role) return 'Sin rol asignado';

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

const getInitials = (name = '') => {
  const parts = String(name).trim().split(' ').filter(Boolean);

  if (!parts.length) return 'V';

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const ModuleGlyph = ({ label }) => (
  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-sm font-black text-cyan-800 shadow-sm">
    {label}
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const {
    logout,
    user,
    usuario,
    nombre,
    apellido,
    nombreCompleto,
    email,
    telefono,
    rolGlobal,
    estadoUsuario,
    sucursales = [],
    sucursalActiva,
    setSucursalActiva
  } = auth;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const usuarioAuth = user || usuario || {};

  const fullName = useMemo(() => {
    const fromContext = nombreCompleto?.trim();
    const fromSeparated = `${nombre || ''} ${apellido || ''}`.trim();
    const fromUser =
      `${usuarioAuth?.nombre || ''} ${usuarioAuth?.apellido || ''}`.trim();

    return fromContext || fromSeparated || fromUser || 'Usuario VALMAT';
  }, [nombreCompleto, nombre, apellido, usuarioAuth]);

  const activeBranch = useMemo(() => {
    if (sucursalActiva) return sucursalActiva;

    const principal = sucursales.find(
      (sucursal) => sucursal?.usuarios_sucursales?.es_principal
    );

    return principal || sucursales[0] || null;
  }, [sucursalActiva, sucursales]);

  const userData = {
    email: email || usuarioAuth?.email || 'Sin email',
    telefono: telefono || usuarioAuth?.telefono || 'Sin teléfono',
    rolGlobal: rolGlobal || usuarioAuth?.rol_global || 'SIN_ROL',
    estado: estadoUsuario || usuarioAuth?.estado || 'SIN_ESTADO',
    ultimoLogin: usuarioAuth?.ultimo_login || null
  };

  const modules = [
    {
      title: 'Usuarios',
      description:
        'Gestión de accesos, roles globales y permisos administrativos.',
      label: 'US',
      route: '/dashboard/usuarios'
    },
    {
      title: 'Sucursales',
      description:
        'Administración de bases operativas y cobertura de servicio.',
      label: 'SU',
      route: '/dashboard/sucursales'
    },
    {
      title: 'Servicios',
      description:
        'Catálogo de limpieza técnica, oficinas, final de obra y mantenimiento.',
      label: 'SV',
      route: '/dashboard/servicios'
    },
    {
      title: 'Clientes',
      description:
        'Base comercial y operativa de clientes particulares y empresas.',
      label: 'CL'
    },
    {
      title: 'Solicitudes web',
      description:
        'Recepción, clasificación y seguimiento de consultas del sitio.',
      label: 'SW'
    },
    {
      title: 'Órdenes de servicio',
      description:
        'Planificación, asignación y control de trabajos operativos.',
      label: 'OS'
    },
    {
      title: 'Presupuestos',
      description: 'Emisión y seguimiento de propuestas comerciales.',
      label: 'PR'
    },
    {
      title: 'Agenda operativa',
      description:
        'Calendario de equipos, visitas, servicios y tareas programadas.',
      label: 'AG'
    }
  ];

  // Benjamin Orellana - 25/04/2026 - Sidebar con íconos visuales para mejorar lectura y navegación.
  const sidebarItems = [
    {
      title: 'Inicio',
      route: '/dashboard',
      icon: HomeIcon
    },
    {
      title: 'Espacios',
      route: '/dashboard/sucursales',
      icon: SpacesIcon
    },
    {
      title: 'Servicios',
      route: '/dashboard/servicios',
      icon: ServiceIcon
    },
    {
      title: 'Certificados',
      route: '',
      icon: CertificateIcon
    },
    {
      title: 'Reportes',
      route: '',
      icon: ReportIcon
    },
    {
      title: 'Usuarios',
      route: '/dashboard/usuarios',
      icon: UserIcon
    },
    {
      title: 'Configuración',
      route: '',
      icon: SettingsIcon
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSucursalChange = (event) => {
    const selected = sucursales.find(
      (sucursal) => String(sucursal.id) === String(event.target.value)
    );

    if (selected && typeof setSucursalActiva === 'function') {
      setSucursalActiva(selected);
    }
  };

  const handleSidebarNavigate = (item) => {
    if (!item.route) return;

    navigate(item.route);
    setSidebarOpen(false);
  };

  const isSidebarItemActive = (item) => {
    if (!item.route) return false;

    if (item.route === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    return location.pathname.startsWith(item.route);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/20">
          <span className="text-base font-black tracking-tight">V</span>
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.26em] text-slate-950">
            VALMAT
          </p>
          <p className="text-xs font-medium text-slate-500">Admin workspace</p>
        </div>
      </div>

      <div className="mx-5 mb-5 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-sm font-black text-cyan-800">
            {getInitials(fullName)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">
              {fullName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {formatRole(userData.rolGlobal)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isSidebarItemActive(item);

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => handleSidebarNavigate(item)}
              disabled={!item.route}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/15'
                  : item.route
                    ? 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
                    : 'cursor-not-allowed text-slate-400 opacity-70'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </span>

              {active && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-100" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogoutIcon className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#eef6fb] text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[286px] border-r border-slate-200/80 bg-slate-50/90 backdrop-blur-xl lg:block">
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          />

          <aside className="absolute inset-y-0 left-0 w-[86%] max-w-[330px] border-r border-slate-200 bg-slate-50 shadow-2xl">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm"
                aria-label="Cerrar menú"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent />
          </aside>
        </div>
      )}

      <section className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-[#eef6fb]/78 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-800 shadow-sm lg:hidden"
                aria-label="Abrir menú"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                  Panel administrativo
                </p>
                <h1 className="text-lg font-black tracking-[-0.035em] text-slate-950 sm:text-2xl">
                  Dashboard VALMAT
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {sucursales.length > 0 && (
                <select
                  value={activeBranch?.id || ''}
                  onChange={handleSucursalChange}
                  className="h-11 max-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 items-center gap-2 rounded-2xl bg-cyan-600 px-4 text-sm font-bold text-white shadow-lg shadow-cyan-600/15 transition hover:-translate-y-0.5 hover:bg-cyan-700"
              >
                <LogoutIcon className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[34px] border border-white bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,.08)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="relative">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                    <PanelIcon className="h-3.5 w-3.5" />
                    Panel central
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-5xl">
                    Bienvenido, {fullName}
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Gestión administrativa, comercial y operativa de VALMAT en
                    un entorno claro, rápido y preparado para escalar.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                  <InfoPill
                    label="Rol"
                    value={formatRole(userData.rolGlobal)}
                  />
                  <InfoPill label="Estado" value={userData.estado} />
                  <InfoPill
                    label="Sucursal"
                    value={activeBranch?.nombre || 'Sin sucursal'}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  Último acceso: {formatDateTime(userData.ultimoLogin)}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  {userData.email}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  {userData.telefono}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="rounded-[32px] border border-white bg-white/90 p-4 shadow-sm backdrop-blur-xl sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                    Módulos
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.045em] text-slate-950">
                    Centro operativo
                  </h3>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => (
                  <button
                    key={module.title}
                    type="button"
                    onClick={() => {
                      if (module.route) {
                        navigate(module.route);
                      }
                    }}
                    className={`group rounded-[26px] border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50 ${
                      module.route ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <ModuleGlyph label={module.label} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-black tracking-[-0.025em] text-slate-950">
                            {module.title}
                          </h4>

                          <ArrowIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
                        </div>

                        <p className="mt-2 text-sm leading-5 text-slate-500">
                          {module.description}
                        </p>
                        <span
                          className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            module.route
                              ? 'bg-cyan-50 text-cyan-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {module.route ? 'Disponible' : 'Próximamente'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <article className="rounded-[32px] border border-white bg-white/90 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                      Perfil
                    </p>
                    <h3 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">
                      Usuario autenticado
                    </h3>
                  </div>

                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-sm font-black text-cyan-800">
                    {getInitials(fullName)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Nombre completo', value: fullName },
                    {
                      label: 'Rol global',
                      value: formatRole(userData.rolGlobal)
                    },
                    { label: 'Email', value: userData.email },
                    { label: 'Teléfono', value: userData.telefono },
                    { label: 'Estado', value: userData.estado },
                    {
                      label: 'Último acceso',
                      value: formatDateTime(userData.ultimoLogin)
                    }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-xs font-semibold text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[32px] border border-white bg-white/90 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <BuildingIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                      Sucursal activa
                    </p>
                    <h3 className="text-lg font-black tracking-[-0.035em] text-slate-950">
                      {activeBranch?.nombre || 'Sin asignación'}
                    </h3>
                  </div>
                </div>

                {activeBranch && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-bold text-slate-900">
                      {activeBranch.descripcion || 'Base operativa VALMAT'}
                    </p>
                    <p className="mt-1">
                      {activeBranch.direccion || 'Sin dirección registrada'}
                    </p>
                    <p>
                      {activeBranch.localidad || 'Sin localidad'} ·{' '}
                      {activeBranch.provincia || 'Sin provincia'}
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {sucursales.length > 0 ? (
                    sucursales.map((sucursal) => (
                      <button
                        key={sucursal.id}
                        type="button"
                        onClick={() =>
                          typeof setSucursalActiva === 'function' &&
                          setSucursalActiva(sucursal)
                        }
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          String(activeBranch?.id) === String(sucursal.id)
                            ? 'border-cyan-200 bg-cyan-50'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950">
                              {sucursal.nombre}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {sucursal?.usuarios_sucursales?.rol_sucursal ||
                                'Rol no asignado'}
                            </p>
                          </div>

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              String(activeBranch?.id) === String(sucursal.id)
                                ? 'bg-cyan-500'
                                : 'bg-slate-300'
                            }`}
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                      Este usuario no tiene sucursales asignadas.
                    </div>
                  )}
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
