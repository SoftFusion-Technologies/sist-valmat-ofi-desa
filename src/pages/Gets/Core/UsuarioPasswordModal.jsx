// Benjamin Orellana - 25/04/2026 - Modal dedicado para cambio seguro de contraseña de usuarios VALMAT.

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { X, Lock, ShieldCheck } from 'lucide-react';

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } }
};

const panelV = {
  hidden: { opacity: 0, y: 22, scale: 0.96, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 250, damping: 24 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.97,
    filter: 'blur(6px)',
    transition: { duration: 0.16, ease: 'easeIn' }
  }
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

export default function UsuarioPasswordModal({
  open,
  onClose,
  usuario,
  onSubmit
}) {
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [saving, setSaving] = useState(false);

  const titleId = 'usuario-password-modal-title';

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirmacion('');
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();

    if (String(password).trim().length < 6) {
      await showValidationError(
        'La nueva contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (password !== confirmacion) {
      await showValidationError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setSaving(true);

      Swal.fire({
        title: 'Actualizando contraseña...',
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

      await onSubmit(password);

      Swal.close();

      await Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Contraseña actualizada',
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
        title: 'No se pudo actualizar',
        text: error?.message || 'Error al actualizar la contraseña.',
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

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl sm:max-w-lg"
          >
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
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-6 w-6 shrink-0 text-gray-300" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                    Seguridad
                  </p>

                  <h3
                    id={titleId}
                    className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl"
                  >
                    Cambiar contraseña
                  </h3>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-gray-100">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {usuario?.email ||
                    usuario?.telefono ||
                    'Usuario sin contacto visible'}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <ShieldCheck className="h-4 w-4 text-gray-400" />
                    Nueva contraseña
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Confirmar contraseña
                  </label>

                  <input
                    type="password"
                    value={confirmacion}
                    onChange={(event) => setConfirmacion(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="Repetí la contraseña"
                  />
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 pt-1 sm:flex-row">
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
                    {saving ? 'Actualizando…' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            </div>

            <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-2xl bg-gradient-to-r from-gray-400/70 via-gray-200/70 to-gray-400/70 opacity-40" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
