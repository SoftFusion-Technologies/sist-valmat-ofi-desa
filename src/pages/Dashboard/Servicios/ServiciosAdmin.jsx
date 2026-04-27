// Benjamin Orellana - 25/04/2026 - Pantalla premium para administrar servicios dinámicos de VALMAT.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Star,
  Tags,
  Trash2,
  Video,
  X,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { serviciosAdminApi } from '../../../api/serviciosAdminApi';
import { useAuth } from '../../../Auth/AuthContext';
import ServicioMediaManager from './components/ServicioMediaManager';

const initialServicioForm = {
  slug: '',
  eyebrow: '',
  title: '',
  shortTitle: '',
  subtitle: '',
  badge: '',
  intent: '',
  description: '',
  detailTitle: '',
  detailIntro: '',
  salesText: '',
  includesTitle: '¿Qué incluye este servicio?',
  ctaLabel: 'Solicitar visita técnica',
  secondaryCtaLabel: 'Ver servicio completo',
  iconKey: 'HiSparkles',
  destacado: false,
  orden_visual: 1,
  estado: 'ACTIVO',
  mediaType: 'video',
  mediaSrc: '',
  mediaPoster: ''
};

const itemTypeOptions = [
  { value: 'FEATURE', label: 'Características' },
  { value: 'BENEFIT', label: 'Beneficios' },
  { value: 'PAIN_POINT', label: 'Dolores del cliente' },
  { value: 'PROCESS', label: 'Proceso' },
  { value: 'USE_CASE', label: 'Casos de uso' },
  { value: 'TRUST', label: 'Confianza' }
];

const mediaBloqueOptions = [
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'SHOWCASE', label: 'Showcase' },
  { value: 'REEL', label: 'Reel' },
  { value: 'POSTER', label: 'Poster' },
  { value: 'GALERIA', label: 'Galería' }
];

const mediaTipoOptions = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'IMAGEN', label: 'Imagen' }
];

const tabs = [
  { id: 'principal', label: 'Datos principales', icon: FileText },
  { id: 'perfil', label: 'Perfil de cliente', icon: Tags },
  { id: 'contenido', label: 'Contenido comercial', icon: Settings2 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'media', label: 'Media', icon: Video }
];

const cn = (...classes) => classes.filter(Boolean).join(' ');

const normalizeBool = (value) => {
  return value === true || value === 1 || value === '1' || value === 'true';
};

const getServicioItems = (servicio) => {
  if (Array.isArray(servicio?.items)) return servicio.items;

  const mapped = [];

  const pushGroup = (items, tipo) => {
    if (!Array.isArray(items)) return;

    items.forEach((item, index) => {
      mapped.push({
        ...item,
        tipo_item: item.tipo_item || item.tipo || tipo,
        orden_visual: item.orden_visual || index + 1
      });
    });
  };

  pushGroup(servicio?.features, 'FEATURE');
  pushGroup(servicio?.benefits, 'BENEFIT');
  pushGroup(servicio?.painPoints, 'PAIN_POINT');
  pushGroup(servicio?.process, 'PROCESS');
  pushGroup(servicio?.useCases, 'USE_CASE');
  pushGroup(servicio?.trustItems, 'TRUST');

  return mapped;
};

const getServicioFaq = (servicio) => {
  if (Array.isArray(servicio?.faq)) return servicio.faq;
  if (Array.isArray(servicio?.faqs)) return servicio.faqs;
  return [];
};

const getTiposVinculadosIds = (servicio) => {
  const tipos =
    servicio?.tipos_clientes ||
    servicio?.tiposClientes ||
    servicio?.tipos ||
    [];

  return tipos
    .map((tipo) =>
      Number(
        tipo?.id ||
          tipo?.tipo_cliente_id ||
          tipo?.servicio_tipo_cliente?.tipo_cliente_id
      )
    )
    .filter(Boolean);
};

const compactText = (value, fallback = 'Sin datos') => {
  if (!value) return fallback;
  return String(value);
};

const buildServicioPayload = (form) => ({
  slug: form.slug?.trim(),
  eyebrow: form.eyebrow?.trim(),
  title: form.title?.trim(),
  shortTitle: form.shortTitle?.trim(),
  subtitle: form.subtitle?.trim(),
  badge: form.badge?.trim(),
  intent: form.intent?.trim(),
  description: form.description?.trim(),
  detailTitle: form.detailTitle?.trim(),
  detailIntro: form.detailIntro?.trim(),
  salesText: form.salesText?.trim(),
  includesTitle: form.includesTitle?.trim(),
  ctaLabel: form.ctaLabel?.trim(),
  secondaryCtaLabel: form.secondaryCtaLabel?.trim(),
  iconKey: form.iconKey?.trim(),
  destacado: normalizeBool(form.destacado),
  orden_visual: Number(form.orden_visual || 1),
  estado: form.estado,
  mediaType: form.mediaType,
  mediaSrc: form.mediaSrc?.trim(),
  mediaPoster: form.mediaPoster?.trim()
});

export default function ServiciosAdmin() {
    const navigate = useNavigate();

  const { authToken } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [tiposClientes, setTiposClientes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    q: '',
    estado: 'TODOS',
    destacado: 'TODOS',
    tipoCliente: 'TODOS'
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const showToast = (type, message) => {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [serviciosData, tiposData] = await Promise.all([
        serviciosAdminApi.listarServicios(authToken),
        serviciosAdminApi.listarTiposClientes(authToken)
      ]);

      setServicios(Array.isArray(serviciosData) ? serviciosData : []);
      setTiposClientes(Array.isArray(tiposData) ? tiposData : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el módulo de servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredServicios = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return servicios
      .filter((servicio) => {
        const text = [
          servicio.title,
          servicio.shortTitle,
          servicio.slug,
          servicio.subtitle,
          servicio.badge,
          servicio.estado
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchQ = !q || text.includes(q);
        const matchEstado =
          filters.estado === 'TODOS' || servicio.estado === filters.estado;

        const matchDestacado =
          filters.destacado === 'TODOS' ||
          String(normalizeBool(servicio.destacado)) === filters.destacado;

        const tiposIds = getTiposVinculadosIds(servicio);
        const matchTipo =
          filters.tipoCliente === 'TODOS' ||
          tiposIds.includes(Number(filters.tipoCliente));

        return matchQ && matchEstado && matchDestacado && matchTipo;
      })
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  }, [servicios, filters]);

  const stats = useMemo(() => {
    const activos = servicios.filter((s) => s.estado === 'ACTIVO').length;
    const destacados = servicios.filter((s) =>
      normalizeBool(s.destacado)
    ).length;

    return {
      total: servicios.length,
      activos,
      destacados,
      inactivos: servicios.length - activos
    };
  }, [servicios]);

  const handleOpenCreate = () => {
    setSelectedServicio(null);
    setModalOpen(true);
  };

  const handleOpenEdit = async (servicio) => {
    try {
      setSaving(true);
      const detalle = await serviciosAdminApi.obtenerServicio(
        servicio.id,
        authToken
      );
      setSelectedServicio(detalle || servicio);
      setModalOpen(true);
    } catch (err) {
      setSelectedServicio(servicio);
      setModalOpen(true);
      showToast(
        'warning',
        'Se abrió con datos del listado. No se pudo obtener el detalle completo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteServicio = (servicio) => {
    setConfirmState({
      open: true,
      title: 'Eliminar servicio',
      message: `Vas a eliminar "${servicio.title}". Esta acción no debería usarse si el servicio ya está vinculado a contenido público.`,
      onConfirm: async () => {
        try {
          setSaving(true);
          await serviciosAdminApi.eliminarServicio(servicio.id, authToken);
          showToast('success', 'Servicio eliminado correctamente.');
          await loadData();
        } catch (err) {
          showToast('error', err.message || 'No se pudo eliminar el servicio.');
        } finally {
          setSaving(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleSavedFromModal = async (servicioActualizado) => {
    setSelectedServicio(servicioActualizado);
    await loadData();
  };

return (
  <main className="min-h-screen bg-[#eef6fb] text-slate-950 cuerpo">
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
                {/* Benjamin Orellana - 27/04/2026 - Botón de regreso para mantener consistencia visual con el header administrativo moderno. */}
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  aria-label="Volver al dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)]">
                    <Settings2 className="h-3.5 w-3.5" />
                    VALMAT Servicios
                  </div>

                  <h1 className="titulo mt-3 text-4xl uppercase leading-none tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                    Servicios
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                    Gestioná servicios, perfiles de clientes, contenido
                    comercial, preguntas frecuentes y media pública desde un
                    panel único.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn('h-4 w-4', loading && 'animate-spin')}
                  />
                  Actualizar
                </button>

                {/* Benjamin Orellana - 25/04/2026 - Acceso directo al administrador de perfiles/tipos de cliente desde Servicios. */}
                <Link
                  to="/dashboard/servicios/tipos-clientes"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-3 text-sm font-black text-[var(--color-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-100"
                >
                  <Tags className="h-4 w-4" />
                  Tipos de clientes
                </Link>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.28)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary)]"
                >
                  <Plus className="h-5 w-5" />
                  Nuevo servicio
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/85 p-4 shadow-[0_22px_70px_rgba(15,23,42,.08)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_34%)]" />

          <div className="relative">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Total" value={stats.total} />
              <StatCard label="Activos" value={stats.activos} tone="cyan" />
              <StatCard
                label="Destacados"
                value={stats.destacados}
                tone="amber"
              />
              <StatCard
                label="Inactivos"
                value={stats.inactivos}
                tone="slate"
              />
            </div>

            <ServiciosAdminFilters
              filters={filters}
              setFilters={setFilters}
              tiposClientes={tiposClientes}
            />

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-black">No se pudo cargar la información</p>
                  <p className="mt-1 text-red-600">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <ServiciosSkeleton />
            ) : filteredServicios.length === 0 ? (
              <EmptyState onCreate={handleOpenCreate} />
            ) : (
              <ServiciosAdminCards
                servicios={filteredServicios}
                tiposClientes={tiposClientes}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteServicio}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ServicioAdminModal
            open={modalOpen}
            servicio={selectedServicio}
            tiposClientes={tiposClientes}
            authToken={authToken}
            onClose={() => setModalOpen(false)}
            onSaved={handleSavedFromModal}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        state={confirmState}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        loading={saving}
      />

      <Toast toast={toast} />
    </section>
  </main>
);
}

function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'from-slate-950 to-slate-800 text-white',
    cyan: 'from-cyan-500 to-sky-600 text-white',
    amber: 'from-amber-400 to-orange-500 text-white',
    slate: 'from-slate-100 to-white text-slate-950 border border-slate-200'
  };

  return (
    <div
      className={cn('rounded-3xl bg-gradient-to-br p-4 shadow-sm', tones[tone])}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function ServiciosAdminFilters({ filters, setFilters, tiposClientes }) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Buscar por título, slug o descripción"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <SelectField
          value={filters.estado}
          onChange={(value) => update('estado', value)}
          options={[
            { value: 'TODOS', label: 'Todos los estados' },
            { value: 'ACTIVO', label: 'Activos' },
            { value: 'INACTIVO', label: 'Inactivos' }
          ]}
        />

        <SelectField
          value={filters.destacado}
          onChange={(value) => update('destacado', value)}
          options={[
            { value: 'TODOS', label: 'Todos' },
            { value: 'true', label: 'Destacados' },
            { value: 'false', label: 'No destacados' }
          ]}
        />

        <SelectField
          value={filters.tipoCliente}
          onChange={(value) => update('tipoCliente', value)}
          options={[
            { value: 'TODOS', label: 'Todos los perfiles' },
            ...tiposClientes.map((tipo) => ({
              value: String(tipo.id),
              label: tipo.nombre || tipo.codigo
            }))
          ]}
        />
      </div>
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ServiciosAdminCards({ servicios, tiposClientes, onEdit, onDelete }) {
  const tipoNameById = useMemo(() => {
    return tiposClientes.reduce((acc, tipo) => {
      acc[Number(tipo.id)] = tipo.nombre || tipo.codigo;
      return acc;
    }, {});
  }, [tiposClientes]);

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {servicios.map((servicio, index) => {
        const tiposIds = getTiposVinculadosIds(servicio);

        return (
          <motion.article
            key={servicio.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
          >
            <div className="grid gap-0 md:grid-cols-[210px_1fr]">
              <div className="relative min-h-[210px] overflow-hidden bg-slate-950">
                {servicio.mediaSrc ? (
                  servicio.mediaType === 'video' ||
                  servicio.mediaType === 'VIDEO' ? (
                    <video
                      src={servicio.mediaSrc}
                      poster={servicio.mediaPoster}
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={servicio.mediaSrc}
                      alt={servicio.title}
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="flex h-full min-h-[210px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_34%),linear-gradient(135deg,#020617,#0f172a)]">
                    <ImageIcon className="h-10 w-10 text-white/45" />
                  </div>
                )}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]',
                      servicio.estado === 'ACTIVO'
                        ? 'bg-emerald-400 text-emerald-950'
                        : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {servicio.estado || 'SIN ESTADO'}
                  </span>

                  {normalizeBool(servicio.destacado) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-950">
                      <Star className="h-3 w-3 fill-current" />
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex min-h-[210px] flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                      {compactText(servicio.eyebrow, 'Servicio')}
                    </p>
                    <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                      {compactText(servicio.title)}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      /servicios/{servicio.slug}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Orden
                    </p>
                    <p className="text-lg font-black text-slate-950">
                      {servicio.orden_visual || 1}
                    </p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                  {compactText(
                    servicio.subtitle || servicio.description,
                    'Sin descripción cargada.'
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tiposIds.length > 0 ? (
                    tiposIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700"
                      >
                        {tipoNameById[id] || `Tipo ${id}`}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                      Sin perfil vinculado
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(servicio)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-sm font-black text-cyan-700 transition hover:border-cyan-200 hover:bg-cyan-100"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(servicio)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:border-red-200 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function ServicioAdminModal({
  open,
  servicio,
  tiposClientes,
  authToken,
  onClose,
  onSaved,
  showToast
}) {
  const isEdit = Boolean(servicio?.id);

  const [activeTab, setActiveTab] = useState('principal');
  const [workingServicio, setWorkingServicio] = useState(servicio || null);
  const [form, setForm] = useState(initialServicioForm);
  const [saving, setSaving] = useState(false);

  // Benjamin Orellana - 25/04/2026 - Evita volver al primer tab luego de editar, eliminar o refrescar datos del mismo servicio.
  const lastOpenedServicioKeyRef = useRef(null);

  const canManageChildren = Boolean(workingServicio?.id);

  useEffect(() => {
    if (!open) return;

    const currentServicioKey = servicio?.id
      ? `servicio-${servicio.id}`
      : 'nuevo-servicio';

    const isDifferentServicio =
      lastOpenedServicioKeyRef.current !== currentServicioKey;

    if (isDifferentServicio) {
      lastOpenedServicioKeyRef.current = currentServicioKey;
      setActiveTab('principal');
    }

    if (servicio) {
      setWorkingServicio(servicio);
      setForm({
        ...initialServicioForm,
        ...servicio,
        destacado: normalizeBool(servicio.destacado),
        orden_visual: servicio.orden_visual || 1
      });
    } else {
      setWorkingServicio(null);
      setForm(initialServicioForm);
    }
  }, [open, servicio?.id]);

  const reloadServicio = async () => {
    if (!workingServicio?.id) return;

    const detalle = await serviciosAdminApi.obtenerServicio(
      workingServicio.id,
      authToken
    );

    setWorkingServicio(detalle);
    setForm((prev) => ({
      ...prev,
      ...detalle,
      destacado: normalizeBool(detalle.destacado),
      orden_visual: detalle.orden_visual || 1
    }));

    await onSaved(detalle);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGoToMedia = () => {
    if (!canManageChildren) {
      showToast(
        'warning',
        'Primero guardá el servicio. Después vas a poder cargar videos e imágenes.'
      );
      return;
    }

    setActiveTab('media');
  };

  const handleSavePrincipal = async () => {
    if (!form.title?.trim()) {
      showToast('error', 'El título es obligatorio.');
      return;
    }

    if (!form.slug?.trim()) {
      showToast('error', 'El slug es obligatorio.');
      return;
    }

    try {
      setSaving(true);

      const payload = buildServicioPayload(form);

      const saved =
        isEdit || workingServicio?.id
          ? await serviciosAdminApi.actualizarServicio(
              workingServicio.id,
              payload,
              authToken
            )
          : await serviciosAdminApi.crearServicio(payload, authToken);

      const finalServicio = saved?.id
        ? await serviciosAdminApi.obtenerServicio(saved.id, authToken)
        : saved;

      setWorkingServicio(finalServicio);
      await onSaved(finalServicio);

      showToast('success', 'Servicio guardado correctamente.');
    } catch (err) {
      showToast('error', err.message || 'No se pudo guardar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 px-2 py-3 backdrop-blur-md sm:items-center sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_100px_rgba(2,6,23,0.35)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              {workingServicio?.id ? 'Editar servicio' : 'Nuevo servicio'}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">
              {workingServicio?.title || 'Configuración del servicio'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const disabled = tab.id !== 'principal' && !canManageChildren;

              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition',
                    activeTab === tab.id
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                    disabled && 'cursor-not-allowed opacity-45'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'principal' && (
            <PrincipalTab
              form={form}
              updateForm={updateForm}
              onSave={handleSavePrincipal}
              saving={saving}
              onGoToMedia={handleGoToMedia}
            />
          )}

          {activeTab === 'perfil' && (
            <ServicioTiposClienteManager
              servicio={workingServicio}
              tiposClientes={tiposClientes}
              authToken={authToken}
              reloadServicio={reloadServicio}
              showToast={showToast}
            />
          )}

          {activeTab === 'contenido' && (
            <ServicioItemsManager
              servicio={workingServicio}
              authToken={authToken}
              reloadServicio={reloadServicio}
              showToast={showToast}
            />
          )}

          {activeTab === 'faq' && (
            <ServicioFaqManager
              servicio={workingServicio}
              authToken={authToken}
              reloadServicio={reloadServicio}
              showToast={showToast}
            />
          )}

          {activeTab === 'media' && (
            <ServicioMediaManager
              servicio={workingServicio}
              authToken={authToken}
              reloadServicio={reloadServicio}
              showToast={showToast}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrincipalTab({ form, updateForm, onSave, saving, onGoToMedia }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <FormSection
          title="Identidad pública"
          description="Datos principales usados en cards, detalle."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Título"
              value={form.title}
              onChange={(v) => updateForm('title', v)}
            />
            <Input
              label="Direccion (URL)"
              value={form.slug}
              onChange={(v) => updateForm('slug', v)}
            />
            <Input
              label="Título corto"
              value={form.shortTitle}
              onChange={(v) => updateForm('shortTitle', v)}
            />
            <Input
              label="Texto debajo del video"
              value={form.eyebrow}
              onChange={(v) => updateForm('eyebrow', v)}
            />
            <Input
              label="Badge"
              value={form.badge}
              onChange={(v) => updateForm('badge', v)}
            />
            {/* <Input
              label="Icono"
              value={form.iconKey}
              onChange={(v) => updateForm('iconKey', v)}
            /> */}
          </div>

          <Textarea
            label="Subtítulo"
            value={form.subtitle}
            onChange={(v) => updateForm('subtitle', v)}
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(v) => updateForm('description', v)}
          />
        </FormSection>

        <FormSection
          title="Detalle comercial"
          description="Textos usados dentro de la página individual del servicio."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Título de detalle"
              value={form.detailTitle}
              onChange={(v) => updateForm('detailTitle', v)}
            />
            <Input
              label="Título de includes"
              value={form.includesTitle}
              onChange={(v) => updateForm('includesTitle', v)}
            />
            <Input
              label="CTA principal"
              value={form.ctaLabel}
              onChange={(v) => updateForm('ctaLabel', v)}
            />
            <Input
              label="CTA secundario"
              value={form.secondaryCtaLabel}
              onChange={(v) => updateForm('secondaryCtaLabel', v)}
            />
          </div>

          <Textarea
            label="Intent"
            value={form.intent}
            onChange={(v) => updateForm('intent', v)}
          />
          <Textarea
            label="Intro detalle"
            value={form.detailIntro}
            onChange={(v) => updateForm('detailIntro', v)}
          />
          <Textarea
            label="Texto comercial"
            value={form.salesText}
            onChange={(v) => updateForm('salesText', v)}
          />
        </FormSection>

        <FormSection
          title="Videos e imágenes"
          description="Los archivos del servicio se cargan desde la pestaña Media con selección de archivos desde la computadora."
        >
          <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50 px-4 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-950">
                  Gestión de media centralizada
                </h4>

                <p className="mt-1 text-sm leading-6 text-cyan-900/75">
                  Para cargar video principal, showcase, reels, posters o
                  galería, usá la pestaña Media. Así evitamos escribir rutas
                  manuales y el cliente solo selecciona archivos.
                </p>
              </div>

              <button
                type="button"
                onClick={onGoToMedia}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-700"
              >
                <Video className="h-4 w-4" />
                Ir a Media
              </button>
            </div>
          </div>
        </FormSection>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Estado
          </p>

          <div className="mt-4 grid gap-3">
            <SelectInput
              label="Estado"
              value={form.estado}
              onChange={(v) => updateForm('estado', v)}
              options={[
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'INACTIVO', label: 'Inactivo' }
              ]}
            />

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span>
                <span className="block text-sm font-black text-slate-800">
                  Servicio destacado
                </span>
                <span className="block text-xs font-semibold text-slate-400">
                  Aparece priorizado en público.
                </span>
              </span>

              <input
                type="checkbox"
                checked={normalizeBool(form.destacado)}
                onChange={(e) => updateForm('destacado', e.target.checked)}
                className="h-5 w-5 accent-cyan-600"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
            Orden sugerido de carga
          </p>

          <div className="mt-4 grid gap-2.5">
            {[
              'Guardar datos principales',
              'Elegir perfil de cliente',
              'Cargar contenido comercial',
              'Agregar FAQ',
              'Subir videos e imágenes'
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-black text-cyan-700">
                  {index + 1}
                </span>

                <span className="text-sm font-bold text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_35px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar servicio
        </button>
      </aside>
    </div>
  );
}
function ServicioTiposClienteManager({
  servicio,
  tiposClientes,
  authToken,
  reloadServicio,
  showToast
}) {
  const [savingId, setSavingId] = useState(null);
  const linkedIds = getTiposVinculadosIds(servicio);

  const toggleTipo = async (tipo) => {
    try {
      setSavingId(tipo.id);

      if (linkedIds.includes(Number(tipo.id))) {
        await serviciosAdminApi.desvincularTipoCliente(
          servicio.id,
          tipo.id,
          authToken
        );
        showToast('success', 'Perfil desvinculado correctamente.');
      } else {
        await serviciosAdminApi.vincularTipoCliente(
          servicio.id,
          tipo.id,
          authToken
        );
        showToast('success', 'Perfil vinculado correctamente.');
      }

      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ManagerShell
      title="Perfiles de cliente"
      description="Definí para qué tipo de cliente debe mostrarse este servicio."
    >
      {/* Benjamin Orellana - 25/04/2026 - Acceso directo al ABM de tipos de clientes sin mezclar navegación dentro de las cards de vinculación. */}
      <div className="mb-5 rounded-[1.5rem] border border-cyan-100 bg-cyan-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-950">
              Gestión de tipos de clientes
            </h4>

            <p className="mt-1 text-sm leading-6 text-cyan-900/75">
              Desde acá solo vinculás este servicio a los perfiles existentes.
              Para crear, editar o eliminar perfiles, ingresá al administrador
              de tipos de clientes.
            </p>
          </div>

          <Link
            to="/dashboard/servicios/tipos-clientes"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-cyan-700"
          >
            <Tags className="h-4 w-4" />
            Gestionar tipos
          </Link>
        </div>
      </div>

      {tiposClientes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            Todavía no hay perfiles de cliente cargados.
          </p>

          <Link
            to="/dashboard/servicios/tipos-clientes"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4" />
            Crear primer tipo
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {tiposClientes.map((tipo) => {
            const active = linkedIds.includes(Number(tipo.id));
            const saving = savingId === tipo.id;

            return (
              <button
                key={tipo.id}
                type="button"
                onClick={() => toggleTipo(tipo)}
                disabled={saving}
                className={cn(
                  'rounded-[1.5rem] border p-4 text-left transition',
                  active
                    ? 'border-cyan-200 bg-cyan-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-cyan-100 hover:bg-slate-50',
                  saving && 'cursor-wait opacity-70'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {tipo.nombre || tipo.codigo}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {tipo.codigo}
                    </p>

                    {tipo.descripcion && (
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {tipo.descripcion}
                      </p>
                    )}
                  </div>

                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                  ) : active ? (
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                  <p className="text-xs font-bold text-slate-500">
                    {active
                      ? 'Este servicio se muestra para este perfil.'
                      : 'Click para vincular este perfil.'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </ManagerShell>
  );
}

// Benjamin Orellana - 25/04/2026 - Rediseña Contenido comercial para que cada tipo de item sea entendible según dónde se muestra en la web.
const commercialSections = [
  {
    type: "PAIN_POINT",
    label: "Problemas que resuelve",
    publicPlace: "Se muestra en la card: Problemas que resuelve",
    help:
      "Acá cargás los motivos por los cuales una persona contrataría este servicio.",
    example: "Falta de tiempo para limpieza profunda",
    tone: "bg-rose-50 border-rose-100 text-rose-700",
  },
  {
    type: "FEATURE",
    label: "Qué incluye",
    publicPlace: "Se muestra en la card: Qué incluye",
    help:
      "Acá cargás tareas concretas incluidas dentro del servicio.",
    example: "Limpieza general de ambientes",
    tone: "bg-cyan-50 border-cyan-100 text-cyan-700",
  },
  {
    type: "BENEFIT",
    label: "Beneficios",
    publicPlace: "Se muestra en la card: Beneficios",
    help:
      "Acá cargás el resultado positivo que obtiene el cliente después del servicio.",
    example: "Ambientes más agradables y cuidados",
    tone: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
  {
    type: "PROCESS",
    label: "Proceso de trabajo",
    publicPlace: "Se muestra en: Un proceso claro para evitar improvisaciones",
    help:
      "Acá cargás los pasos del servicio en orden. Usá textos cortos.",
    example: "Relevamiento del hogar",
    tone: "bg-sky-50 border-sky-100 text-sky-700",
  },
  {
    type: "USE_CASE",
    label: "Ideal para",
    publicPlace: "Se muestra en la card: Ideal para",
    help:
      "Acá cargás situaciones, lugares o tipos de cliente para los que aplica el servicio.",
    example: "Casas familiares",
    tone: "bg-violet-50 border-violet-100 text-violet-700",
  },
  {
    type: "TRUST",
    label: "Confianza / respaldo",
    publicPlace: "Uso opcional para argumentos de confianza",
    help:
      "Acá podés cargar frases de respaldo. Usalo solo si después querés mostrar un bloque de confianza.",
    example: "Equipo profesional y servicio planificado",
    tone: "bg-slate-50 border-slate-200 text-slate-700",
  },
];

const normalizeCommercialItem = (item = {}) => ({
  ...item,
  id: item.id,
  tipo_item: item.tipo_item || item.tipo || "FEATURE",
  titulo: item.titulo || item.title || "",
  descripcion: item.descripcion || item.description || "",
  orden_visual: Number(item.orden_visual || 1),
  estado: item.estado || "ACTIVO",
});

function ServicioItemsManager({
  servicio,
  authToken,
  reloadServicio,
  showToast
}) {
  const [drafts, setDrafts] = useState(() => {
    return commercialSections.reduce((acc, section) => {
      acc[section.type] = {
        titulo: '',
        descripcion: '',
        orden_visual: ''
      };

      return acc;
    }, {});
  });

  // Benjamin Orellana - 25/04/2026 - Muestra un bloque comercial por vez para simplificar la carga del cliente.
  const [activeCommercialType, setActiveCommercialType] = useState(
    commercialSections[0].type
  );

  const [savingType, setSavingType] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const items = useMemo(() => {
    return getServicioItems(servicio)
      .map(normalizeCommercialItem)
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  }, [servicio]);

  const groupedItems = useMemo(() => {
    return commercialSections.reduce((acc, section) => {
      acc[section.type] = items.filter(
        (item) => item.tipo_item === section.type || item.tipo === section.type
      );

      return acc;
    }, {});
  }, [items]);

  const selectedSection =
    commercialSections.find(
      (section) => section.type === activeCommercialType
    ) || commercialSections[0];

  const getNextOrder = (type) => {
    const group = groupedItems[type] || [];

    if (group.length === 0) return 1;

    return Math.max(...group.map((item) => Number(item.orden_visual || 0))) + 1;
  };

  const updateDraft = (type, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };

  const resetDraft = (type) => {
    setDrafts((prev) => ({
      ...prev,
      [type]: {
        titulo: '',
        descripcion: '',
        orden_visual: ''
      }
    }));
  };

  const createItem = async (section) => {
    const draft = drafts[section.type];

    if (!draft?.titulo?.trim()) {
      showToast('error', `Completá el texto visible de "${section.label}".`);
      return;
    }

    try {
      setSavingType(section.type);

      const ordenVisual = Number(
        draft.orden_visual || getNextOrder(section.type)
      );

      await serviciosAdminApi.crearItem(
        servicio.id,
        {
          tipo: section.type,
          tipo_item: section.type,
          titulo: draft.titulo.trim(),
          descripcion: draft.descripcion?.trim() || '',
          orden_visual: ordenVisual,
          estado: 'ACTIVO'
        },
        authToken
      );

      resetDraft(section.type);

      showToast('success', `Item agregado en "${section.label}".`);

      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo crear el item.');
    } finally {
      setSavingType('');
    }
  };

  const deleteItem = async (item) => {
    try {
      setDeletingId(item.id);

      await serviciosAdminApi.eliminarItem(item.id, authToken);

      showToast('success', 'Item eliminado correctamente.');

      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo eliminar el item.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ManagerShell
      title="Contenido comercial"
      description="Elegí un bloque y cargá los textos tal como se verán en la web pública."
    >
      <div className="mb-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h4 className="text-sm font-black text-slate-950">
              Cómo cargar esta sección
            </h4>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Primero elegí el bloque que querés editar. Cada bloque corresponde
              a una parte visible del detalle del servicio. Por ejemplo, lo que
              cargues en “Qué incluye” aparece en la card pública “Qué incluye”.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {commercialSections.map((section) => {
          const active = activeCommercialType === section.type;
          const total = groupedItems[section.type]?.length || 0;

          return (
            <button
              key={section.type}
              type="button"
              onClick={() => setActiveCommercialType(section.type)}
              className={cn(
                'rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5',
                active
                  ? 'border-cyan-200 bg-cyan-50 shadow-[0_18px_40px_rgba(8,145,178,0.10)]'
                  : 'border-slate-200 bg-white hover:border-cyan-100 hover:bg-slate-50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${section.tone}`}
                  >
                    {section.label}
                  </span>

                  <p className="mt-3 text-sm font-black text-slate-950">
                    {section.label}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                    {section.publicPlace}
                  </p>
                </div>

                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                    active
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {total}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <CommercialSectionCard
        section={selectedSection}
        items={groupedItems[selectedSection.type] || []}
        draft={drafts[selectedSection.type]}
        saving={savingType === selectedSection.type}
        deletingId={deletingId}
        nextOrder={getNextOrder(selectedSection.type)}
        onDraftChange={updateDraft}
        onCreate={() => createItem(selectedSection)}
        onDelete={deleteItem}
        authToken={authToken}
        reloadServicio={reloadServicio}
        showToast={showToast}
      />
    </ManagerShell>
  );
}

function CommercialSectionCard({
  section,
  items,
  draft,
  saving,
  deletingId,
  nextOrder,
  onDraftChange,
  onCreate,
  onDelete,
  authToken,
  reloadServicio,
  showToast,
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${section.tone}`}
            >
              {section.label}
            </span>

            <h4 className="mt-3 text-lg font-black tracking-[-0.03em] text-slate-950">
              {section.label}
            </h4>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {section.help}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left sm:max-w-[210px]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Dónde se ve
            </p>

            <p className="mt-1 text-xs font-bold leading-5 text-slate-600">
              {section.publicPlace}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Ejemplo
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {section.example}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Texto visible en la web
            </span>

            <input
              value={draft?.titulo || ""}
              onChange={(e) =>
                onDraftChange(section.type, "titulo", e.target.value)
              }
              placeholder={section.example}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Descripción opcional
            </span>

            <textarea
              value={draft?.descripcion || ""}
              onChange={(e) =>
                onDraftChange(section.type, "descripcion", e.target.value)
              }
              rows={2}
              placeholder="Uso interno o futuro texto extendido."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Orden
              </span>

              <input
                type="number"
                value={draft?.orden_visual || ""}
                onChange={(e) =>
                  onDraftChange(section.type, "orden_visual", e.target.value)
                }
                placeholder={String(nextOrder)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="button"
              onClick={onCreate}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar a {section.label}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-500">
                Todavía no hay items en este bloque.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <CommercialEditableItem
                key={item.id || `${section.type}-${index}`}
                item={item}
                section={section}
                authToken={authToken}
                reloadServicio={reloadServicio}
                showToast={showToast}
                onDelete={() => onDelete(item)}
                deleting={deletingId === item.id}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function CommercialEditableItem({
  item,
  section,
  authToken,
  reloadServicio,
  showToast,
  onDelete,
  deleting,
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [local, setLocal] = useState({
    titulo: item.titulo || "",
    descripcion: item.descripcion || "",
    orden_visual: item.orden_visual || 1,
  });

  const updateLocal = (key, value) => {
    setLocal((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    if (!local.titulo?.trim()) {
      showToast("error", "El texto visible es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      await serviciosAdminApi.actualizarItem(
        item.id,
        {
          tipo: section.type,
          tipo_item: section.type,
          titulo: local.titulo.trim(),
          descripcion: local.descripcion?.trim() || "",
          orden_visual: Number(local.orden_visual || 1),
          estado: item.estado || "ACTIVO",
        },
        authToken
      );

      showToast("success", "Item actualizado correctamente.");

      setEditing(false);

      await reloadServicio();
    } catch (err) {
      showToast("error", err.message || "No se pudo actualizar el item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      {editing ? (
        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Texto visible en la web
            </span>

            <input
              value={local.titulo}
              onChange={(e) => updateLocal("titulo", e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Descripción opcional
            </span>

            <textarea
              value={local.descripcion}
              onChange={(e) => updateLocal("descripcion", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Orden
              </span>

              <input
                type="number"
                value={local.orden_visual}
                onChange={(e) => updateLocal("orden_visual", e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-cyan-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${section.tone}`}>
                {section.label}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Orden {item.orden_visual}
              </span>
            </div>

            <p className="mt-2 text-sm font-black text-slate-900">
              {item.titulo}
            </p>

            {item.descripcion && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {item.descripcion}
              </p>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicioFaqManager({
  servicio,
  authToken,
  reloadServicio,
  showToast
}) {
  const [draft, setDraft] = useState({
    question: '',
    answer: '',
    orden_visual: 1
  });

  const [saving, setSaving] = useState(false);

  const faq = getServicioFaq(servicio).sort(
    (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
  );

  const createFaq = async () => {
    if (!draft.question.trim() || !draft.answer.trim()) {
      showToast('error', 'La pregunta y la respuesta son obligatorias.');
      return;
    }

    try {
      setSaving(true);

      await serviciosAdminApi.crearFaq(
        servicio.id,
        {
          ...draft,
          pregunta: draft.question,
          respuesta: draft.answer,
          orden_visual: Number(draft.orden_visual || 1)
        },
        authToken
      );

      setDraft({
        question: '',
        answer: '',
        orden_visual: faq.length + 2
      });

      showToast('success', 'FAQ creada correctamente.');
      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo crear la FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (item) => {
    try {
      setSaving(true);
      await serviciosAdminApi.eliminarFaq(item.id, authToken);
      showToast('success', 'FAQ eliminada correctamente.');
      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo eliminar la FAQ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ManagerShell
      title="Preguntas frecuentes"
      description="Cargá preguntas cortas para resolver dudas antes del contacto."
    >
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3">
            <Input
              label="Pregunta"
              value={draft.question}
              onChange={(v) => setDraft((prev) => ({ ...prev, question: v }))}
            />

            <Textarea
              label="Respuesta"
              value={draft.answer}
              onChange={(v) => setDraft((prev) => ({ ...prev, answer: v }))}
            />

            <Input
              label="Orden visual"
              type="number"
              value={draft.orden_visual}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, orden_visual: v }))
              }
            />

            <button
              type="button"
              onClick={createFaq}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar FAQ
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {faq.length === 0 ? (
            <MiniEmpty text="Todavía no hay preguntas frecuentes." />
          ) : (
            faq.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                authToken={authToken}
                reloadServicio={reloadServicio}
                showToast={showToast}
                onDelete={() => deleteFaq(item)}
              />
            ))
          )}
        </div>
      </div>
    </ManagerShell>
  );
}

function FaqRow({ item, authToken, reloadServicio, showToast, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({
    question: item.question || item.pregunta || '',
    answer: item.answer || item.respuesta || '',
    orden_visual: item.orden_visual || 1
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);

      await serviciosAdminApi.actualizarFaq(
        item.id,
        {
          ...local,
          pregunta: local.question,
          respuesta: local.answer,
          orden_visual: Number(local.orden_visual || 1)
        },
        authToken
      );

      showToast('success', 'FAQ actualizada.');
      setEditing(false);
      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo actualizar la FAQ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
      {editing ? (
        <div className="grid gap-3">
          <Input
            label="Pregunta"
            value={local.question}
            onChange={(v) => setLocal((prev) => ({ ...prev, question: v }))}
          />

          <Textarea
            label="Respuesta"
            value={local.answer}
            onChange={(v) => setLocal((prev) => ({ ...prev, answer: v }))}
          />

          <Input
            label="Orden"
            type="number"
            value={local.orden_visual}
            onChange={(v) => setLocal((prev) => ({ ...prev, orden_visual: v }))}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
              Orden {local.orden_visual}
            </span>
            <h4 className="mt-2 text-sm font-black text-slate-950">
              {local.question}
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {local.answer}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-2xl border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl border border-red-100 bg-red-50 p-2.5 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// function ServicioMediaManager({
//   servicio,
//   authToken,
//   reloadServicio,
//   showToast
// }) {
//   const [draft, setDraft] = useState({
//     bloque: 'SHOWCASE',
//     tipo_media: 'VIDEO',
//     title: '',
//     archivo_url: '',
//     poster_url: '',
//     post_url: '',
//     orden_visual: 1,
//     estado: 'ACTIVO'
//   });

//   const [saving, setSaving] = useState(false);

//   const media = getServicioMedia(servicio).sort(
//     (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
//   );

//   const createMedia = async () => {
//     if (!draft.archivo_url.trim()) {
//       showToast('error', 'La URL del archivo es obligatoria.');
//       return;
//     }

//     try {
//       setSaving(true);

//       await serviciosAdminApi.crearMedia(
//         servicio.id,
//         {
//           ...draft,
//           orden_visual: Number(draft.orden_visual || 1)
//         },
//         authToken
//       );

//       setDraft({
//         bloque: 'SHOWCASE',
//         tipo_media: 'VIDEO',
//         title: '',
//         archivo_url: '',
//         poster_url: '',
//         post_url: '',
//         orden_visual: media.length + 2,
//         estado: 'ACTIVO'
//       });

//       showToast('success', 'Media creada correctamente.');
//       await reloadServicio();
//     } catch (err) {
//       showToast('error', err.message || 'No se pudo crear la media.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const deleteMedia = async (item) => {
//     try {
//       setSaving(true);
//       await serviciosAdminApi.eliminarMedia(item.id, authToken);
//       showToast('success', 'Media eliminada correctamente.');
//       await reloadServicio();
//     } catch (err) {
//       showToast('error', err.message || 'No se pudo eliminar la media.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <ManagerShell
//       title="Media del servicio"
//       description="Cargá videos, posters, reels o imágenes usando rutas del frontend public."
//     >
//       <div className="grid gap-4 lg:grid-cols-[390px_1fr]">
//         <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
//           <div className="grid gap-3">
//             <div className="grid gap-3 sm:grid-cols-2">
//               <SelectInput
//                 label="Bloque"
//                 value={draft.bloque}
//                 onChange={(v) => setDraft((prev) => ({ ...prev, bloque: v }))}
//                 options={mediaBloqueOptions}
//               />

//               <SelectInput
//                 label="Tipo"
//                 value={draft.tipo_media}
//                 onChange={(v) =>
//                   setDraft((prev) => ({ ...prev, tipo_media: v }))
//                 }
//                 options={mediaTipoOptions}
//               />
//             </div>

//             <Input
//               label="Título"
//               value={draft.title}
//               onChange={(v) => setDraft((prev) => ({ ...prev, title: v }))}
//             />

//             <Input
//               label="Archivo URL"
//               value={draft.archivo_url}
//               onChange={(v) =>
//                 setDraft((prev) => ({ ...prev, archivo_url: v }))
//               }
//               placeholder="/videos/final-obra.mp4"
//             />

//             <Input
//               label="Poster URL"
//               value={draft.poster_url}
//               onChange={(v) => setDraft((prev) => ({ ...prev, poster_url: v }))}
//               placeholder="/videos/posters/final-obra.jpg"
//             />

//             <Input
//               label="Post URL"
//               value={draft.post_url}
//               onChange={(v) => setDraft((prev) => ({ ...prev, post_url: v }))}
//               placeholder="Link a Instagram o publicación"
//             />

//             <Input
//               label="Orden visual"
//               type="number"
//               value={draft.orden_visual}
//               onChange={(v) =>
//                 setDraft((prev) => ({ ...prev, orden_visual: v }))
//               }
//             />

//             <button
//               type="button"
//               onClick={createMedia}
//               disabled={saving}
//               className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:opacity-60"
//             >
//               {saving ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Plus className="h-4 w-4" />
//               )}
//               Agregar media
//             </button>
//           </div>
//         </div>

//         <div className="grid gap-3 md:grid-cols-2">
//           {media.length === 0 ? (
//             <div className="md:col-span-2">
//               <MiniEmpty text="Todavía no hay media adicional cargada." />
//             </div>
//           ) : (
//             media.map((item) => (
//               <MediaCard
//                 key={item.id}
//                 item={item}
//                 authToken={authToken}
//                 reloadServicio={reloadServicio}
//                 showToast={showToast}
//                 onDelete={() => deleteMedia(item)}
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </ManagerShell>
//   );
// }

function MediaCard({ item, authToken, reloadServicio, showToast, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({
    bloque: item.bloque || 'SHOWCASE',
    tipo_media: item.tipo_media || item.tipo || 'VIDEO',
    title: item.title || item.titulo || '',
    archivo_url: item.archivo_url || item.url || '',
    poster_url: item.poster_url || '',
    post_url: item.post_url || '',
    orden_visual: item.orden_visual || 1,
    estado: item.estado || 'ACTIVO'
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);

      await serviciosAdminApi.actualizarMedia(
        item.id,
        {
          ...local,
          orden_visual: Number(local.orden_visual || 1)
        },
        authToken
      );

      showToast('success', 'Media actualizada.');
      setEditing(false);
      await reloadServicio();
    } catch (err) {
      showToast('error', err.message || 'No se pudo actualizar la media.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="aspect-video bg-slate-950">
        {local.archivo_url ? (
          local.tipo_media === 'VIDEO' ? (
            <video
              src={local.archivo_url}
              poster={local.poster_url}
              className="h-full w-full object-cover"
              controls
              muted
              playsInline
            />
          ) : (
            <img
              src={local.archivo_url}
              alt={local.title}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white/35" />
          </div>
        )}
      </div>

      <div className="p-4">
        {editing ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectInput
                label="Bloque"
                value={local.bloque}
                onChange={(v) => setLocal((prev) => ({ ...prev, bloque: v }))}
                options={mediaBloqueOptions}
              />

              <SelectInput
                label="Tipo"
                value={local.tipo_media}
                onChange={(v) =>
                  setLocal((prev) => ({ ...prev, tipo_media: v }))
                }
                options={mediaTipoOptions}
              />
            </div>

            <Input
              label="Título"
              value={local.title}
              onChange={(v) => setLocal((prev) => ({ ...prev, title: v }))}
            />

            <Input
              label="Archivo URL"
              value={local.archivo_url}
              onChange={(v) =>
                setLocal((prev) => ({ ...prev, archivo_url: v }))
              }
            />

            <Input
              label="Poster URL"
              value={local.poster_url}
              onChange={(v) => setLocal((prev) => ({ ...prev, poster_url: v }))}
            />

            <Input
              label="Post URL"
              value={local.post_url}
              onChange={(v) => setLocal((prev) => ({ ...prev, post_url: v }))}
            />

            <Input
              label="Orden"
              type="number"
              value={local.orden_visual}
              onChange={(v) =>
                setLocal((prev) => ({ ...prev, orden_visual: v }))
              }
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                {local.bloque}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {local.tipo_media}
              </span>
            </div>

            <h4 className="mt-3 text-sm font-black text-slate-950">
              {local.title || 'Media sin título'}
            </h4>

            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-400">
              {local.archivo_url}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-2xl border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700"
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="rounded-2xl border border-red-100 bg-red-50 p-2.5 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function ManagerShell({ title, description, children }) {
  return (
    <section>
      <div className="mb-5 rounded-[1.5rem] border border-cyan-100 bg-cyan-50 px-4 py-4">
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-cyan-800/75">{description}</p>
      </div>

      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ServiciosSkeleton() {
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-[260px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
        <Video className="h-7 w-7 text-cyan-600" />
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-950">
        No hay servicios para mostrar
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Creá el primer servicio dinámico para empezar a reemplazar la data
        estática.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
      >
        <Plus className="h-4 w-4" />
        Crear servicio
      </button>
    </div>
  );
}

function MiniEmpty({ text }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-bold text-slate-500">{text}</p>
    </div>
  );
}

function ConfirmModal({ state, onClose, loading }) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(2,6,23,0.35)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">{state.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {state.message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={state.onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          className="fixed bottom-4 right-4 z-[120] w-[calc(100%-2rem)] max-w-sm rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                toast.type === 'success' && 'bg-emerald-50 text-emerald-600',
                toast.type === 'error' && 'bg-red-50 text-red-600',
                toast.type === 'warning' && 'bg-amber-50 text-amber-600',
                !['success', 'error', 'warning'].includes(toast.type) &&
                  'bg-cyan-50 text-cyan-600'
              )}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                {toast.type === 'error'
                  ? 'No se pudo completar'
                  : toast.type === 'warning'
                    ? 'Atención'
                    : 'Operación realizada'}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {toast.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
