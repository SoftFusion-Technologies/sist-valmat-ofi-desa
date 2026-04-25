// Benjamin Orellana - 25/04/2026 - Formulario modal premium para crear y editar usuarios VALMAT con diseño glass/stagger.

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  X,
  User,
  BadgeCheck,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  ToggleLeft
} from 'lucide-react';

const ROLES_GLOBALES = [
  'SUPER_ADMIN',
  'ADMIN',
  'COMERCIAL',
  'ENCARGADO',
  'OPERARIO'
];
const ESTADOS_USUARIO = ['ACTIVO', 'INACTIVO', 'BLOQUEADO'];

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  rol_global: 'OPERARIO',
  estado: 'ACTIVO'
};

const backdropV = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: 'easeIn' }
  }
};

const panelV = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.96,
    filter: 'blur(8px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.97,
    filter: 'blur(6px)',
    transition: { duration: 0.16, ease: 'easeIn' }
  }
};

const formContainerV = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08
    }
  }
};

const fieldV = {
  hidden: {
    opacity: 0,
    y: 12
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24
    }
  }
};

const formatRole = (role) => {
  if (!role) return 'Sin rol';

  return String(role)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const showValidationError = async (message) => {
  await Swal.fire({
    title: 'Validación',
    text: message,
    icon: 'warning',
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

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback || 'Ocurrió un error inesperado.';
};

export default function UsuarioFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const titleId = 'usuario-modal-title';
  const formId = 'usuario-form';

  useEffect(() => {
    if (open) {
      setForm({
        nombre: initial?.nombre || '',
        apellido: initial?.apellido || '',
        email: initial?.email || '',
        telefono: initial?.telefono || '',
        password: '',
        rol_global: initial?.rol_global || 'OPERARIO',
        estado: initial?.estado || 'ACTIVO'
      });
    }
  }, [open, initial]);

  const handle = (event) => {
    const { name, value, checked } = event.target;

    if (name === 'estado_switch') {
      setForm((prev) => ({
        ...prev,
        estado: checked ? 'ACTIVO' : 'INACTIVO'
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = async () => {
    if (!form.nombre.trim()) {
      await showValidationError('El nombre del usuario es obligatorio.');
      return false;
    }

    if (!form.email.trim() && !form.telefono.trim()) {
      await showValidationError('El usuario debe tener email o teléfono.');
      return false;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      await showValidationError('Ingresá un email válido.');
      return false;
    }

    if (!isEdit && String(form.password).trim().length < 6) {
      await showValidationError(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return false;
    }

    if (!ROLES_GLOBALES.includes(form.rol_global)) {
      await showValidationError('El rol global seleccionado no es válido.');
      return false;
    }

    if (!ESTADOS_USUARIO.includes(form.estado)) {
      await showValidationError('El estado seleccionado no es válido.');
      return false;
    }

    return true;
  };

  const submit = async (event) => {
    event.preventDefault();

    const valid = await validate();

    if (!valid) return;

    try {
      setSaving(true);

      Swal.fire({
        title: isEdit ? 'Actualizando usuario...' : 'Creando usuario...',
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

      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        rol_global: form.rol_global,
        estado: form.estado
      };

      if (!isEdit) {
        payload.password = form.password;
      }

      await onSubmit(payload);

      Swal.close();

      await Swal.fire({
        toast: true,
        position: 'top-end',
        title: isEdit ? 'Usuario actualizado' : 'Usuario creado',
        icon: 'success',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#111111'
      });

      onClose();
    } catch (error) {
      Swal.close();

      await Swal.fire({
        title: 'No se pudo guardar',
        text: getErrorMessage(error, 'Error al guardar el usuario.'),
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={!saving ? onClose : undefined}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-20 size-[22rem] rounded-full blur-3xl opacity-45 sm:size-[28rem] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(59,130,246,0.14),rgba(6,182,212,0.12),rgba(99,102,241,0.12),transparent,rgba(6,182,212,0.12))]"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-16 size-[24rem] rounded-full blur-3xl opacity-35 sm:size-[30rem] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.10),transparent_60%)]"
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-h-[88vh] w-full max-w-[92vw] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl sm:max-w-2xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
            />

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="absolute right-2.5 top-2.5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-gray-200" />
            </button>

            <div className="relative z-10 p-5 sm:p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="mb-5 flex items-center gap-3 sm:mb-6"
              >
                <User className="h-6 w-6 shrink-0 text-gray-300" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                    {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
                  </p>

                  <h3
                    id={titleId}
                    className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl"
                  >
                    {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                </div>
              </motion.div>

              <motion.form
                id={formId}
                onSubmit={submit}
                variants={formContainerV}
                initial="hidden"
                animate="visible"
                className="space-y-5 sm:space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <motion.div variants={fieldV}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                      <BadgeCheck className="h-4 w-4 text-gray-400" />
                      Nombre <span className="text-cyan-300">*</span>
                    </label>

                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="Benjamin"
                    />
                  </motion.div>

                  <motion.div variants={fieldV}>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Apellido
                    </label>

                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="Orellana"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <motion.div variants={fieldV}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email
                    </label>

                    <input
                      name="email"
                      value={form.email}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="usuario@valmat.com.ar"
                    />
                  </motion.div>

                  <motion.div variants={fieldV}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Teléfono
                    </label>

                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="3810000000"
                    />
                  </motion.div>
                </div>

                {!isEdit && (
                  <motion.div variants={fieldV}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Lock className="h-4 w-4 text-gray-400" />
                      Contraseña <span className="text-cyan-300">*</span>
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <motion.div variants={fieldV}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                      <ShieldCheck className="h-4 w-4 text-gray-400" />
                      Rol global
                    </label>

                    <select
                      name="rol_global"
                      value={form.rol_global}
                      onChange={handle}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    >
                      {ROLES_GLOBALES.map((role) => (
                        <option
                          key={role}
                          value={role}
                          className="bg-slate-950"
                        >
                          {formatRole(role)}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.label
                    variants={fieldV}
                    className="flex cursor-pointer select-none items-end gap-3 pb-3"
                    htmlFor="usuario-estado"
                  >
                    <input
                      id="usuario-estado"
                      type="checkbox"
                      name="estado_switch"
                      checked={form.estado === 'ACTIVO'}
                      onChange={handle}
                      className="peer sr-only"
                    />

                    <span
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors duration-200 peer-checked:bg-emerald-500/70"
                      aria-hidden
                    >
                      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
                    </span>

                    <span className="flex items-center gap-2 text-sm text-gray-200">
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                      {form.estado === 'ACTIVO'
                        ? 'Usuario activo'
                        : 'Usuario inactivo'}
                    </span>
                  </motion.label>
                </div>

                <motion.div
                  variants={fieldV}
                  className="flex flex-col-reverse justify-end gap-2 pt-1 sm:flex-row"
                >
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="rounded-xl border border-white/10 px-4 py-2 text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Guardando…'
                      : isEdit
                        ? 'Guardar cambios'
                        : 'Crear'}
                  </button>
                </motion.div>
              </motion.form>
            </div>

            <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-2xl bg-gradient-to-r from-gray-400/70 via-gray-200/70 to-gray-400/70 opacity-40" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
