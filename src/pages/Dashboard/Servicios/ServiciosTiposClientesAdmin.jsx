// Benjamin Orellana - 25/04/2026 - Pantalla premium para administrar tipos de clientes del módulo Servicios.

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Edit3,
  Eye,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X
} from 'lucide-react';

import { useAuth } from '../../../Auth/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const initialForm = {
  codigo: '',
  nombre: '',
  descripcion: '',
  orden_visual: 1,
  activo: true
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const normalizeBool = (value) => {
  return value === true || value === 1 || value === '1' || value === 'true';
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

const buildHeaders = (authToken, hasBody = true) => {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, authToken, hasBody = true } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: buildHeaders(authToken, hasBody),
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudo completar la operación.'
    );
  }

  return data;
};

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tiposClientes)) return data.tiposClientes;
  if (Array.isArray(data?.tipos_clientes)) return data.tipos_clientes;
  if (Array.isArray(data?.tipos)) return data.tipos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const normalizeTipoCliente = (tipo = {}) => ({
  id: tipo.id,
  codigo: tipo.codigo || '',
  nombre: tipo.nombre || '',
  descripcion: tipo.descripcion || '',
  orden_visual: Number(tipo.orden_visual || 0),
  activo: normalizeBool(tipo.activo),
  created_at: tipo.created_at,
  updated_at: tipo.updated_at
});

const buildQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.activo !== 'TODOS') {
    params.set('activo', filters.activo);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

const tiposClientesApi = {
  async listar(filters, authToken) {
    const data = await request(
      `/servicios-tipos-clientes${buildQuery(filters)}`,
      {
        authToken
      }
    );

    return getListFromResponse(data)
      .map(normalizeTipoCliente)
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  },

  async crear(payload, authToken) {
    const data = await request('/servicios-tipos-clientes', {
      method: 'POST',
      body: payload,
      authToken
    });

    return (
      data?.tipoCliente ||
      data?.tipo_cliente ||
      data?.tipo ||
      data?.data ||
      data
    );
  },

  async actualizar(id, payload, authToken) {
    const data = await request(`/servicios-tipos-clientes/${id}`, {
      method: 'PUT',
      body: payload,
      authToken
    });

    return (
      data?.tipoCliente ||
      data?.tipo_cliente ||
      data?.tipo ||
      data?.data ||
      data
    );
  },

  async eliminar(id, authToken) {
    return request(`/servicios-tipos-clientes/${id}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  }
};

export default function ServiciosTiposClientesAdmin() {
  const { authToken } = useAuth();

  const [tiposClientes, setTiposClientes] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    activo: 'TODOS'
  });

  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [modalState, setModalState] = useState({
    open: false,
    item: null
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    item: null
  });

  const showToast = (type, message) => {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const loadData = async (mode = 'initial') => {
    try {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setSoftLoading(true);
      }

      setError('');

      const data = await tiposClientesApi.listar(filters, authToken);

      setTiposClientes(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los tipos de clientes.');
    } finally {
      setLoading(false);
      setSoftLoading(false);
    }
  };

  useEffect(() => {
    loadData('initial');
  }, []);

  const stats = useMemo(() => {
    const activos = tiposClientes.filter((item) => item.activo).length;

    return {
      total: tiposClientes.length,
      activos,
      inactivos: tiposClientes.length - activos
    };
  }, [tiposClientes]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadData('soft');
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      activo: 'TODOS'
    });

    window.setTimeout(() => {
      loadData('soft');
    }, 0);
  };

  const openCreate = () => {
    setModalState({
      open: true,
      item: null
    });
  };

  const openEdit = (item) => {
    setModalState({
      open: true,
      item
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      item: null
    });
  };

  const askDelete = (item) => {
    setConfirmState({
      open: true,
      item
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      item: null
    });
  };

  const handleDelete = async () => {
    if (!confirmState.item?.id) return;

    try {
      setSaving(true);

      await tiposClientesApi.eliminar(confirmState.item.id, authToken);

      showToast('success', 'Tipo de cliente eliminado correctamente.');
      closeConfirm();
      await loadData('soft');
    } catch (err) {
      showToast(
        'error',
        err.message ||
          'No se pudo eliminar. Verificá que no esté vinculado a servicios.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaved = async () => {
    closeModal();
    await loadData('soft');
  };

  return (
    <section className="min-h-screen bg-[#f5f8fb] px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.20),transparent_32%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.10),transparent_34%)]" />

          <div className="relative p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  <Users className="h-3.5 w-3.5" />
                  VALMAT Servicios
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Tipos de clientes
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Administrá los perfiles usados para segmentar servicios:
                  particulares, empresas, obras y futuros perfiles.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => loadData('soft')}
                  disabled={loading || softLoading || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn(
                      'h-4 w-4',
                      (loading || softLoading) && 'animate-spin'
                    )}
                  />
                  Actualizar
                </button>

                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo perfil
                </button>
              </div>
            </header>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Total" value={stats.total} />
              <StatCard label="Activos" value={stats.activos} tone="cyan" />
              <StatCard
                label="Inactivos"
                value={stats.inactivos}
                tone="slate"
              />
            </div>

            <TiposClienteFilters
              filters={filters}
              updateFilter={updateFilter}
              onApply={applyFilters}
              onClear={clearFilters}
              loading={softLoading}
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
              <TiposClienteSkeleton />
            ) : tiposClientes.length === 0 ? (
              <EmptyState onCreate={openCreate} />
            ) : (
              <>
                <TiposClienteTable
                  tiposClientes={tiposClientes}
                  onEdit={openEdit}
                  onDelete={askDelete}
                />

                <TiposClienteCards
                  tiposClientes={tiposClientes}
                  onEdit={openEdit}
                  onDelete={askDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalState.open && (
          <TipoClienteModal
            item={modalState.item}
            authToken={authToken}
            onClose={closeModal}
            onSaved={handleSaved}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        open={confirmState.open}
        item={confirmState.item}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        loading={saving}
      />

      <Toast toast={toast} />
    </section>
  );
}

function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'from-slate-950 to-slate-800 text-white',
    cyan: 'from-cyan-500 to-sky-600 text-white',
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

function TiposClienteFilters({
  filters,
  updateFilter,
  onApply,
  onClear,
  loading
}) {
  return (
    <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.7fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onApply();
            }}
            placeholder="Buscar por código, nombre o descripción"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <select
          value={filters.activo}
          onChange={(event) => updateFilter('activo', event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        >
          <option value="TODOS">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
          Filtrar
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

function TiposClienteTable({ tiposClientes, onEdit, onDelete }) {
  return (
    <div className="mt-6 hidden overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <Th>Orden</Th>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Descripción</Th>
              <Th>Estado</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {tiposClientes.map((item) => (
              <tr key={item.id} className="transition hover:bg-cyan-50/40">
                <Td>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">
                    {item.orden_visual}
                  </span>
                </Td>

                <Td>
                  <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                    {item.codigo}
                  </span>
                </Td>

                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Users className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {item.nombre}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        ID {item.id}
                      </p>
                    </div>
                  </div>
                </Td>

                <Td>
                  <p className="max-w-md text-sm leading-6 text-slate-500">
                    {item.descripcion || 'Sin descripción cargada.'}
                  </p>
                </Td>

                <Td>
                  <EstadoBadge activo={item.activo} />
                </Td>

                <Td align="right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TiposClienteCards({ tiposClientes, onEdit, onDelete }) {
  return (
    <div className="mt-6 grid gap-4 lg:hidden">
      {tiposClientes.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: index * 0.04 }}
          className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700">
                {item.codigo}
              </span>

              <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-slate-950">
                {item.nombre}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Orden
              </p>
              <p className="text-lg font-black text-slate-950">
                {item.orden_visual}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {item.descripcion || 'Sin descripción cargada.'}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <EstadoBadge activo={item.activo} />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function TipoClienteModal({ item, authToken, onClose, onSaved, showToast }) {
  const isEdit = Boolean(item?.id);

  const [form, setForm] = useState(() => {
    if (!item) return initialForm;

    return {
      codigo: item.codigo || '',
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      orden_visual: Number(item.orden_visual || 1),
      activo: normalizeBool(item.activo)
    };
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === 'codigo' ? value.toUpperCase() : value
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: ''
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.codigo.trim()) {
      nextErrors.codigo = 'El código es obligatorio.';
    }

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio.';
    }

    if (Number.isNaN(Number(form.orden_visual))) {
      nextErrors.orden_visual = 'El orden debe ser numérico.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => ({
    codigo: form.codigo.trim().toUpperCase(),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion?.trim() || '',
    orden_visual: Number(form.orden_visual || 0),
    activo: Boolean(form.activo)
  });

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      if (isEdit) {
        await tiposClientesApi.actualizar(item.id, buildPayload(), authToken);
        showToast('success', 'Tipo de cliente actualizado correctamente.');
      } else {
        await tiposClientesApi.crear(buildPayload(), authToken);
        showToast('success', 'Tipo de cliente creado correctamente.');
      }

      await onSaved();
    } catch (err) {
      showToast(
        'error',
        err.message || 'No se pudo guardar el tipo de cliente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-md sm:items-center sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.24 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_100px_rgba(2,6,23,0.35)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              {isEdit ? 'Editar perfil' : 'Nuevo perfil'}
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">
              {isEdit ? item.nombre : 'Tipo de cliente'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <FormSection
                title="Datos del perfil"
                description="Estos datos se usan para segmentar servicios en la web pública y en el dashboard."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Código"
                    value={form.codigo}
                    onChange={(value) => updateForm('codigo', value)}
                    placeholder="PARTICULAR"
                    error={errors.codigo}
                  />

                  <Input
                    label="Nombre"
                    value={form.nombre}
                    onChange={(value) => updateForm('nombre', value)}
                    placeholder="Particular"
                    error={errors.nombre}
                  />

                  <Input
                    label="Orden visual"
                    type="number"
                    value={form.orden_visual}
                    onChange={(value) => updateForm('orden_visual', value)}
                    error={errors.orden_visual}
                  />
                </div>

                <Textarea
                  label="Descripción"
                  value={form.descripcion}
                  onChange={(value) => updateForm('descripcion', value)}
                  placeholder="Servicios orientados a hogares, viviendas y necesidades particulares."
                />

                <Toggle
                  label="Activo"
                  description="Si está inactivo, no debería usarse como filtro público."
                  checked={form.activo}
                  onChange={(value) => updateForm('activo', value)}
                />
              </FormSection>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                  Preview
                </p>

                <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                    <Users className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-xl font-black">
                    {form.nombre || 'Perfil'}
                  </h3>

                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">
                    {form.codigo || 'CODIGO'}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {form.descripcion || 'Descripción del perfil de cliente.'}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-cyan-100 bg-cyan-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />

                  <p className="text-sm leading-6 text-cyan-900/80">
                    El código se guarda en mayúsculas y se usa para filtrar
                    servicios públicos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_35px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? 'Guardar cambios' : 'Crear perfil'}
              </button>
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfirmDeleteModal({ open, item, onClose, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(2,6,23,0.35)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Eliminar tipo de cliente
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Vas a eliminar{' '}
              <span className="font-black text-slate-800">{item?.nombre}</span>.
              Si está vinculado a servicios, el backend puede rechazar la
              operación.
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
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({ activo }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em]',
        activo
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          activo ? 'bg-emerald-500' : 'bg-slate-400'
        )}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }) {
  return (
    <td
      className={cn(
        'px-4 py-4 align-middle',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </td>
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

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error = ''
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-4',
          error
            ? 'border-red-200 focus:border-red-300 focus:ring-red-100'
            : 'border-slate-200 focus:border-cyan-300 focus:ring-cyan-100'
        )}
      />

      {error && (
        <p className="mt-1.5 text-xs font-bold text-red-600">{error}</p>
      )}
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white">
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>

        {description && (
          <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-400">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-cyan-600"
      />
    </label>
  );
}

function TiposClienteSkeleton() {
  return (
    <div className="mt-6 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[112px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
        <Layers3 className="h-7 w-7 text-cyan-600" />
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-950">
        No hay tipos de clientes
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Creá perfiles para segmentar servicios por tipo de cliente.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
      >
        <Plus className="h-4 w-4" />
        Crear perfil
      </button>
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
