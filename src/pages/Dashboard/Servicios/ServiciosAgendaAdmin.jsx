// Benjamin Orellana - 29/04/2026 - Agenda operativa interna para gestionar turnos, bloqueos y servicios programados de VALMAT.

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  HiArrowPath,
  HiCalendarDays,
  HiCheckBadge,
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiEye,
  HiFunnel,
  HiMagnifyingGlass,
  HiMapPin,
  HiNoSymbol,
  HiPhone,
  HiPlus,
  HiShieldCheck,
  HiSparkles,
  HiTrash,
  HiUser,
  HiXMark
} from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ESTADOS_TURNO = ['PRE_RESERVADO', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO'];

const ESTADO_LABELS = {
  PRE_RESERVADO: 'Pre-reservado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  BLOQUEADO: 'Bloqueado'
};

const ESTADO_STYLES = {
  PRE_RESERVADO: 'border-amber-200 bg-amber-50 text-amber-700',
  CONFIRMADO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELADO: 'border-red-200 bg-red-50 text-red-700',
  BLOQUEADO: 'border-slate-300 bg-slate-100 text-slate-700'
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

const getTodayISO = () => {
  const date = new Date();
  return date.toISOString().slice(0, 10);
};

const getNextDaysISO = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};

const timeToMinutes = (time) => {
  if (!time) return null;

  const parts = String(time).slice(0, 5).split(':').map(Number);

  if (parts.length < 2 || parts.some((item) => !Number.isFinite(item))) {
    return null;
  }

  return parts[0] * 60 + parts[1];
};

const minutesToTime = (minutes) => {
  const safeMinutes = Math.max(0, Number(minutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};

const calculateEndTime = (startTime, durationMin) => {
  const start = timeToMinutes(startTime);

  if (start === null) return '';

  return minutesToTime(start + Number(durationMin || 0));
};

const getEstadoLabel = (estado) => {
  return ESTADO_LABELS[estado] || estado || 'Sin estado';
};

const getEstadoStyle = (estado) => {
  return (
    ESTADO_STYLES[estado] || 'border-slate-200 bg-slate-100 text-slate-600'
  );
};

// Benjamin Orellana - 29/04/2026 - Obtiene la solicitud asociada al turno de forma segura aunque el turno todavía no esté cargado.
const getSolicitudDelTurno = (turno) => {
  if (!turno || typeof turno !== 'object') return null;

  return turno.solicitud || turno.solicitud_turno || null;
};
const getClienteNombre = (solicitud = {}) => {
  if (!solicitud) return 'Sin cliente';

  return (
    `${solicitud.nombre || ''} ${solicitud.apellido || ''}`.trim() ||
    'Sin cliente'
  );
};

const getWhatsAppLink = (telefono = '', solicitud = {}) => {
  const onlyNumbers = String(telefono || '').replace(/\D/g, '');

  if (!onlyNumbers) return '';

  const normalizedNumber = onlyNumbers.startsWith('54')
    ? onlyNumbers
    : `54${onlyNumbers}`;

  const text = encodeURIComponent(
    `Hola ${solicitud?.nombre || ''}, somos VALMAT. Te contactamos por tu servicio programado.`
  );

  return `https://wa.me/${normalizedNumber}?text=${text}`;
};

function EstadoTurnoBadge({ estado }) {
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

function QuickButton({
  children,
  icon: Icon,
  variant = 'default',
  onClick,
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
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {Icon && <Icon className="text-[1.1rem]" />}
      {children}
    </button>
  );
}

function TurnoDetailDrawer({
  open,
  turno,
  loading,
  onClose,
  onEstadoChange,
  onDelete
}) {
  const solicitud = getSolicitudDelTurno(turno);
  const whatsappLink = getWhatsAppLink(solicitud?.telefono, solicitud);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex justify-end"
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
            className="relative z-10 h-full w-full overflow-y-auto bg-[#f6f8fb] shadow-[0_0_90px_rgba(15,23,42,0.28)] sm:max-w-xl"
          >
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-sky-600">
                    Turno #{turno?.id || '-'}
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                    {turno ? formatDate(turno.fecha) : 'Cargando turno'}
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
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="mb-4 h-32 animate-pulse rounded-[26px] bg-white"
                  />
                ))}
              </div>
            ) : !turno ? (
              <div className="p-5">
                <div className="rounded-[26px] border border-red-100 bg-red-50 p-5 text-red-700">
                  No se pudo cargar el turno.
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <EstadoTurnoBadge estado={turno.estado} />

                    <select
                      value={turno.estado || ''}
                      onChange={(event) =>
                        onEstadoChange(turno, event.target.value)
                      }
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                    >
                      {ESTADOS_TURNO.map((estado) => (
                        <option key={estado} value={estado}>
                          {getEstadoLabel(estado)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Fecha
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {formatDate(turno.fecha)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Horario
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {formatTime(turno.hora_inicio)} a{' '}
                        {formatTime(turno.hora_fin)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatDuration(turno.duracion_min)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                        Observaciones
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                        {turno.observaciones || 'Sin observaciones'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">
                    Solicitud asociada
                  </h3>

                  {!solicitud ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-600">
                        Este turno no tiene solicitud asociada. Puede tratarse
                        de un bloqueo operativo.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                          Cliente
                        </p>
                        <p className="mt-1 font-black text-slate-950">
                          {getClienteNombre(solicitud)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {solicitud.telefono || '-'}
                        </p>
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
                          Total
                        </p>
                        <p className="mt-1 font-black text-slate-950">
                          {formatMoney(solicitud.total_estimado)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Solicitud #{solicitud.id} · {solicitud.estado || '-'}
                        </p>
                      </div>

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                        >
                          <HiPhone />
                          Contactar por WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <h3 className="text-lg font-black text-slate-950">
                    Acciones rápidas
                  </h3>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <QuickButton
                      icon={HiCheckBadge}
                      variant="success"
                      disabled={
                        turno.estado === 'CONFIRMADO' ||
                        turno.estado === 'CANCELADO'
                      }
                      onClick={() => onEstadoChange(turno, 'CONFIRMADO')}
                    >
                      Confirmar horario
                    </QuickButton>

                    <QuickButton
                      icon={HiXMark}
                      variant="warning"
                      disabled={turno.estado === 'CANCELADO'}
                      onClick={() => onEstadoChange(turno, 'CANCELADO')}
                    >
                      Cancelar horario
                    </QuickButton>

                    <QuickButton
                      icon={HiNoSymbol}
                      variant="default"
                      disabled={turno.estado === 'BLOQUEADO'}
                      onClick={() => onEstadoChange(turno, 'BLOQUEADO')}
                    >
                      Bloquear
                    </QuickButton>

                    <QuickButton
                      icon={HiTrash}
                      variant="danger"
                      onClick={() => onDelete(turno)}
                    >
                      Eliminar turno
                    </QuickButton>
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

function BloqueoModal({
  open,
  values,
  onChange,
  onClose,
  onSubmit,
  submitting
}) {
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
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_34px_100px_rgba(15,23,42,0.25)]"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-sky-600">
                    Agenda operativa
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Bloquear horario
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

            <div className="grid gap-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-black text-slate-700">
                    Fecha
                  </span>
                  <input
                    type="date"
                    value={values.fecha}
                    onChange={(event) => onChange('fecha', event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-sky-500"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-slate-700">
                    Hora inicio
                  </span>
                  <input
                    type="time"
                    value={values.hora_inicio}
                    onChange={(event) =>
                      onChange('hora_inicio', event.target.value)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-sky-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-black text-slate-700">
                    Duración
                  </span>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={values.duracion_min}
                    onChange={(event) =>
                      onChange('duracion_min', event.target.value)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-sky-500"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-slate-700">
                    Hora fin
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={calculateEndTime(
                      values.hora_inicio,
                      values.duracion_min
                    ).slice(0, 5)}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500 outline-none"
                  />
                </label>
              </div>

              <label>
                <span className="text-sm font-black text-slate-700">
                  Motivo / observaciones
                </span>
                <textarea
                  rows={4}
                  value={values.observaciones}
                  onChange={(event) =>
                    onChange('observaciones', event.target.value)
                  }
                  placeholder="Ej: equipo ocupado, mantenimiento interno, feriado operativo..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
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
                {submitting ? 'Guardando...' : 'Crear bloqueo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TurnoTableRow({ turno, onView, onEstadoChange, onDelete }) {
  const solicitud = getSolicitudDelTurno(turno);

  return (
    <tr className="border-b border-slate-100 transition hover:bg-sky-50/40">
      <td className="px-4 py-4">
        <div>
          <p className="font-black text-slate-950">{formatDate(turno.fecha)}</p>
          <p className="text-xs font-bold text-slate-400">
            Creado {formatDateTime(turno.created_at)}
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="font-black text-slate-950">
          {formatTime(turno.hora_inicio)} a {formatTime(turno.hora_fin)}
        </p>
        <p className="text-sm font-semibold text-slate-500">
          {formatDuration(turno.duracion_min)}
        </p>
      </td>

      <td className="px-4 py-4">
        {solicitud ? (
          <div>
            <p className="font-black text-slate-950">
              {getClienteNombre(solicitud)}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {solicitud.telefono || '-'}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-black text-slate-700">Bloqueo operativo</p>
            <p className="text-sm font-semibold text-slate-400">
              Sin cliente asociado
            </p>
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        {solicitud ? (
          <div>
            <p className="font-black text-slate-950">#{solicitud.id}</p>
            <p className="text-sm font-semibold text-slate-500">
              {formatMoney(solicitud.total_estimado)}
            </p>
          </div>
        ) : (
          <span className="text-sm font-semibold text-slate-400">-</span>
        )}
      </td>

      <td className="px-4 py-4">
        <EstadoTurnoBadge estado={turno.estado} />
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(turno.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-700 transition hover:bg-sky-50"
          >
            <HiEye className="text-[1.05rem]" />
          </button>

          <button
            type="button"
            disabled={
              turno.estado === 'CONFIRMADO' || turno.estado === 'CANCELADO'
            }
            onClick={() => onEstadoChange(turno, 'CONFIRMADO')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-35"
          >
            <HiCheckBadge className="text-[1.05rem]" />
          </button>

          <button
            type="button"
            disabled={turno.estado === 'CANCELADO'}
            onClick={() => onEstadoChange(turno, 'CANCELADO')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-white text-amber-600 transition hover:bg-amber-50 disabled:opacity-35"
          >
            <HiXMark className="text-[1.05rem]" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(turno)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
          >
            <HiTrash className="text-[1.05rem]" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TurnoMobileCard({ turno, onView, onEstadoChange, onDelete }) {
  const solicitud = getSolicitudDelTurno(turno);

  return (
    <motion.article
      variants={fadeUp}
      className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {formatDate(turno.fecha)}
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {formatTime(turno.hora_inicio)} a {formatTime(turno.hora_fin)}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {formatDuration(turno.duracion_min)}
          </p>
        </div>

        <EstadoTurnoBadge estado={turno.estado} />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <p className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-slate-400">
          {solicitud ? 'Cliente' : 'Bloqueo'}
        </p>
        <p className="mt-1 font-black text-slate-950">
          {solicitud ? getClienteNombre(solicitud) : 'Bloqueo operativo'}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {solicitud?.telefono || turno.observaciones || '-'}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onView(turno.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white"
        >
          <HiEye />
          Ver
        </button>

        <button
          type="button"
          disabled={
            turno.estado === 'CONFIRMADO' || turno.estado === 'CANCELADO'
          }
          onClick={() => onEstadoChange(turno, 'CONFIRMADO')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 disabled:opacity-35"
        >
          <HiCheckBadge />
        </button>

        <button
          type="button"
          disabled={turno.estado === 'CANCELADO'}
          onClick={() => onEstadoChange(turno, 'CANCELADO')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 disabled:opacity-35"
        >
          <HiXMark />
        </button>

        <button
          type="button"
          onClick={() => onDelete(turno)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600"
        >
          <HiTrash />
        </button>
      </div>
    </motion.article>
  );
}

function ServiciosAgendaAdmin() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedTurno, setSelectedTurno] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [bloqueoOpen, setBloqueoOpen] = useState(false);
  const [submittingBloqueo, setSubmittingBloqueo] = useState(false);

  const [bloqueoForm, setBloqueoForm] = useState({
    fecha: getTodayISO(),
    hora_inicio: '08:00',
    duracion_min: 60,
    observaciones: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    fecha_desde: getTodayISO(),
    fecha_hasta: getNextDaysISO(7)
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    if (filters.estado) params.set('estado', filters.estado);
    if (filters.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
    if (filters.search) params.set('search', filters.search);

    return params.toString();
  }, [filters, pagination.page, pagination.limit]);

  const filteredTurnos = useMemo(() => {
    if (!filters.search.trim()) return turnos;

    const search = filters.search.trim().toLowerCase();

    return turnos.filter((turno) => {
      const solicitud = getSolicitudDelTurno(turno);

      return [
        turno.observaciones,
        turno.estado,
        turno.fecha,
        turno.hora_inicio,
        solicitud?.nombre,
        solicitud?.apellido,
        solicitud?.telefono,
        solicitud?.email,
        solicitud?.direccion,
        solicitud?.localidad
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [turnos, filters.search]);

  const kpis = useMemo(() => {
    const visibles = filteredTurnos.length;
    const confirmados = filteredTurnos.filter(
      (item) => item.estado === 'CONFIRMADO'
    ).length;
    const pendientes = filteredTurnos.filter(
      (item) => item.estado === 'PRE_RESERVADO'
    ).length;
    const bloqueados = filteredTurnos.filter(
      (item) => item.estado === 'BLOQUEADO'
    ).length;
    const minutos = filteredTurnos.reduce(
      (acc, item) =>
        ['PRE_RESERVADO', 'CONFIRMADO', 'BLOQUEADO'].includes(item.estado)
          ? acc + Number(item.duracion_min || 0)
          : acc,
      0
    );

    return {
      visibles,
      confirmados,
      pendientes,
      bloqueados,
      minutos
    };
  }, [filteredTurnos]);

  const loadTurnos = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/servicios-turnos?${queryParams}`
      );
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudieron cargar los turnos.'
        );
      }

      setTurnos(Array.isArray(data.data) ? data.data : []);
      setPagination((current) => ({
        ...current,
        total: Number(data.total || 0),
        totalPages: Number(data.totalPages || 1)
      }));
    } catch (error) {
      setTurnos([]);

      Swal.fire({
        icon: 'error',
        title: 'No se pudieron cargar los turnos',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTurnoDetail = async (id) => {
    try {
      setDrawerOpen(true);
      setLoadingDetail(true);
      setSelectedTurno(null);

      const response = await fetch(`${API_URL}/servicios-turnos/${id}`);
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudo cargar el detalle del turno.'
        );
      }

      setSelectedTurno(data.data || null);
    } catch (error) {
      setSelectedTurno(null);

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
      fecha_desde: getTodayISO(),
      fecha_hasta: getNextDaysISO(7)
    });

    setPagination((current) => ({
      ...current,
      page: 1
    }));
  };

  const handleTurnoEstadoChange = async (turno, nuevoEstado) => {
    if (!turno?.id || !nuevoEstado) return;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Actualizar turno',
      text: `¿Querés cambiar el turno a "${getEstadoLabel(nuevoEstado)}"?`,
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

      if (selectedTurno?.id === turno.id) {
        await loadTurnoDetail(turno.id);
      }

      await loadTurnos();

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

  const handleDeleteTurno = async (turno) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar turno',
      text: `Esta acción eliminará físicamente el turno #${turno.id}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/servicios-turnos/${turno.id}`, {
        method: 'DELETE'
      });

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo eliminar el turno.'
        );
      }

      if (selectedTurno?.id === turno.id) {
        setSelectedTurno(null);
        setDrawerOpen(false);
      }

      await loadTurnos();

      Swal.fire({
        icon: 'success',
        title: 'Turno eliminado',
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

  const updateBloqueoForm = (field, value) => {
    setBloqueoForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const submitBloqueo = async () => {
    if (
      !bloqueoForm.fecha ||
      !bloqueoForm.hora_inicio ||
      !bloqueoForm.duracion_min
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Fecha, hora de inicio y duración son obligatorios.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const horaFin = calculateEndTime(
      bloqueoForm.hora_inicio,
      bloqueoForm.duracion_min
    );

    if (!horaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Horario inválido',
        text: 'No se pudo calcular la hora de fin.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    try {
      setSubmittingBloqueo(true);

      const response = await fetch(`${API_URL}/servicios-turnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha: bloqueoForm.fecha,
          hora_inicio: `${bloqueoForm.hora_inicio}:00`.slice(0, 8),
          hora_fin: horaFin,
          duracion_min: Number(bloqueoForm.duracion_min),
          estado: 'BLOQUEADO',
          observaciones:
            bloqueoForm.observaciones ||
            'Bloqueo operativo creado desde agenda interna.',
          metadata: {
            origen: 'AGENDA_INTERNA'
          }
        })
      });

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo crear el bloqueo.'
        );
      }

      setBloqueoOpen(false);
      setBloqueoForm({
        fecha: filters.fecha_desde || getTodayISO(),
        hora_inicio: '08:00',
        duracion_min: 60,
        observaciones: ''
      });

      await loadTurnos();

      Swal.fire({
        icon: 'success',
        title: 'Bloqueo creado',
        text: 'El horario fue bloqueado correctamente.',
        confirmButtonColor: '#0284c7'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo crear el bloqueo',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setSubmittingBloqueo(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, [queryParams]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <TurnoDetailDrawer
        open={drawerOpen}
        turno={selectedTurno}
        loading={loadingDetail}
        onClose={() => setDrawerOpen(false)}
        onEstadoChange={handleTurnoEstadoChange}
        onDelete={handleDeleteTurno}
      />

      <BloqueoModal
        open={bloqueoOpen}
        values={bloqueoForm}
        onChange={updateBloqueoForm}
        onClose={() => setBloqueoOpen(false)}
        onSubmit={submitBloqueo}
        submitting={submittingBloqueo}
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
                <HiCalendarDays className="text-cyan-100" />
                <span className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-cyan-50">
                  Servicios VALMAT
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                Agenda operativa
              </h1>

              <p className="mt-4 max-w-2xl text-[0.95rem] font-medium leading-7 text-white/75">
                Gestión de turnos pre-reservados, horarios confirmados,
                cancelaciones y bloqueos operativos del módulo Servicios.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setBloqueoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-black text-slate-950 backdrop-blur-xl transition hover:bg-cyan-50"
              >
                <HiPlus className="text-[1.1rem]" />
                Bloquear horario
              </button>

              <button
                type="button"
                onClick={loadTurnos}
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
            title="Visibles"
            value={kpis.visibles}
            helper={`Total general: ${pagination.total}`}
            icon={HiCalendarDays}
          />
          <KpiCard
            title="Pre-reservados"
            value={kpis.pendientes}
            helper="Requieren confirmación"
            icon={HiClock}
          />
          <KpiCard
            title="Confirmados"
            value={kpis.confirmados}
            helper="Horarios cerrados"
            icon={HiCheckBadge}
          />
          <KpiCard
            title="Carga horaria"
            value={formatDuration(kpis.minutos)}
            helper={`${kpis.bloqueados} bloqueos visibles`}
            icon={HiShieldCheck}
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
                  Controlá la agenda por fecha, estado y cliente
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

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Buscar cliente, teléfono, dirección..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={filters.estado}
              onChange={(event) => updateFilter('estado', event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_TURNO.map((estado) => (
                <option key={estado} value={estado}>
                  {getEstadoLabel(estado)}
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
                Turnos programados
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
          ) : filteredTurnos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <HiCalendarDays className="text-[2rem]" />
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                Sin turnos para estos filtros
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                Ajustá el rango de fechas o creá un bloqueo operativo si
                necesitás reservar un horario interno.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1080px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-4 py-4">Fecha</th>
                      <th className="px-4 py-4">Horario</th>
                      <th className="px-4 py-4">Cliente / Bloqueo</th>
                      <th className="px-4 py-4">Solicitud</th>
                      <th className="px-4 py-4">Estado</th>
                      <th className="px-4 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTurnos.map((turno) => (
                      <TurnoTableRow
                        key={turno.id}
                        turno={turno}
                        onView={loadTurnoDetail}
                        onEstadoChange={handleTurnoEstadoChange}
                        onDelete={handleDeleteTurno}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 xl:hidden">
                {filteredTurnos.map((turno) => (
                  <TurnoMobileCard
                    key={turno.id}
                    turno={turno}
                    onView={loadTurnoDetail}
                    onEstadoChange={handleTurnoEstadoChange}
                    onDelete={handleDeleteTurno}
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

export default ServiciosAgendaAdmin;
