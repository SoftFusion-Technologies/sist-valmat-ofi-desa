// Benjamin Orellana - 29/04/2026 - Bandeja interna para gestionar solicitudes web del módulo Servicios VALMAT.

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiCalendarDays,
  HiCheckBadge,
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiCurrencyDollar,
  HiEye,
  HiFunnel,
  HiMagnifyingGlass,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
  HiSparkles,
  HiTrash,
  HiUser,
  HiXMark,
  HiInformationCircle
} from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ESTADOS_SOLICITUD = [
  'NUEVA',
  'EN_REVISION',
  'APROBADA',
  'AJUSTADA',
  'PENDIENTE_PAGO',
  'CONFIRMADA',
  'RECHAZADA',
  'CANCELADA'
];

const ESTADO_LABELS = {
  NUEVA: 'Nueva',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  AJUSTADA: 'Ajustada',
  PENDIENTE_PAGO: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada'
};

const ESTADO_STYLES = {
  NUEVA: 'border-sky-200 bg-sky-50 text-sky-700',
  EN_REVISION: 'border-amber-200 bg-amber-50 text-amber-700',
  APROBADA: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  AJUSTADA: 'border-violet-200 bg-violet-50 text-violet-700',
  PENDIENTE_PAGO: 'border-orange-200 bg-orange-50 text-orange-700',
  CONFIRMADA: 'border-green-200 bg-green-50 text-green-700',
  RECHAZADA: 'border-red-200 bg-red-50 text-red-700',
  CANCELADA: 'border-slate-200 bg-slate-100 text-slate-600'
};

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

const safeJson = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const parseMetadata = (value) => {
  if (!value) return {};

  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return '-';

  return String(value).slice(0, 5);
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

const getEstadoLabel = (estado) => {
  return ESTADO_LABELS[estado] || estado || 'Sin estado';
};

const getEstadoStyle = (estado) => {
  return (
    ESTADO_STYLES[estado] || 'border-slate-200 bg-slate-100 text-slate-600'
  );
};

const getClienteNombre = (solicitud = {}) => {
  return (
    `${solicitud.nombre || ''} ${solicitud.apellido || ''}`.trim() ||
    'Sin nombre'
  );
};

const getTipoClienteNombre = (solicitud = {}) => {
  return (
    solicitud.tipo_cliente_nombre_snapshot ||
    solicitud.tipo_cliente_solicitud?.nombre ||
    solicitud.tipo_cliente?.nombre ||
    'Sin tipo'
  );
};

const getTipoClienteCodigo = (solicitud = {}) => {
  return (
    solicitud.tipo_cliente_codigo_snapshot ||
    solicitud.tipo_cliente_solicitud?.codigo ||
    solicitud.tipo_cliente?.codigo ||
    ''
  );
};

// Benjamin Orellana - 29/04/2026 - Evita errores cuando el detalle de solicitud todavía no está cargado.
const getSolicitudItems = (solicitud) => {
  if (!solicitud || typeof solicitud !== 'object') return [];

  return Array.isArray(solicitud.items_solicitud)
    ? solicitud.items_solicitud
    : Array.isArray(solicitud.items)
      ? solicitud.items
      : [];
};

// Benjamin Orellana - 29/04/2026 - Evita errores cuando las promociones todavía no están cargadas.
const getSolicitudPromociones = (solicitud) => {
  if (!solicitud || typeof solicitud !== 'object') return [];

  return Array.isArray(solicitud.promociones_solicitud)
    ? solicitud.promociones_solicitud
    : Array.isArray(solicitud.promociones)
      ? solicitud.promociones
      : [];
};

// Benjamin Orellana - 29/04/2026 - Evita errores cuando los turnos todavía no están cargados.
const getSolicitudTurnos = (solicitud) => {
  if (!solicitud || typeof solicitud !== 'object') return [];

  return Array.isArray(solicitud.turnos_solicitud)
    ? solicitud.turnos_solicitud
    : Array.isArray(solicitud.turnos)
      ? solicitud.turnos
      : [];
};

// Benjamin Orellana - 29/04/2026 - Lee historial desde el alias real del backend y conserva compatibilidad con nombres anteriores.
const getSolicitudHistorial = (solicitud) => {
  if (!solicitud || typeof solicitud !== 'object') return [];

  return Array.isArray(solicitud.historial_estados)
    ? solicitud.historial_estados
    : Array.isArray(solicitud.historial_estados_solicitud)
      ? solicitud.historial_estados_solicitud
      : Array.isArray(solicitud.historial)
        ? solicitud.historial
        : [];
};

const getWhatsAppLink = (telefono = '', solicitud = {}) => {
  const onlyNumbers = String(telefono || '').replace(/\D/g, '');

  if (!onlyNumbers) return '';

  const normalizedNumber = onlyNumbers.startsWith('54')
    ? onlyNumbers
    : `54${onlyNumbers}`;

  const text = encodeURIComponent(
    `Hola ${solicitud.nombre || ''}, somos VALMAT. Recibimos tu solicitud de servicio y queremos coordinar los próximos pasos.`
  );

  return `https://wa.me/${normalizedNumber}?text=${text}`;
};

// Benjamin Orellana - 29/04/2026 - Obtiene datos del mínimo operativo de forma segura aunque el detalle todavía no exista.
const getMinimoOperativoInfo = (solicitud) => {
  if (!solicitud || typeof solicitud !== 'object') {
    return {
      minimo_operativo: null,
      ajuste_minimo_operativo: 0,
      total_antes_minimo_operativo: null
    };
  }

  const metadata = parseMetadata(solicitud.metadata);

  return {
    minimo_operativo:
      metadata.minimo_operativo ||
      metadata.calculo_backend?.minimo_operativo?.minimo_operativo ||
      null,
    ajuste_minimo_operativo:
      metadata.ajuste_minimo_operativo ||
      metadata.calculo_backend?.minimo_operativo?.ajuste_minimo_operativo ||
      0,
    total_antes_minimo_operativo:
      metadata.total_antes_minimo_operativo ||
      metadata.calculo_backend?.minimo_operativo?.total_final ||
      null
  };
};

function EstadoBadge({ estado }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.12em] ${getEstadoStyle(
        estado
      )}`}
    >
      {getEstadoLabel(estado)}
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, helper }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute right-[-34px] top-[-34px] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.14)_0%,transparent_70%)]" />

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

function FilterInput({ icon: Icon, children }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] text-slate-400" />
      )}

      {children}
    </div>
  );
}

// Benjamin Orellana - 29/04/2026 - Botón reutilizable para acciones rápidas dentro del detalle de solicitudes.
function QuickActionButton({
  children,
  icon: Icon,
  onClick,
  variant = 'default',
  disabled = false
}) {
  const styles = {
    default:
      'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-sky-300 hover:text-sky-700',
    primary:
      'border-sky-600 bg-sky-600 text-white hover:bg-sky-700 hover:border-sky-700',
    success:
      'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700',
    warning: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
    danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {Icon && <Icon className="text-[1.1rem]" />}
      {children}
    </button>
  );
}

// Benjamin Orellana - 29/04/2026 - Guía visual para diferenciar acciones comerciales de acciones de agenda.
function SolicitudActionsGuide() {
  return (
    <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
          <HiInformationCircle className="text-[1.25rem]" />
        </div>

        <div>
          <h4 className="text-sm font-black text-sky-950">
            Guía rápida de gestión
          </h4>

          <div className="mt-2 grid gap-2 text-[0.82rem] font-semibold leading-5 text-slate-700">
            <p>
              <span className="font-black text-sky-900">Solicitud:</span>{' '}
              representa el pedido comercial del cliente. Primero se revisa,
              luego se aprueba y finalmente se confirma.
            </p>

            <p>
              <span className="font-black text-sky-900">Turno:</span> representa
              el horario en agenda. Confirmar turno solo asegura el día y
              horario elegido.
            </p>

            <p>
              <span className="font-black text-sky-900">Rechazar:</span> cierra
              la solicitud si no se va a avanzar. Eliminar borra el registro
              físicamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Benjamin Orellana - 29/04/2026 - Define permisos visuales de acciones según estado actual de solicitud y turno.
const getSolicitudActionPermissions = (solicitud = {}, turno = null) => {
  const estadoSolicitud = solicitud?.estado;
  const estadoTurno = turno?.estado;

  const solicitudCerrada = ['RECHAZADA', 'CANCELADA'].includes(estadoSolicitud);
  const solicitudConfirmada = estadoSolicitud === 'CONFIRMADA';
  const solicitudAprobada = estadoSolicitud === 'APROBADA';

  return {
    puedeContactar: Boolean(solicitud?.telefono),

    puedeMarcarRevision: ['NUEVA', 'RECHAZADA', 'CANCELADA'].includes(
      estadoSolicitud
    ),

    puedeAprobar: ['NUEVA', 'EN_REVISION', 'AJUSTADA'].includes(
      estadoSolicitud
    ),

    puedeConfirmarSolicitud: ['APROBADA', 'PENDIENTE_PAGO'].includes(
      estadoSolicitud
    ),

    puedeRechazar: ['NUEVA', 'EN_REVISION', 'APROBADA', 'AJUSTADA'].includes(
      estadoSolicitud
    ),

    puedeCancelarSolicitud: [
      'NUEVA',
      'EN_REVISION',
      'APROBADA',
      'CONFIRMADA'
    ].includes(estadoSolicitud),

    puedeConfirmarTurno:
      Boolean(turno?.id) &&
      !solicitudCerrada &&
      (solicitudAprobada || solicitudConfirmada) &&
      estadoTurno === 'PRE_RESERVADO',

    puedeCancelarTurno:
      Boolean(turno?.id) &&
      !solicitudCerrada &&
      ['PRE_RESERVADO', 'CONFIRMADO', 'BLOQUEADO'].includes(estadoTurno),

    puedeEliminar: true
  };
};

function SolicitudDetailDrawer({
  open,
  solicitud,
  loading,
  onClose,
  onEstadoChange,
  onDelete,
  onTurnoEstadoChange
}) {
  const items = getSolicitudItems(solicitud);
  const promociones = getSolicitudPromociones(solicitud);
  const turnos = getSolicitudTurnos(solicitud);
  const historial = getSolicitudHistorial(solicitud);
  const minimoInfo = getMinimoOperativoInfo(solicitud);
  const whatsappLink = getWhatsAppLink(solicitud?.telefono, solicitud);
  // Benjamin Orellana - 29/04/2026 - Obtiene el primer turno asociado para acciones rápidas del drawer.
  const turnoPrincipal = turnos[0] || null;

  // Benjamin Orellana - 29/04/2026 - Calcula qué acciones rápidas se habilitan según estado actual.
  const actionPermissions = getSolicitudActionPermissions(
    solicitud,
    turnoPrincipal
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 h-full w-full overflow-y-auto bg-[#f6f8fb] shadow-[0_0_90px_rgba(15,23,42,0.28)] sm:max-w-2xl"
          >
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-sky-600">
                    Solicitud #{solicitud?.id || '-'}
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                    {solicitud
                      ? getClienteNombre(solicitud)
                      : 'Cargando detalle'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <HiXMark className="text-[1.3rem]" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="mb-4 h-32 animate-pulse rounded-[26px] bg-white"
                  />
                ))}
              </div>
            ) : !solicitud ? (
              <div className="p-5">
                <div className="rounded-[26px] border border-red-100 bg-red-50 p-5 text-red-700">
                  No se pudo cargar la solicitud.
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <EstadoBadge estado={solicitud.estado} />

                    <select
                      value={solicitud.estado || ''}
                      onChange={(event) =>
                        onEstadoChange(solicitud.id, event.target.value)
                      }
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                    >
                      {ESTADOS_SOLICITUD.map((estado) => (
                        <option key={estado} value={estado}>
                          {getEstadoLabel(estado)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Cliente
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {getClienteNombre(solicitud)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {solicitud.email || 'Sin email'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Contacto
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {solicitud.telefono || '-'}
                      </p>
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white"
                        >
                          Contactar por WhatsApp
                        </a>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Dirección
                      </p>
                      <p className="mt-1 font-bold text-slate-800">
                        {solicitud.direccion || '-'}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {[solicitud.localidad, solicitud.provincia]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Tipo
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {getTipoClienteNombre(solicitud)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {getTipoClienteCodigo(solicitud) || '-'}
                      </p>
                    </div>
                  </div>

                  {solicitud.observaciones_cliente && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-sky-700">
                        Observaciones del cliente
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {solicitud.observaciones_cliente}
                      </p>
                    </div>
                  )}
                </section>

                {/* Benjamin Orellana - 29/04/2026 - Acciones rápidas separadas por gestión comercial y agenda para evitar confusión operativa. */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        Acciones rápidas
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Gestioná primero la solicitud comercial y luego el
                        horario de agenda.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <SolicitudActionsGuide />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-slate-400">
                      Gestión de la solicitud
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {whatsappLink && (
                        <QuickActionButton
                          icon={HiPhone}
                          variant="success"
                          disabled={!actionPermissions.puedeContactar}
                          onClick={() =>
                            window.open(
                              whatsappLink,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          Contactar por WhatsApp
                        </QuickActionButton>
                      )}

                      <QuickActionButton
                        icon={HiClock}
                        variant="warning"
                        disabled={!actionPermissions.puedeMarcarRevision}
                        onClick={() =>
                          onEstadoChange(solicitud.id, 'EN_REVISION')
                        }
                      >
                        Marcar en revisión
                      </QuickActionButton>

                      <QuickActionButton
                        icon={HiCheckBadge}
                        variant="primary"
                        disabled={!actionPermissions.puedeAprobar}
                        onClick={() => onEstadoChange(solicitud.id, 'APROBADA')}
                      >
                        Aprobar pedido
                      </QuickActionButton>

                      <QuickActionButton
                        icon={HiShieldCheck}
                        variant="success"
                        disabled={!actionPermissions.puedeConfirmarSolicitud}
                        onClick={() =>
                          onEstadoChange(solicitud.id, 'CONFIRMADA')
                        }
                      >
                        Cerrar como confirmado
                      </QuickActionButton>

                      <QuickActionButton
                        icon={HiXMark}
                        variant="danger"
                        disabled={!actionPermissions.puedeRechazar}
                        onClick={() =>
                          onEstadoChange(solicitud.id, 'RECHAZADA')
                        }
                      >
                        Rechazar solicitud
                      </QuickActionButton>

                      <QuickActionButton
                        icon={HiTrash}
                        variant="danger"
                        disabled={!actionPermissions.puedeEliminar}
                        onClick={() => onDelete(solicitud)}
                      >
                        Eliminar solicitud
                      </QuickActionButton>
                    </div>
                  </div>

                  {turnoPrincipal && (
                    <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-emerald-700">
                        Gestión del turno
                      </p>

                      <p className="mt-1 text-[0.82rem] font-semibold leading-5 text-emerald-800">
                        Estas acciones solo modifican el horario reservado en
                        agenda.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <QuickActionButton
                          icon={HiCalendarDays}
                          variant="success"
                          disabled={!actionPermissions.puedeConfirmarTurno}
                          onClick={() =>
                            onTurnoEstadoChange(turnoPrincipal, 'CONFIRMADO')
                          }
                        >
                          Confirmar horario
                        </QuickActionButton>

                        <QuickActionButton
                          icon={HiXMark}
                          variant="warning"
                          disabled={!actionPermissions.puedeCancelarTurno}
                          onClick={() =>
                            onTurnoEstadoChange(turnoPrincipal, 'CANCELADO')
                          }
                        >
                          Cancelar horario
                        </QuickActionButton>
                      </div>
                    </div>
                  )}
                                      </section>
                                      
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">
                    Resumen económico
                  </h3>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="font-bold text-slate-600">Subtotal</span>
                      <span className="font-black text-slate-950">
                        {formatMoney(solicitud.subtotal)}
                      </span>
                    </div>

                    {Number(solicitud.descuento_total || 0) > 0 && (
                      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                        <span className="font-bold text-emerald-700">
                          Descuentos
                        </span>
                        <span className="font-black text-emerald-700">
                          -{formatMoney(solicitud.descuento_total)}
                        </span>
                      </div>
                    )}

                    {Number(minimoInfo.ajuste_minimo_operativo || 0) > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-amber-800">
                            Ajuste mínimo operativo
                          </span>
                          <span className="font-black text-amber-700">
                            +{formatMoney(minimoInfo.ajuste_minimo_operativo)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-amber-700">
                          El servicio cuenta con un mínimo operativo de{' '}
                          {formatMoney(minimoInfo.minimo_operativo || 70000)}.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                      <span className="text-lg font-black">Total final</span>
                      <span className="text-2xl font-black">
                        {formatMoney(solicitud.total_estimado)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">
                    Ítems cotizados
                  </h3>

                  <div className="mt-4 divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                        No hay ítems registrados.
                      </p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-black text-slate-900">
                                {item.nombre_item}
                                {Number(item.cantidad || 1) > 1
                                  ? ` x${item.cantidad}`
                                  : ''}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {[
                                  item.variante,
                                  item.largo ? `${item.largo} m largo` : '',
                                  item.ancho ? `${item.ancho} m ancho` : '',
                                  item.m2 ? `${item.m2} m²` : ''
                                ]
                                  .filter(Boolean)
                                  .join(' · ') || item.codigo_item}
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-400">
                                Duración: {formatDuration(item.duracion_min)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-slate-950">
                                {formatMoney(item.subtotal)}
                              </p>
                              <p className="text-xs font-bold text-slate-400">
                                Unit. {formatMoney(item.precio_unitario)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {promociones.length > 0 && (
                  <section className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
                    <h3 className="text-lg font-black text-emerald-950">
                      Promociones aplicadas
                    </h3>

                    <div className="mt-4 space-y-3">
                      {promociones.map((promo) => (
                        <div
                          key={promo.id}
                          className="rounded-2xl border border-emerald-100 bg-white px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-black text-emerald-900">
                                {promo.nombre}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-emerald-700">
                                {promo.descripcion}
                              </p>
                            </div>

                            <span className="font-black text-emerald-700">
                              -{formatMoney(promo.monto_descuento)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">Turno</h3>

                  {turnos.length === 0 ? (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      No hay turno asociado.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {turnos.map((turno) => (
                        <div
                          key={turno.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-black text-slate-950">
                                {formatDate(turno.fecha)}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-600">
                                {formatTime(turno.hora_inicio)} a{' '}
                                {formatTime(turno.hora_fin)} ·{' '}
                                {formatDuration(turno.duracion_min)}
                              </p>
                            </div>

                            <EstadoBadge estado={turno.estado} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">
                    Historial
                  </h3>

                  <div className="mt-4 space-y-3">
                    {historial.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                        Sin movimientos de estado.
                      </p>
                    ) : (
                      historial.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-black text-slate-900">
                                {getEstadoLabel(item.estado_nuevo)}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {item.comentario || 'Cambio de estado'}
                              </p>
                            </div>

                            <span className="text-xs font-bold text-slate-400">
                              {formatDateTime(item.created_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SolicitudTableRow({ solicitud, onView, onDelete }) {
  const turnos = getSolicitudTurnos(solicitud);
  const turno = turnos[0];

  return (
    <tr className="border-b border-slate-100 transition hover:bg-sky-50/40">
      <td className="px-4 py-4">
        <div>
          <p className="font-black text-slate-950">#{solicitud.id}</p>
          <p className="text-xs font-bold text-slate-400">
            {formatDateTime(solicitud.created_at)}
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <div>
          <p className="font-black text-slate-950">
            {getClienteNombre(solicitud)}
          </p>
          <p className="text-sm font-semibold text-slate-500">
            {solicitud.telefono || '-'}
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <div>
          <p className="font-bold text-slate-800">
            {getTipoClienteNombre(solicitud)}
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {getTipoClienteCodigo(solicitud) || '-'}
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <EstadoBadge estado={solicitud.estado} />
      </td>

      <td className="px-4 py-4">
        <p className="font-black text-slate-950">
          {formatMoney(solicitud.total_estimado)}
        </p>
        <p className="text-xs font-bold text-slate-400">
          {formatDuration(solicitud.duracion_total_min)}
        </p>
      </td>

      <td className="px-4 py-4">
        {turno ? (
          <div>
            <p className="font-bold text-slate-800">
              {formatDate(turno.fecha)}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {formatTime(turno.hora_inicio)} a {formatTime(turno.hora_fin)}
            </p>
          </div>
        ) : solicitud.fecha_preferida ? (
          <div>
            <p className="font-bold text-slate-800">
              {formatDate(solicitud.fecha_preferida)}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {formatTime(solicitud.hora_preferida)}
            </p>
          </div>
        ) : (
          <span className="text-sm font-semibold text-slate-400">
            Sin turno
          </span>
        )}
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(solicitud.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-700 transition hover:bg-sky-50"
          >
            <HiEye className="text-[1.05rem]" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(solicitud)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
          >
            <HiTrash className="text-[1.05rem]" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function SolicitudMobileCard({ solicitud, onView, onDelete }) {
  const turnos = getSolicitudTurnos(solicitud);
  const turno = turnos[0];

  return (
    <motion.article
      variants={fadeUp}
      className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Solicitud #{solicitud.id}
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {getClienteNombre(solicitud)}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {solicitud.telefono || '-'}
          </p>
        </div>

        <EstadoBadge estado={solicitud.estado} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-slate-400">
            Total
          </p>
          <p className="mt-1 font-black text-slate-950">
            {formatMoney(solicitud.total_estimado)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-slate-400">
            Turno
          </p>
          <p className="mt-1 font-black text-slate-950">
            {turno
              ? formatTime(turno.hora_inicio)
              : formatTime(solicitud.hora_preferida)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onView(solicitud.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white"
        >
          <HiEye />
          Ver detalle
        </button>

        <button
          type="button"
          onClick={() => onDelete(solicitud)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600"
        >
          <HiTrash />
        </button>
      </div>
    </motion.article>
  );
}

function ServiciosSolicitudesAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_cliente_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    origen: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        params.set(key, String(value).trim());
      }
    });

    return params.toString();
  }, [filters, pagination.page, pagination.limit]);

  const kpis = useMemo(() => {
    const totalVisible = solicitudes.length;
    const nuevas = solicitudes.filter((item) => item.estado === 'NUEVA').length;
    const confirmadas = solicitudes.filter(
      (item) => item.estado === 'CONFIRMADA'
    ).length;
    const totalMonto = solicitudes.reduce(
      (acc, item) => acc + Number(item.total_estimado || 0),
      0
    );

    return {
      totalVisible,
      nuevas,
      confirmadas,
      totalMonto
    };
  }, [solicitudes]);

  const loadTiposCliente = async () => {
    try {
      const response = await fetch(
        `${API_URL}/servicios-tipos-clientes?activo=true`
      );
      const data = await safeJson(response);

      const tipos = Array.isArray(data?.tiposClientes)
        ? data.tiposClientes
        : Array.isArray(data?.tipos_clientes)
          ? data.tipos_clientes
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

      setTiposCliente(tipos);
    } catch {
      setTiposCliente([]);
    }
  };

  const loadSolicitudes = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/servicios-solicitudes?${queryParams}`
      );
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar las solicitudes.'
        );
      }

      setSolicitudes(Array.isArray(data.data) ? data.data : []);
      setPagination((current) => ({
        ...current,
        total: Number(data.total || 0),
        totalPages: Number(data.totalPages || 1)
      }));
    } catch (error) {
      setSolicitudes([]);

      Swal.fire({
        icon: 'error',
        title: 'No se pudieron cargar las solicitudes',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSolicitudDetail = async (id) => {
    try {
      setDrawerOpen(true);
      setLoadingDetail(true);
      setSelectedSolicitud(null);

      const response = await fetch(`${API_URL}/servicios-solicitudes/${id}`);
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudo cargar el detalle de la solicitud.'
        );
      }

      setSelectedSolicitud(data.data || null);
    } catch (error) {
      setSelectedSolicitud(null);

      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar el detalle',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));

    setPagination((current) => ({
      ...current,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      estado: '',
      tipo_cliente_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      origen: ''
    });

    setPagination((current) => ({
      ...current,
      page: 1
    }));
  };

  const handleEstadoChange = async (solicitudId, nuevoEstado) => {
    if (!solicitudId || !nuevoEstado) return;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Cambiar estado',
      text: `¿Querés cambiar la solicitud a "${getEstadoLabel(nuevoEstado)}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0284c7'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/servicios-solicitudes/${solicitudId}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            comentario: `Estado actualizado desde bandeja interna a ${getEstadoLabel(nuevoEstado)}.`
          })
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo actualizar el estado.'
        );
      }

      setSelectedSolicitud(data.data || null);
      await loadSolicitudes();

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'La solicitud fue actualizada correctamente.',
        confirmButtonColor: '#0284c7'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  // Benjamin Orellana - 29/04/2026 - Permite confirmar o cancelar el turno asociado desde el detalle de solicitud.
  const handleTurnoEstadoChange = async (turno, nuevoEstado) => {
    if (!turno?.id || !nuevoEstado) return;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Actualizar turno',
      text: `¿Querés cambiar el turno a "${nuevoEstado}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0284c7'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/servicios-turnos/${turno.id}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo actualizar el turno.'
        );
      }

      if (selectedSolicitud?.id) {
        await loadSolicitudDetail(selectedSolicitud.id);
      }

      await loadSolicitudes();

      Swal.fire({
        icon: 'success',
        title: 'Turno actualizado',
        text: 'El turno fue actualizado correctamente.',
        confirmButtonColor: '#0284c7'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar el turno',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  const handleDelete = async (solicitud) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar solicitud',
      text: `Esta acción eliminará físicamente la solicitud #${solicitud.id}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/servicios-solicitudes/${solicitud.id}`,
        {
          method: 'DELETE'
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo eliminar la solicitud.'
        );
      }

      await loadSolicitudes();

      if (selectedSolicitud?.id === solicitud.id) {
        setSelectedSolicitud(null);
        setDrawerOpen(false);
      }

      Swal.fire({
        icon: 'success',
        title: 'Solicitud eliminada',
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

  useEffect(() => {
    loadTiposCliente();
  }, []);

  useEffect(() => {
    loadSolicitudes();
  }, [queryParams]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <SolicitudDetailDrawer
        open={drawerOpen}
        solicitud={selectedSolicitud}
        loading={loadingDetail}
        onClose={() => setDrawerOpen(false)}
        onEstadoChange={handleEstadoChange}
        onDelete={handleDelete}
        onTurnoEstadoChange={handleTurnoEstadoChange}
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
                <HiSparkles className="text-cyan-100" />
                <span className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-cyan-50">
                  Servicios VALMAT
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                Solicitudes web
              </h1>

              <p className="mt-4 max-w-2xl text-[0.95rem] font-medium leading-7 text-white/75">
                Bandeja interna para gestionar solicitudes del cotizador Hogar,
                formularios comerciales, turnos pre-reservados y seguimiento de
                estados.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSolicitudes}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              <HiArrowPath
                className={`text-[1.1rem] ${loading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </button>
          </div>
        </motion.header>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Visibles"
            value={kpis.totalVisible}
            helper={`Total general: ${pagination.total}`}
            icon={HiAdjustmentsHorizontal}
          />
          <KpiCard
            title="Nuevas"
            value={kpis.nuevas}
            helper="Requieren revisión"
            icon={HiSparkles}
          />
          <KpiCard
            title="Confirmadas"
            value={kpis.confirmadas}
            helper="Turnos cerrados"
            icon={HiCheckBadge}
          />
          <KpiCard
            title="Monto visible"
            value={formatMoney(kpis.totalMonto)}
            helper="Según filtros actuales"
            icon={HiCurrencyDollar}
          />
        </div>

        <motion.section
          variants={fadeUp}
          className="mt-5 rounded-[30px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <HiFunnel className="text-[1.2rem]" />
              </div>

              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-900">
                  Filtros
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Búsqueda rápida y segmentación operativa
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <FilterInput icon={HiMagnifyingGlass}>
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Buscar cliente, teléfono, email..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none focus:border-sky-500 xl:col-span-2"
              />
            </FilterInput>

            <select
              value={filters.estado}
              onChange={(event) => updateFilter('estado', event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_SOLICITUD.map((estado) => (
                <option key={estado} value={estado}>
                  {getEstadoLabel(estado)}
                </option>
              ))}
            </select>

            <select
              value={filters.tipo_cliente_id}
              onChange={(event) =>
                updateFilter('tipo_cliente_id', event.target.value)
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="">Todos los tipos</option>
              {tiposCliente.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(event) =>
                updateFilter('fecha_desde', event.target.value)
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
            />

            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(event) =>
                updateFilter('fecha_hasta', event.target.value)
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
            />
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Bandeja de solicitudes
              </h2>
              <p className="text-sm font-semibold text-slate-400">
                Página {pagination.page} de {pagination.totalPages}
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1)
                  }))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <HiChevronLeft />
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.min(current.totalPages, current.page + 1)
                  }))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <HiChevronRight />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="mb-3 h-16 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <HiCalendarDays className="text-[2rem]" />
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                Sin solicitudes para estos filtros
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                Cuando ingresen solicitudes desde el cotizador o formularios
                públicos, se mostrarán en esta bandeja.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1080px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-4 py-4">Solicitud</th>
                      <th className="px-4 py-4">Cliente</th>
                      <th className="px-4 py-4">Tipo</th>
                      <th className="px-4 py-4">Estado</th>
                      <th className="px-4 py-4">Total</th>
                      <th className="px-4 py-4">Turno</th>
                      <th className="px-4 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <SolicitudTableRow
                        key={solicitud.id}
                        solicitud={solicitud}
                        onView={loadSolicitudDetail}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 xl:hidden">
                {solicitudes.map((solicitud) => (
                  <SolicitudMobileCard
                    key={solicitud.id}
                    solicitud={solicitud}
                    onView={loadSolicitudDetail}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-500">
              {pagination.total} registros encontrados
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1)
                  }))
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 disabled:opacity-40"
              >
                <HiChevronLeft />
                Anterior
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.min(current.totalPages, current.page + 1)
                  }))
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 disabled:opacity-40"
              >
                Siguiente
                <HiChevronRight />
              </button>
            </div>
          </div>
        </motion.section>
      </motion.section>
    </main>
  );
}

export default ServiciosSolicitudesAdmin;
