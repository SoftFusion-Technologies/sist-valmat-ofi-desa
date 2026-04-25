// Benjamin Orellana - 25/04/2026 - Login administrativo VALMAT centrado, limpio y enfocado exclusivamente en el acceso.
// Benjamin Orellana - 25/04/2026 - Se agrega SweetAlert2 para errores de autenticación y crédito institucional a Soft Fusion.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuth } from '../Auth/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const showLoginError = (message) => {
  Swal.fire({
    title: 'No se pudo iniciar sesión',
    text: message || 'Revisá tus credenciales e intentá nuevamente.',
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

const EyeIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeOffIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 3l18 18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.88 5.52A10.2 10.2 0 0 1 12 5.25C18.25 5.25 21.75 12 21.75 12a16.7 16.7 0 0 1-3.08 4.06"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 6.88C3.72 8.75 2.25 12 2.25 12S5.75 18.75 12 18.75a9.8 9.8 0 0 0 4.42-1.07"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7.75 10V8.25a4.25 4.25 0 0 1 8.5 0V10"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M6.75 10h10.5A1.75 1.75 0 0 1 19 11.75v6.5A1.75 1.75 0 0 1 17.25 20H6.75A1.75 1.75 0 0 1 5 18.25v-6.5A1.75 1.75 0 0 1 6.75 10Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14v2"
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

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loadingAuth } = useAuth();

  const [form, setForm] = useState({
    identificador: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.identificador.trim().length >= 3 &&
      form.password.trim().length >= 4 &&
      !submitting
    );
  }, [form.identificador, form.password, submitting]);

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [loadingAuth, isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      showLoginError('Completá email o teléfono y contraseña para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identificador: form.identificador.trim(),
          password: form.password
        })
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok || !data?.token) {
        throw new Error(
          data?.message || 'No se pudo iniciar sesión. Revisá tus credenciales.'
        );
      }

      login(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showLoginError(
        err?.message || 'Ocurrió un error inesperado al iniciar sesión.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 text-[var(--color-text)] cuerpo sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,223,0.13),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(90,151,208,0.10),transparent_34%)]" />

      <div className="absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(217,226,232,.50)_1px,transparent_1px),linear-gradient(90deg,rgba(217,226,232,.50)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(25,211,223,.07)] blur-3xl" />

      <section className="relative z-10 w-full max-w-[440px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,.08)]">
            <span className="font-bignoodle text-5xl leading-none tracking-wide text-[var(--color-primary)]">
              V
            </span>
          </div>

          <h1 className="font-bignoodle text-5xl leading-none tracking-[0.08em] text-[var(--color-text)] sm:text-6xl">
            VALMAT
          </h1>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
            Sistema administrativo
          </p>
        </div>

        <div className="rounded-[34px] border border-[var(--color-border)] bg-white/90 p-2 shadow-[0_28px_90px_rgba(17,17,17,.11)] backdrop-blur-xl">
          <div className="rounded-[28px] border border-[#eef3f6] bg-white px-5 py-6 sm:px-7 sm:py-8">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(25,211,223,.10)] text-[var(--color-primary)]">
                <LockIcon className="h-5 w-5" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                Acceso seguro
              </p>

              <h2 className="titulo uppercase mt-3 text-3xl leading-none tracking-[-0.04em] text-[var(--color-text)] sm:text-3xl">
                Iniciar sesión
              </h2>

              <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[var(--color-text-soft)]">
                Ingresá tus credenciales para continuar al panel.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  Email o teléfono
                </span>

                <div className="group flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                  <UserIcon className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                  <input
                    type="text"
                    name="identificador"
                    value={form.identificador}
                    onChange={handleChange}
                    autoComplete="username"
                    placeholder="Email o teléfono"
                    className="w-full bg-transparent text-sm font-semibold text-[var(--color-text)] outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  Contraseña
                </span>

                <div className="group flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 transition focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(25,211,223,.10)]">
                  <LockIcon className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    className="w-full bg-transparent text-sm font-semibold text-[var(--color-text)] outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white hover:text-[var(--color-primary)]"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary)] px-5 py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(25,211,223,.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center gap-2">
                  {submitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {submitting ? 'Validando acceso...' : 'Ingresar'}
                </span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-[var(--color-text-soft)]">
            Acceso exclusivo para usuarios autorizados.
          </p>

          <a
            href="https://softfusion.com.ar/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-pink-500 shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Sistema diseñado y desarrollado por Soft Fusion
          </a>
        </div>
      </section>
    </main>
  );
}
