// Benjamin Orellana - 25/04/2026 - Dashboard administrativo inicial premium para VALMAT usando datos reales del AuthContext.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CalendarIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7.5 3.5v3M16.5 3.5v3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v11.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V6.75A1.75 1.75 0 0 1 5.75 5Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4.5 9h15"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
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
  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-900 shadow-sm">
    {label}
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
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

  const metrics = [
    {
      title: 'Solicitudes web',
      value: 'Pendiente',
      detail: 'Próximo módulo operativo',
      tone: 'from-cyan-50 to-white'
    },
    {
      title: 'Órdenes de servicio',
      value: 'Planificado',
      detail: 'Control de ejecución técnica',
      tone: 'from-blue-50 to-white'
    },
    {
      title: 'Sucursales asignadas',
      value: sucursales.length,
      detail: activeBranch?.nombre || 'Sin sucursal activa',
      tone: 'from-slate-50 to-white'
    }
  ];

  const modules = [
    {
      title: 'Usuarios',
      description:
        'Gestión de accesos, roles globales y permisos administrativos.',
      label: 'US'
    },
    {
      title: 'Sucursales',
      description:
        'Administración de bases operativas y cobertura de servicio.',
      label: 'SU'
    },
    {
      title: 'Clientes',
      description:
        'Base comercial y operativa de clientes particulares y empresas.',
      label: 'CL'
    },
    {
      title: 'Servicios',
      description:
        'Catálogo de limpieza técnica, oficinas, final de obra y mantenimiento.',
      label: 'SV'
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

  const sidebarItems = [
    'Resumen',
    'Operación',
    'Clientes',
    'Servicios',
    'Administración'
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
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
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-sm font-black text-slate-950">
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
        {sidebarItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              index === 0
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
            }`}
          >
            <span>{item}</span>
            {index === 0 && (
              <span className="h-2 w-2 rounded-full bg-cyan-200" />
            )}
          </button>
        ))}
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
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[286px] border-r border-slate-200/80 bg-slate-50/85 backdrop-blur-xl lg:block">
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
                className="flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <LogoutIcon className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,.18)] sm:p-7 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(103,232,249,.24),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,.20),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#082f49_100%)]" />
            <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:42px_42px]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-50 backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,.85)]" />
                  Workspace operativo
                </div>

                <h2 className="text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  Bienvenido, {fullName}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Panel inicial para organizar la gestión administrativa,
                  comercial y operativa de VALMAT.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-50">
                    {formatRole(userData.rolGlobal)}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-50">
                    Estado: {userData.estado}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-50">
                    {activeBranch?.nombre || 'Sin sucursal activa'}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
                  Último acceso
                </p>

                <p className="mt-2 text-xl font-black text-white">
                  {formatDateTime(userData.ultimoLogin)}
                </p>

                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-cyan-100" />
                    <span className="truncate">{userData.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PanelIcon className="h-4 w-4 text-cyan-100" />
                    <span>{userData.telefono}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.title}
                className={`rounded-[28px] border border-white bg-gradient-to-br ${metric.tone} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70`}
              >
                <p className="text-sm font-semibold text-slate-500">
                  {metric.title}
                </p>
                <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_370px]">
            <div className="rounded-[32px] border border-white bg-white/85 p-4 shadow-sm backdrop-blur-xl sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                    Módulos
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.045em] text-slate-950">
                    Centro operativo
                  </h3>
                </div>

                <p className="max-w-md text-sm text-slate-500">
                  Estructura preparada para crecer con el sistema
                  administrativo.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {modules.map((module) => (
                  <button
                    key={module.title}
                    type="button"
                    className="group rounded-[26px] border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50"
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

                        <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          Próximamente
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <article className="rounded-[32px] border border-white bg-white/85 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                      Perfil
                    </p>
                    <h3 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">
                      Usuario autenticado
                    </h3>
                  </div>

                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {getInitials(fullName)}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Nombre completo', value: fullName },
                    {
                      label: 'Rol global',
                      value: formatRole(userData.rolGlobal)
                    },
                    { label: 'Email', value: userData.email },
                    { label: 'Teléfono', value: userData.telefono },
                    { label: 'Estado', value: userData.estado }
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

              <article className="rounded-[32px] border border-white bg-white/85 p-5 shadow-sm backdrop-blur-xl">
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

              <article className="rounded-[32px] border border-white bg-slate-950 p-5 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-cyan-100">
                    <CalendarIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/80">
                      Próximo paso
                    </p>
                    <h3 className="text-lg font-black tracking-[-0.035em]">
                      Activar módulos operativos
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  El layout ya queda preparado para conectar usuarios, clientes,
                  solicitudes web, órdenes de servicio y agenda.
                </p>
              </article>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
