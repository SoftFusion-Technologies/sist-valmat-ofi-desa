// Benjamin Orellana - 2026/04/23 - Formulario de contacto paso a paso simplificado a una sola columna vertical, con progreso integrado arriba del bloque principal.
// Benjamin Orellana - 2026/04/24 - Se corrige scroll mobile al avanzar pasos y se moderniza la UI sin agregar textos extra ni ocupar más espacio visual.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaChevronDown,
  FaChevronUp,
  FaRegCalendarAlt,
  FaClipboardList,
  FaCheckCircle
} from 'react-icons/fa';

const SERVICE_OPTIONS = [
  {
    id: 'final-obra',
    title: 'Final de obra',
    description:
      'Limpieza técnica final de obra con control y terminación profesional.'
  },
  {
    id: 'hogares',
    title: 'Hogares',
    description:
      'Limpieza integral para espacios habitados con ejecución cuidada.'
  },
  {
    id: 'tapizados',
    title: 'Tapizados',
    description:
      'Limpieza de sillones, sillas y superficies textiles delicadas.'
  },
  {
    id: 'otro',
    title: 'Otro servicio',
    description:
      'Seleccioná esta opción si querés explicarnos un caso particular.'
  }
];

const SHIFT_OPTIONS = ['Mañana', 'Mediodía', 'Tarde', 'Flexible'];

const WEEKDAY_OPTIONS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

const INITIAL_FORM = {
  nombre: '',
  telefono: '',
  email: '',
  ciudad: '',
  barrio: '',
  direccion: '',
  referencia: '',
  servicio: '',
  metros: '',
  detalle: '',
  urgencia: 'Normal',
  fecha: '',
  franja: '',
  dias: []
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function StepHeader({ stepNumber, title, isOpen, isCompleted, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-all duration-300 sm:px-5 sm:py-4',
        isOpen ? 'bg-white' : 'bg-slate-50/80 hover:bg-slate-100/80'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={classNames(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300',
            isCompleted
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
              : isOpen
                ? 'border-sky-200 bg-sky-50 text-sky-600 shadow-[0_10px_22px_rgba(14,165,233,0.10)]'
                : 'border-slate-200 bg-white text-slate-500'
          )}
        >
          {isCompleted ? (
            <FaCheckCircle className="text-[0.9rem]" />
          ) : (
            stepNumber
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Paso {stepNumber}
          </p>
          <h3 className="mt-0.5 truncate text-[0.98rem] font-semibold text-slate-900 sm:text-[1.02rem]">
            {title}
          </h3>
        </div>
      </div>

      <div
        className={classNames(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
          isOpen
            ? 'border-sky-100 bg-sky-50 text-sky-600'
            : 'border-slate-200 bg-white text-slate-400 group-hover:border-sky-100 group-hover:text-sky-600'
        )}
      >
        {isOpen ? (
          <FaChevronUp className="text-[0.78rem]" />
        ) : (
          <FaChevronDown className="text-[0.78rem]" />
        )}
      </div>
    </button>
  );
}

function StepContainer({ isOpen, children }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({ label, required = false, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.86rem] font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-sky-600">*</span> : null}
      </label>

      <input
        {...props}
        className={classNames(
          'w-full rounded-2xl border bg-white px-4 py-3 text-[0.94rem] text-slate-800 outline-none transition-all duration-300',
          'placeholder:text-slate-400',
          error
            ? 'border-red-300 bg-red-50/40 focus:border-red-400'
            : 'border-slate-200 focus:border-sky-300 focus:bg-sky-50/20 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]'
        )}
      />

      {error ? (
        <p className="text-[0.76rem] font-medium text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function TextArea({ label, required = false, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.86rem] font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-sky-600">*</span> : null}
      </label>

      <textarea
        {...props}
        className={classNames(
          'min-h-[112px] w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[0.94rem] text-slate-800 outline-none transition-all duration-300 sm:min-h-[128px]',
          'placeholder:text-slate-400',
          error
            ? 'border-red-300 bg-red-50/40 focus:border-red-400'
            : 'border-slate-200 focus:border-sky-300 focus:bg-sky-50/20 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]'
        )}
      />

      {error ? (
        <p className="text-[0.76rem] font-medium text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function ActionRow({
  onPrev,
  onNext,
  isLast = false,
  isFirst = false,
  loading = false
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst || loading}
        className={classNames(
          'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-[0.88rem] font-semibold transition-all duration-300',
          isFirst || loading
            ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
            : 'border border-slate-200 bg-white text-slate-700 hover:-translate-y-[1px] hover:border-slate-300 active:scale-[0.98]'
        )}
      >
        Volver
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-[0.9rem] font-semibold text-white shadow-[0_14px_30px_rgba(25,211,223,0.18)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[var(--color-secondary)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Enviando...' : isLast ? 'Enviar solicitud' : 'Siguiente'}
      </button>
    </div>
  );
}

function ContactoPasoAPaso() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(1);
  const [openStep, setOpenStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useRef(null);
  const formCardRef = useRef(null);
  const stepRefs = useRef({});
  const scrollTimerRef = useRef(null);

  const progress = useMemo(() => (currentStep / 5) * 100, [currentStep]);

  const completedSteps = useMemo(() => {
    return {
      1: Boolean(form.nombre.trim() && form.telefono.trim()),
      2: Boolean(form.ciudad.trim() && form.direccion.trim()),
      3: Boolean(form.servicio),
      4: Boolean(form.detalle.trim()),
      5: Boolean(form.fecha && form.franja && form.dias.length > 0)
    };
  }, [form]);

  // Benjamin Orellana - 2026/04/24 - Hace scroll al paso activo en mobile sin mandar la pantalla al inicio de la página.
  const scrollToStep = useCallback((step) => {
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (!isMobile) return;

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      const target = stepRefs.current[step] || formCardRef.current;

      if (!target) return;

      const navbarOffset = 92;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navbarOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
      });
    }, 120);
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  const toggleDia = (day) => {
    setForm((prev) => {
      const exists = prev.dias.includes(day);

      return {
        ...prev,
        dias: exists
          ? prev.dias.filter((item) => item !== day)
          : [...prev.dias, day]
      };
    });

    setErrors((prev) => ({
      ...prev,
      dias: ''
    }));
  };

  const validateStep = (step) => {
    const nextErrors = {};

    if (step === 1) {
      if (!form.nombre.trim())
        nextErrors.nombre = 'Ingresá tu nombre y apellido.';
      if (!form.telefono.trim())
        nextErrors.telefono = 'Ingresá un teléfono o WhatsApp.';
    }

    if (step === 2) {
      if (!form.ciudad.trim()) nextErrors.ciudad = 'Ingresá tu ciudad.';
      if (!form.direccion.trim())
        nextErrors.direccion = 'Ingresá la dirección.';
    }

    if (step === 3) {
      if (!form.servicio) nextErrors.servicio = 'Seleccioná un servicio.';
    }

    if (step === 4) {
      if (!form.detalle.trim())
        nextErrors.detalle = 'Contanos brevemente qué necesitás.';
    }

    if (step === 5) {
      if (!form.fecha) nextErrors.fecha = 'Seleccioná una fecha.';
      if (!form.franja) nextErrors.franja = 'Seleccioná una franja horaria.';
      if (form.dias.length === 0)
        nextErrors.dias = 'Seleccioná al menos un día disponible.';
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenStep = (step) => {
    setOpenStep(step);
    scrollToStep(step);
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);

    if (!isValid) {
      scrollToStep(currentStep);
      return;
    }

    if (currentStep < 5) {
      const nextStep = currentStep + 1;

      setCurrentStep(nextStep);
      setOpenStep(nextStep);
      scrollToStep(nextStep);

      return;
    }

    // Benjamin Orellana - 2026/04/24 - Muestra confirmación visual moderna al enviar la solicitud desde el formulario.
    Swal.fire({
      title: 'Solicitud enviada',
      text: 'VALMAT recibió los datos del formulario correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
      background: '#ffffff',
      color: '#0f172a',
      customClass: {
        popup: 'rounded-[28px]',
        confirmButton: 'rounded-full px-6 py-3 font-semibold'
      }
    }).then(() => {
      setSubmitted(true);

      window.setTimeout(() => {
        const target = sectionRef.current;

        if (!target) return;

        const targetTop =
          target.getBoundingClientRect().top + window.scrollY - 92;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: 'smooth'
        });
      }, 100);
    });
  };

  const handlePrev = () => {
    if (currentStep === 1) return;

    const prevStep = currentStep - 1;

    setCurrentStep(prevStep);
    setOpenStep(prevStep);
    scrollToStep(prevStep);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setCurrentStep(1);
    setOpenStep(1);
    setSubmitted(false);

    window.setTimeout(() => {
      scrollToStep(1);
    }, 80);
  };

  if (submitted) {
    return (
      <section
        id="contacto"
        ref={sectionRef}
        className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_58%,#ffffff_100%)] py-14 sm:py-20"
      >
        <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[34px] border border-sky-100 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FaCheckCircle className="text-[1.6rem]" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Solicitud lista
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-7 text-slate-600">
                El flujo front quedó completo correctamente. Más adelante podés
                conectar este formulario a tu API sin tocar la experiencia
                visual.
              </p>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
              <h3 className="text-[0.95rem] font-semibold text-slate-900">
                Resumen cargado
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Nombre
                  </p>
                  <p className="mt-1 text-[0.92rem] font-medium text-slate-800">
                    {form.nombre || '-'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Teléfono
                  </p>
                  <p className="mt-1 text-[0.92rem] font-medium text-slate-800">
                    {form.telefono || '-'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Servicio
                  </p>
                  <p className="mt-1 text-[0.92rem] font-medium text-slate-800">
                    {SERVICE_OPTIONS.find((item) => item.id === form.servicio)
                      ?.title || '-'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Fecha
                  </p>
                  <p className="mt-1 text-[0.92rem] font-medium text-slate-800">
                    {form.fecha || '-'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3.5 text-[0.92rem] font-semibold text-white shadow-[0_14px_30px_rgba(25,211,223,0.18)] transition-all duration-300 hover:bg-[var(--color-secondary)] active:scale-[0.98]"
            >
              Crear nueva solicitud
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contacto"
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_58%,#ffffff_100%)] py-14 sm:py-20"
    >
      {/* Benjamin Orellana - 2026/04/23 - Fondo suave y moderno para la sección de contacto. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[8%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.10)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-8%] top-[20%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.08)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-8%] left-[20%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Contacto
            </span>
          </div>

          <h2 className="mt-5 titulo uppercase text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Solicitanos tu servicio paso a paso
          </h2>
        </div>

        <div
          ref={formCardRef}
          className="mt-8 overflow-hidden rounded-[32px] border border-sky-100 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mt-10"
        >
          {/* Benjamin Orellana - 2026/04/23 - El progreso se integra arriba del bloque principal y se elimina la columna lateral de pasos. */}
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[0.78rem]">
                  Progreso
                </p>
                <h3 className="mt-1 text-[1rem] font-semibold text-slate-900 sm:text-[1.02rem]">
                  Paso {currentStep} de 5
                </h3>
              </div>

              <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[0.76rem] font-semibold text-sky-700 sm:text-[0.78rem]">
                {Math.round(progress)}%
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary)_0%,var(--color-secondary)_100%)]"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[0.76rem]">
                  VALMAT
                </p>
                <h3 className="mt-1 text-[1.02rem] font-semibold text-slate-900 sm:text-[1.08rem]">
                  Formulario de contacto
                </h3>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.72rem] font-semibold text-slate-500 sm:text-[0.76rem]">
                Paso a paso
              </div>
            </div>
          </div>

          <div>
            <div
              ref={(element) => {
                stepRefs.current[1] = element;
              }}
              className="border-b border-slate-100 scroll-mt-28"
            >
              <StepHeader
                stepNumber={1}
                title="Datos personales"
                isOpen={openStep === 1}
                isCompleted={currentStep > 1 && completedSteps[1]}
                onClick={() => handleOpenStep(1)}
              />

              <StepContainer isOpen={openStep === 1}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Nombre y apellido"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={form.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      error={errors.nombre}
                    />
                  </div>

                  <Input
                    label="Teléfono / WhatsApp"
                    required
                    placeholder="Ej. 381..."
                    value={form.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                    error={errors.telefono}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Ej. correo@dominio.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                  />
                </div>

                <ActionRow onPrev={handlePrev} onNext={handleNext} isFirst />
              </StepContainer>
            </div>

            <div
              ref={(element) => {
                stepRefs.current[2] = element;
              }}
              className="border-b border-slate-100 scroll-mt-28"
            >
              <StepHeader
                stepNumber={2}
                title="Ubicación"
                isOpen={openStep === 2}
                isCompleted={currentStep > 2 && completedSteps[2]}
                onClick={() => handleOpenStep(2)}
              />

              <StepContainer isOpen={openStep === 2}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Ciudad"
                    required
                    placeholder="Ej. Monteros"
                    value={form.ciudad}
                    onChange={(e) => updateField('ciudad', e.target.value)}
                    error={errors.ciudad}
                  />

                  <Input
                    label="Barrio"
                    placeholder="Ej. Centro"
                    value={form.barrio}
                    onChange={(e) => updateField('barrio', e.target.value)}
                    error={errors.barrio}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Dirección"
                      required
                      placeholder="Ej. Calle 123, altura 450"
                      value={form.direccion}
                      onChange={(e) => updateField('direccion', e.target.value)}
                      error={errors.direccion}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Referencia"
                      placeholder="Ej. Portón negro, esquina, edificio, etc."
                      value={form.referencia}
                      onChange={(e) =>
                        updateField('referencia', e.target.value)
                      }
                      error={errors.referencia}
                    />
                  </div>
                </div>

                <ActionRow onPrev={handlePrev} onNext={handleNext} />
              </StepContainer>
            </div>

            <div
              ref={(element) => {
                stepRefs.current[3] = element;
              }}
              className="border-b border-slate-100 scroll-mt-28"
            >
              <StepHeader
                stepNumber={3}
                title="Servicio"
                isOpen={openStep === 3}
                isCompleted={currentStep > 3 && completedSteps[3]}
                onClick={() => handleOpenStep(3)}
              />

              <StepContainer isOpen={openStep === 3}>
                <div className="grid gap-3">
                  {SERVICE_OPTIONS.map((service) => {
                    const isSelected = form.servicio === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => updateField('servicio', service.id)}
                        className={classNames(
                          'rounded-[22px] border p-4 text-left transition-all duration-300 active:scale-[0.99]',
                          isSelected
                            ? 'border-sky-300 bg-sky-50/80 shadow-[0_14px_30px_rgba(25,211,223,0.10)]'
                            : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-[0.96rem] font-semibold text-slate-900">
                              {service.title}
                            </h4>
                            <p className="mt-1 text-[0.86rem] leading-6 text-slate-600">
                              {service.description}
                            </p>
                          </div>

                          <div
                            className={classNames(
                              'mt-1 h-5 w-5 shrink-0 rounded-full border transition-all duration-300',
                              isSelected
                                ? 'border-sky-500 bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.10)]'
                                : 'border-slate-300 bg-white'
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}

                  {errors.servicio ? (
                    <p className="text-[0.76rem] font-medium text-red-500">
                      {errors.servicio}
                    </p>
                  ) : null}
                </div>

                <ActionRow onPrev={handlePrev} onNext={handleNext} />
              </StepContainer>
            </div>

            <div
              ref={(element) => {
                stepRefs.current[4] = element;
              }}
              className="border-b border-slate-100 scroll-mt-28"
            >
              <StepHeader
                stepNumber={4}
                title="Detalles del servicio"
                isOpen={openStep === 4}
                isCompleted={currentStep > 4 && completedSteps[4]}
                onClick={() => handleOpenStep(4)}
              />

              <StepContainer isOpen={openStep === 4}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Metros aproximados"
                    placeholder="Ej. 120 m²"
                    value={form.metros}
                    onChange={(e) => updateField('metros', e.target.value)}
                    error={errors.metros}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[0.86rem] font-semibold text-slate-700">
                      Nivel de urgencia
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {['Baja', 'Normal', 'Alta'].map((item) => {
                        const active = form.urgencia === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => updateField('urgencia', item)}
                            className={classNames(
                              'rounded-2xl border px-3 py-3 text-[0.84rem] font-semibold transition-all duration-300 active:scale-[0.98]',
                              active
                                ? 'border-sky-300 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.08)]'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <TextArea
                      label="Contanos qué necesitás"
                      required
                      placeholder="Ej. Tipo de espacio, cantidad de ambientes, estado general, si hay obra, si hay que coordinar visita, etc."
                      value={form.detalle}
                      onChange={(e) => updateField('detalle', e.target.value)}
                      error={errors.detalle}
                    />
                  </div>
                </div>

                <ActionRow onPrev={handlePrev} onNext={handleNext} />
              </StepContainer>
            </div>

            <div
              ref={(element) => {
                stepRefs.current[5] = element;
              }}
              className="scroll-mt-28"
            >
              <StepHeader
                stepNumber={5}
                title="Fechas y horarios"
                isOpen={openStep === 5}
                isCompleted={completedSteps[5]}
                onClick={() => handleOpenStep(5)}
              />

              <StepContainer isOpen={openStep === 5}>
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Fecha preferida"
                      type="date"
                      required
                      value={form.fecha}
                      onChange={(e) => updateField('fecha', e.target.value)}
                      error={errors.fecha}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-[0.86rem] font-semibold text-slate-700">
                        Franja horaria{' '}
                        <span className="ml-1 text-sky-600">*</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {SHIFT_OPTIONS.map((item) => {
                          const active = form.franja === item;

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => updateField('franja', item)}
                              className={classNames(
                                'rounded-2xl border px-3 py-3 text-[0.84rem] font-semibold transition-all duration-300 active:scale-[0.98]',
                                active
                                  ? 'border-sky-300 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.08)]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
                              )}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>

                      {errors.franja ? (
                        <p className="text-[0.76rem] font-medium text-red-500">
                          {errors.franja}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.86rem] font-semibold text-slate-700">
                      Días disponibles{' '}
                      <span className="ml-1 text-sky-600">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {WEEKDAY_OPTIONS.map((day) => {
                        const active = form.dias.includes(day);

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDia(day)}
                            className={classNames(
                              'rounded-2xl border px-3 py-3 text-[0.84rem] font-semibold transition-all duration-300 active:scale-[0.98]',
                              active
                                ? 'border-sky-300 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.08)]'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {errors.dias ? (
                      <p className="text-[0.76rem] font-medium text-red-500">
                        {errors.dias}
                      </p>
                    ) : null}
                  </div>
                </div>

                <ActionRow onPrev={handlePrev} onNext={handleNext} isLast />
              </StepContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactoPasoAPaso;
