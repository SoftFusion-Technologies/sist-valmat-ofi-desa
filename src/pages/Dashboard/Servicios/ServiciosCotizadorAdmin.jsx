// Benjamin Orellana - 29/04/2026 - CRUD interno para administrar servicios, variantes y adicionales del cotizador Hogar VALMAT.

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiCheckBadge,
  HiChevronLeft,
  HiChevronRight,
  HiCog6Tooth,
  HiCurrencyDollar,
  HiDocumentText,
  HiEye,
  HiEyeSlash,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiSparkles,
  HiSquares2X2,
  HiTrash,
  HiXMark
} from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TABS = [
  {
    id: 'servicios',
    label: 'Servicios cotizables',
    description: 'Servicios visibles en el cotizador Hogar.'
  },
  {
    id: 'variantes',
    label: 'Variantes',
    description: 'Opciones asociadas a sillas, vehículos, infantiles y otros.'
  },
  {
    id: 'adicionales',
    label: 'Adicionales',
    description: 'Extras opcionales como manchas difíciles o secado rápido.'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  }
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const emptyServicioForm = {
  id: null,
  tipo_cliente_id: '',
  codigo: '',
  nombre: '',
  descripcion: '',
  orden_visual: 1,
  activo: 1
};

const emptyVarianteForm = {
  id: null,
  cotizador_servicio_id: '',
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  duracion_min: '',
  orden_visual: 1,
  activo: 1
};

const emptyAdicionalForm = {
  id: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  duracion_extra_min: '',
  aplica_por_unidad: 0,
  orden_visual: 1,
  activo: 1
};

const safeJson = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const normalizeCode = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replaceAll('-', '_')
    .replace(/\s+/g, '_');
};

const normalizeActivo = (value) => {
  return value === true || value === 1 || value === '1' || value === 'true'
    ? 1
    : 0;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};

const formatDuration = (minutes) => {
  const total = Number(minutes || 0);

  if (total <= 0) return '-';

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours <= 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;

  return `${hours} h ${mins} min`;
};

const getArrayFromResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.servicios)) return data.servicios;
  if (Array.isArray(data?.variantes)) return data.variantes;
  if (Array.isArray(data?.adicionales)) return data.adicionales;
  if (Array.isArray(data?.tiposClientes)) return data.tiposClientes;
  if (Array.isArray(data?.tipos_clientes)) return data.tipos_clientes;
  if (Array.isArray(data)) return data;

  return [];
};

const getTipoNombre = (tiposCliente = [], tipoClienteId) => {
  const tipo = tiposCliente.find((item) => {
    return Number(item.id) === Number(tipoClienteId);
  });

  return tipo?.nombre || '-';
};

const getServicioNombre = (servicios = [], servicioId) => {
  const servicio = servicios.find((item) => {
    return Number(item.id) === Number(servicioId);
  });

  return servicio?.nombre || '-';
};

function StatusBadge({ active }) {
  const isActive = normalizeActivo(active) === 1;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.12em] ${
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-500'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function KpiCard({ title, value, helper, icon: Icon }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute right-[-36px] top-[-36px] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.14)_0%,transparent_70%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-[0.8rem] font-semibold text-slate-500">
              {helper}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <Icon className="text-[1.45rem]" />
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function CotizadorModal({
  open,
  mode,
  tab,
  form,
  tiposCliente,
  servicios,
  onClose,
  onChange,
  onSubmit,
  submitting
}) {
  const isEdit = mode === 'edit';

  const titleMap = {
    servicios: isEdit
      ? 'Editar servicio cotizable'
      : 'Nuevo servicio cotizable',
    variantes: isEdit ? 'Editar variante' : 'Nueva variante',
    adicionales: isEdit ? 'Editar adicional' : 'Nuevo adicional'
  };

  const renderServicioFields = () => (
    <div className="grid gap-4">
      <Field label="Perfil de cliente">
        <select
          value={form.tipo_cliente_id}
          onChange={(event) => onChange('tipo_cliente_id', event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
        >
          <option value="">Seleccionar perfil</option>
          {tiposCliente.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre} ({tipo.codigo})
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código">
          <input
            value={form.codigo}
            onChange={(event) =>
              onChange('codigo', normalizeCode(event.target.value))
            }
            placeholder="SILLON"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Nombre">
          <input
            value={form.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Sillón"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          value={form.descripcion || ''}
          onChange={(event) => onChange('descripcion', event.target.value)}
          rows={3}
          placeholder="Descripción visible o interna del servicio cotizable."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Orden visual">
          <input
            type="number"
            value={form.orden_visual}
            onChange={(event) => onChange('orden_visual', event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Estado">
          <select
            value={form.activo}
            onChange={(event) => onChange('activo', Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </Field>
      </div>
    </div>
  );

  const renderVarianteFields = () => (
    <div className="grid gap-4">
      <Field label="Servicio cotizable">
        <select
          value={form.cotizador_servicio_id}
          onChange={(event) =>
            onChange('cotizador_servicio_id', event.target.value)
          }
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
        >
          <option value="">Seleccionar servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre} ({servicio.codigo})
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código">
          <input
            value={form.codigo}
            onChange={(event) =>
              onChange('codigo', normalizeCode(event.target.value))
            }
            placeholder="BASE_ESPALDAR"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Nombre">
          <input
            value={form.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Base + espaldar"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          value={form.descripcion || ''}
          onChange={(event) => onChange('descripcion', event.target.value)}
          rows={3}
          placeholder="Descripción de la variante."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio referencia">
          <input
            type="number"
            value={form.precio || ''}
            onChange={(event) => onChange('precio', event.target.value)}
            placeholder="10000"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Duración referencia">
          <input
            type="number"
            value={form.duracion_min || ''}
            onChange={(event) => onChange('duracion_min', event.target.value)}
            placeholder="15"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Orden visual">
          <input
            type="number"
            value={form.orden_visual}
            onChange={(event) => onChange('orden_visual', event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Estado">
          <select
            value={form.activo}
            onChange={(event) => onChange('activo', Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </Field>
      </div>
    </div>
  );

  const renderAdicionalFields = () => (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código">
          <input
            value={form.codigo}
            onChange={(event) =>
              onChange('codigo', normalizeCode(event.target.value))
            }
            placeholder="MANCHAS_DIFICILES"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Nombre">
          <input
            value={form.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Manchas difíciles"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          value={form.descripcion || ''}
          onChange={(event) => onChange('descripcion', event.target.value)}
          rows={3}
          placeholder="Descripción del adicional."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio">
          <input
            type="number"
            value={form.precio || ''}
            onChange={(event) => onChange('precio', event.target.value)}
            placeholder="15000"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Duración extra">
          <input
            type="number"
            value={form.duracion_extra_min || ''}
            onChange={(event) =>
              onChange('duracion_extra_min', event.target.value)
            }
            placeholder="15"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Aplica por unidad">
          <select
            value={form.aplica_por_unidad}
            onChange={(event) =>
              onChange('aplica_por_unidad', Number(event.target.value))
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          >
            <option value={0}>No</option>
            <option value={1}>Sí</option>
          </select>
        </Field>

        <Field label="Orden visual">
          <input
            type="number"
            value={form.orden_visual}
            onChange={(event) => onChange('orden_visual', event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          />
        </Field>

        <Field label="Estado">
          <select
            value={form.activo}
            onChange={(event) => onChange('activo', Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </Field>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_34px_100px_rgba(15,23,42,0.25)]"
          >
            <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-sky-600">
                    Cotizador Hogar
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {titleMap[tab]}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                >
                  <HiXMark />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-144px)] overflow-y-auto p-5">
              {tab === 'servicios' && renderServicioFields()}
              {tab === 'variantes' && renderVarianteFields()}
              {tab === 'adicionales' && renderAdicionalFields()}
            </div>

            <div className="sticky bottom-0 flex flex-col gap-2 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
              >
                {submitting
                  ? 'Guardando...'
                  : isEdit
                    ? 'Guardar cambios'
                    : 'Crear registro'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ tab, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
        active
          ? 'border-sky-200 bg-sky-50 text-sky-800 shadow-[0_14px_34px_rgba(14,165,233,0.10)]'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      <p className="text-sm font-black">{tab.label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 opacity-75">
        {tab.description}
      </p>
    </button>
  );
}

function ActionButton({
  icon: Icon,
  children,
  onClick,
  variant = 'default',
  disabled = false
}) {
  const styles = {
    default:
      'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-sky-700',
    primary: 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700',
    success:
      'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'border-red-100 bg-white text-red-600 hover:bg-red-50'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}
    >
      {Icon && <Icon className="text-[1rem]" />}
      {children}
    </button>
  );
}

function ServiciosCotizadorAdmin() {
  const [activeTab, setActiveTab] = useState('servicios');

  const [servicios, setServicios] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [adicionales, setAdicionales] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  const [servicioForm, setServicioForm] = useState(emptyServicioForm);
  const [varianteForm, setVarianteForm] = useState(emptyVarianteForm);
  const [adicionalForm, setAdicionalForm] = useState(emptyAdicionalForm);

  const activeForm =
    activeTab === 'servicios'
      ? servicioForm
      : activeTab === 'variantes'
        ? varianteForm
        : adicionalForm;

  const kpis = useMemo(() => {
    return {
      servicios: servicios.length,
      variantes: variantes.length,
      adicionales: adicionales.length,
      activos:
        servicios.filter((item) => normalizeActivo(item.activo) === 1).length +
        variantes.filter((item) => normalizeActivo(item.activo) === 1).length +
        adicionales.filter((item) => normalizeActivo(item.activo) === 1).length
    };
  }, [servicios, variantes, adicionales]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const source =
      activeTab === 'servicios'
        ? servicios
        : activeTab === 'variantes'
          ? variantes
          : adicionales;

    if (!normalizedSearch) return source;

    return source.filter((item) => {
      return [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.precio,
        item.orden_visual
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch)
        );
    });
  }, [activeTab, servicios, variantes, adicionales, search]);

  const loadTiposCliente = async () => {
    try {
      const response = await fetch(
        `${API_URL}/servicios-tipos-clientes?activo=true`
      );
      const data = await safeJson(response);
      setTiposCliente(getArrayFromResponse(data));
    } catch {
      setTiposCliente([]);
    }
  };

  const fetchList = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await safeJson(response);

    if (!response.ok || data?.ok === false) {
      throw new Error(
        data?.message || data?.error || `No se pudo cargar ${endpoint}.`
      );
    }

    return getArrayFromResponse(data);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [serviciosData, variantesData, adicionalesData] = await Promise.all(
        [
          fetchList('/servicios-cotizador/servicios?limit=100'),
          fetchList('/servicios-cotizador/variantes?limit=100'),
          fetchList('/servicios-cotizador/adicionales?limit=100')
        ]
      );

      setServicios(serviciosData);
      setVariantes(variantesData);
      setAdicionales(adicionalesData);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar el cotizador',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiposCliente();
    loadData();
  }, []);

  const getEndpointBase = () => {
    if (activeTab === 'servicios') return '/servicios-cotizador/servicios';
    if (activeTab === 'variantes') return '/servicios-cotizador/variantes';
    return '/servicios-cotizador/adicionales';
  };

  const getCurrentFormSetter = () => {
    if (activeTab === 'servicios') return setServicioForm;
    if (activeTab === 'variantes') return setVarianteForm;
    return setAdicionalForm;
  };

  const resetCurrentForm = () => {
    if (activeTab === 'servicios') {
      setServicioForm({
        ...emptyServicioForm,
        tipo_cliente_id:
          tiposCliente.find(
            (tipo) => normalizeCode(tipo.codigo) === 'PARTICULAR'
          )?.id || ''
      });
      return;
    }

    if (activeTab === 'variantes') {
      setVarianteForm({
        ...emptyVarianteForm,
        cotizador_servicio_id: servicios[0]?.id || ''
      });
      return;
    }

    setAdicionalForm(emptyAdicionalForm);
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetCurrentForm();
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setModalMode('edit');

    if (activeTab === 'servicios') {
      setServicioForm({
        ...emptyServicioForm,
        ...row,
        activo: normalizeActivo(row.activo)
      });
    }

    if (activeTab === 'variantes') {
      setVarianteForm({
        ...emptyVarianteForm,
        ...row,
        activo: normalizeActivo(row.activo)
      });
    }

    if (activeTab === 'adicionales') {
      setAdicionalForm({
        ...emptyAdicionalForm,
        ...row,
        activo: normalizeActivo(row.activo),
        aplica_por_unidad: normalizeActivo(row.aplica_por_unidad)
      });
    }

    setModalOpen(true);
  };

  const updateCurrentForm = (field, value) => {
    const setter = getCurrentFormSetter();

    setter((current) => ({
      ...current,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (activeTab === 'servicios') {
      if (!activeForm.tipo_cliente_id)
        return 'Seleccioná un perfil de cliente.';
      if (!activeForm.codigo?.trim()) return 'El código es obligatorio.';
      if (!activeForm.nombre?.trim()) return 'El nombre es obligatorio.';
    }

    if (activeTab === 'variantes') {
      if (!activeForm.cotizador_servicio_id)
        return 'Seleccioná un servicio cotizable.';
      if (!activeForm.codigo?.trim()) return 'El código es obligatorio.';
      if (!activeForm.nombre?.trim()) return 'El nombre es obligatorio.';
    }

    if (activeTab === 'adicionales') {
      if (!activeForm.codigo?.trim()) return 'El código es obligatorio.';
      if (!activeForm.nombre?.trim()) return 'El nombre es obligatorio.';
    }

    return '';
  };

  const normalizePayload = () => {
    const payload = { ...activeForm };

    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    payload.activo = normalizeActivo(payload.activo);
    payload.orden_visual = Number(payload.orden_visual || 0);

    if (activeTab === 'servicios') {
      payload.tipo_cliente_id = Number(payload.tipo_cliente_id);
    }

    if (activeTab === 'variantes') {
      payload.cotizador_servicio_id = Number(payload.cotizador_servicio_id);

      if (payload.precio === '') delete payload.precio;
      if (payload.duracion_min === '') delete payload.duracion_min;

      if (payload.precio !== undefined) payload.precio = Number(payload.precio);
      if (payload.duracion_min !== undefined) {
        payload.duracion_min = Number(payload.duracion_min);
      }
    }

    if (activeTab === 'adicionales') {
      payload.aplica_por_unidad = normalizeActivo(payload.aplica_por_unidad);

      if (payload.precio === '') delete payload.precio;
      if (payload.duracion_extra_min === '') delete payload.duracion_extra_min;

      if (payload.precio !== undefined) payload.precio = Number(payload.precio);
      if (payload.duracion_extra_min !== undefined) {
        payload.duracion_extra_min = Number(payload.duracion_extra_min);
      }
    }

    return payload;
  };

  const submitForm = async () => {
    const error = validateForm();

    if (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: error,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    try {
      setSubmitting(true);

      const endpoint = getEndpointBase();
      const isEdit = modalMode === 'edit';
      const url = isEdit
        ? `${API_URL}${endpoint}/${activeForm.id}`
        : `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(normalizePayload())
      });

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo guardar el registro.'
        );
      }

      setModalOpen(false);
      await loadData();

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Registro actualizado' : 'Registro creado',
        text: isEdit
          ? 'Los cambios fueron guardados correctamente.'
          : 'El registro fue creado correctamente.',
        confirmButtonColor: '#0284c7'
      });
    } catch (submitError) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: submitError.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivo = async (row) => {
    const nextActivo = normalizeActivo(row.activo) === 1 ? 0 : 1;

    try {
      const response = await fetch(
        `${API_URL}${getEndpointBase()}/${row.id}/activo`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            activo: nextActivo
          })
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo actualizar el estado.'
        );
      }

      await loadData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  const updateOrden = async (row, direction) => {
    const currentOrder = Number(row.orden_visual || 0);
    const nextOrder = Math.max(0, currentOrder + direction);

    try {
      const response = await fetch(
        `${API_URL}${getEndpointBase()}/${row.id}/orden`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orden_visual: nextOrder
          })
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo actualizar el orden.'
        );
      }

      await loadData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar el orden',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  const deleteRow = async (row) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar registro',
      text: `Esta acción eliminará físicamente "${row.nombre}".`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}${getEndpointBase()}/${row.id}`, {
        method: 'DELETE'
      });

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo eliminar el registro.'
        );
      }

      await loadData();

      Swal.fire({
        icon: 'success',
        title: 'Registro eliminado',
        text: 'El registro fue eliminado correctamente.',
        confirmButtonColor: '#0284c7'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="p-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="mb-3 h-16 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      );
    }

    if (filteredRows.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <HiCog6Tooth className="text-[2rem]" />
          </div>

          <h3 className="mt-4 text-xl font-black text-slate-950">
            Sin registros
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Creá o ajustá la configuración para que el cotizador público muestre
            las opciones disponibles.
          </p>
        </div>
      );
    }

    if (activeTab === 'servicios') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                <th className="px-4 py-4">Servicio</th>
                <th className="px-4 py-4">Código</th>
                <th className="px-4 py-4">Perfil</th>
                <th className="px-4 py-4">Orden</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition hover:bg-sky-50/40"
                >
                  <td className="px-4 py-4">
                    <p className="font-black text-slate-950">{row.nombre}</p>
                    <p className="mt-1 max-w-md truncate text-sm font-semibold text-slate-500">
                      {row.descripcion || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                      {row.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">
                    {getTipoNombre(tiposCliente, row.tipo_cliente_id)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        icon={HiChevronLeft}
                        onClick={() => updateOrden(row, -1)}
                      />
                      <span className="min-w-10 text-center font-black text-slate-950">
                        {row.orden_visual}
                      </span>
                      <ActionButton
                        icon={HiChevronRight}
                        onClick={() => updateOrden(row, 1)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={row.activo} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        icon={
                          normalizeActivo(row.activo) === 1 ? HiEyeSlash : HiEye
                        }
                        onClick={() => toggleActivo(row)}
                      />
                      <ActionButton
                        icon={HiPencilSquare}
                        onClick={() => openEditModal(row)}
                      />
                      <ActionButton
                        icon={HiTrash}
                        variant="danger"
                        onClick={() => deleteRow(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'variantes') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                <th className="px-4 py-4">Variante</th>
                <th className="px-4 py-4">Código</th>
                <th className="px-4 py-4">Servicio</th>
                <th className="px-4 py-4">Precio</th>
                <th className="px-4 py-4">Duración</th>
                <th className="px-4 py-4">Orden</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition hover:bg-sky-50/40"
                >
                  <td className="px-4 py-4">
                    <p className="font-black text-slate-950">{row.nombre}</p>
                    <p className="mt-1 max-w-md truncate text-sm font-semibold text-slate-500">
                      {row.descripcion || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                      {row.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">
                    {row.servicio_cotizador?.nombre ||
                      getServicioNombre(servicios, row.cotizador_servicio_id)}
                  </td>
                  <td className="px-4 py-4 font-black text-slate-950">
                    {formatMoney(row.precio)}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-600">
                    {formatDuration(row.duracion_min)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        icon={HiChevronLeft}
                        onClick={() => updateOrden(row, -1)}
                      />
                      <span className="min-w-10 text-center font-black text-slate-950">
                        {row.orden_visual}
                      </span>
                      <ActionButton
                        icon={HiChevronRight}
                        onClick={() => updateOrden(row, 1)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={row.activo} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        icon={
                          normalizeActivo(row.activo) === 1 ? HiEyeSlash : HiEye
                        }
                        onClick={() => toggleActivo(row)}
                      />
                      <ActionButton
                        icon={HiPencilSquare}
                        onClick={() => openEditModal(row)}
                      />
                      <ActionButton
                        icon={HiTrash}
                        variant="danger"
                        onClick={() => deleteRow(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
              <th className="px-4 py-4">Adicional</th>
              <th className="px-4 py-4">Código</th>
              <th className="px-4 py-4">Precio</th>
              <th className="px-4 py-4">Duración extra</th>
              <th className="px-4 py-4">Por unidad</th>
              <th className="px-4 py-4">Orden</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 transition hover:bg-sky-50/40"
              >
                <td className="px-4 py-4">
                  <p className="font-black text-slate-950">{row.nombre}</p>
                  <p className="mt-1 max-w-md truncate text-sm font-semibold text-slate-500">
                    {row.descripcion || 'Sin descripción'}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                    {row.codigo}
                  </span>
                </td>
                <td className="px-4 py-4 font-black text-slate-950">
                  {formatMoney(row.precio)}
                </td>
                <td className="px-4 py-4 font-bold text-slate-600">
                  {formatDuration(row.duracion_extra_min)}
                </td>
                <td className="px-4 py-4 font-bold text-slate-600">
                  {normalizeActivo(row.aplica_por_unidad) === 1 ? 'Sí' : 'No'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      icon={HiChevronLeft}
                      onClick={() => updateOrden(row, -1)}
                    />
                    <span className="min-w-10 text-center font-black text-slate-950">
                      {row.orden_visual}
                    </span>
                    <ActionButton
                      icon={HiChevronRight}
                      onClick={() => updateOrden(row, 1)}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge active={row.activo} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton
                      icon={
                        normalizeActivo(row.activo) === 1 ? HiEyeSlash : HiEye
                      }
                      onClick={() => toggleActivo(row)}
                    />
                    <ActionButton
                      icon={HiPencilSquare}
                      onClick={() => openEditModal(row)}
                    />
                    <ActionButton
                      icon={HiTrash}
                      variant="danger"
                      onClick={() => deleteRow(row)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <CotizadorModal
        open={modalOpen}
        mode={modalMode}
        tab={activeTab}
        form={activeForm}
        tiposCliente={tiposCliente}
        servicios={servicios}
        onClose={() => setModalOpen(false)}
        onChange={updateCurrentForm}
        onSubmit={submitForm}
        submitting={submitting}
      />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl"
      >
        <motion.header
          variants={fadeUp}
          className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#061827_0%,#08364a_48%,#0b6b78_100%)] p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.20)] sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-10%] top-[-30%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22)_0%,transparent_70%)] blur-2xl" />
            <div className="absolute bottom-[-40%] left-[10%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.16)_0%,transparent_70%)] blur-2xl" />
          </div>

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <HiCog6Tooth className="text-cyan-100" />
                <span className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-cyan-50">
                  Servicios VALMAT
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                Cotizador Hogar
              </h1>

              <p className="mt-4 max-w-2xl text-[0.95rem] font-medium leading-7 text-white/75">
                Administración de servicios cotizables, variantes y adicionales
                visibles en el cotizador público Hogar.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-black text-slate-950 backdrop-blur-xl transition hover:bg-cyan-50"
              >
                <HiPlus className="text-[1.1rem]" />
                Nuevo registro
              </button>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                <HiArrowPath
                  className={`text-[1.1rem] ${loading ? 'animate-spin' : ''}`}
                />
                Actualizar
              </button>
            </div>
          </div>
        </motion.header>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Servicios"
            value={kpis.servicios}
            helper="Catálogo cotizable"
            icon={HiSquares2X2}
          />
          <KpiCard
            title="Variantes"
            value={kpis.variantes}
            helper="Opciones por servicio"
            icon={HiAdjustmentsHorizontal}
          />
          <KpiCard
            title="Adicionales"
            value={kpis.adicionales}
            helper="Extras disponibles"
            icon={HiCurrencyDollar}
          />
          <KpiCard
            title="Activos"
            value={kpis.activos}
            helper="Visibles o disponibles"
            icon={HiCheckBadge}
          />
        </div>

        <motion.section
          variants={fadeUp}
          className="mt-5 rounded-[30px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={(tabId) => {
                  setActiveTab(tabId);
                  setSearch('');
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por código, nombre o descripción..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(2,132,199,0.20)] transition hover:bg-sky-700"
            >
              <HiPlus />
              Crear {TABS.find((tab) => tab.id === activeTab)?.label}
            </button>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                {TABS.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="text-sm font-semibold text-slate-400">
                {filteredRows.length} registros visibles
              </p>
            </div>

            <div className="hidden items-center gap-2 text-sm font-bold text-slate-400 sm:flex">
              <HiSparkles />
              Los precios complejos siguen definidos en backend.
            </div>
          </div>

          {renderTable()}
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 p-5"
        >
          <div className="flex items-start gap-3">
            <HiDocumentText className="mt-1 shrink-0 text-[1.4rem] text-amber-700" />
            <div>
              <h3 className="font-black text-amber-950">
                Importante sobre esta configuración
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-amber-800">
                Este módulo administra el catálogo visible del cotizador. Las
                reglas complejas de precios, promociones, mínimo operativo y
                agenda todavía se calculan desde backend. No cambies códigos
                como SILLON, SILLA, COLCHON o ALFOMBRA si ya están siendo usados
                por el motor de cálculo.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}

export default ServiciosCotizadorAdmin;
