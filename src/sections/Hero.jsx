// Benjamin Orellana - 2026/04/21 - Hero institucional moderno para VALMAT con composición visual premium y microanimaciones.

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiArrowRight, HiCheckBadge } from 'react-icons/hi2';

const VISUALS = [
  {
    id: 1,
    src: '/hero/hero-clean-1.png',
    alt: 'Limpieza profesional y técnica de VALMAT'
  },
  {
    id: 2,
    src: '/hero/hero-clean-2.png',
    alt: 'Servicio integral de limpieza VALMAT'
  },
  {
    id: 3,
    src: '/hero/hero-clean-3.png',
    alt: 'Planificación y precisión en servicios de limpieza'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.12,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

function RotatingWord({ words = [], interval = 2200 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [words, interval]);

  return (
    <span className="relative inline-flex min-w-[1.2ch] items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, scale: 0.98, filter: 'blur(8px)' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block px-2 text-[var(--color-primary)]"
        >
          {words[index]}
          <span className="absolute bottom-[0.08em] left-1 right-1 h-[0.16em] rounded-full bg-[var(--color-primary)]/18" />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeVisual = useMemo(() => VISUALS[activeIndex], [activeIndex]);
  const prevVisual = useMemo(
    () => VISUALS[(activeIndex - 1 + VISUALS.length) % VISUALS.length],
    [activeIndex]
  );
  const nextVisual = useMemo(
    () => VISUALS[(activeIndex + 1) % VISUALS.length],
    [activeIndex]
  );

  useEffect(() => {
    if (paused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VISUALS.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      {/* Benjamin Orellana - 2026/04/21 - Fondo limpio con detalles sutiles, manteniendo una estética moderna e institucional. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,rgba(17,17,17,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute left-[-10%] top-[-12%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.10)_0%,rgba(25,211,223,0)_72%)]" />
        <div className="absolute right-[-8%] top-[8%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.10)_0%,rgba(90,151,208,0)_72%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-14 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-16">
        {/* Columna izquierda */}
        <div className="max-w-2xl">
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 uppercase max-w-xl text-[2.3rem] leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[2.5rem] lg:text-[3.6rem]"
          >
            <span className="titulo block">Limpieza</span>
            <span className="titulo block">
              <RotatingWord
                words={['técnica', 'precisa', 'profesional', 'especializada']}
              />
            </span>
            <span className="titulo block">
              para espacios que exigen calidad.
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="cuerpo mt-6 max-w-xl text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]"
          >
            En VALMAT brindamos servicios de limpieza profesional con enfoque
            técnico, planificación operativa y ejecución precisa. Trabajamos en
            finales de obra, limpieza integral, tapizados y sillones.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#contacto"
              className="cuerpo inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.01] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_42px_rgba(25,211,223,0.28)]"
            >
              Solicitar Evaluación
              <HiArrowRight className="text-[1.05rem]" />
            </a>

            <a
              href="https://wa.me/543815695970"
              className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-[1px] hover:border-slate-900 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
            >
              WhatsApp
            </a>
          </motion.div>
        </div>

        {/* Columna derecha */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mx-auto flex w-full max-w-[640px] items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Card izquierda */}
          <div className="absolute left-0 top-[10%] z-10 hidden w-[180px] rotate-[-10deg] rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_26px_60px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-2 hover:rotate-[-7deg] lg:block">
            <div className="overflow-hidden rounded-[20px] bg-slate-50">
              <img
                src={prevVisual.src}
                alt={prevVisual.alt}
                className="h-[180px] w-full object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="cuerpo text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Servicio
              </p>
              <p className="cuerpo mt-1 text-sm font-semibold text-slate-800">
                Limpieza integral
              </p>
            </div>
          </div>

          {/* Card principal */}
          <div className="relative z-20 w-full max-w-[420px] rounded-[34px] border border-slate-200 bg-white p-4 shadow-[0_34px_90px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_42px_100px_rgba(15,23,42,0.16)]">
            <div className="overflow-hidden rounded-[28px] bg-slate-50">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeVisual.id}
                  src={activeVisual.src}
                  alt={activeVisual.alt}
                  initial={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="h-[420px] w-full object-cover"
                />
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="cuerpo mt-1 text-base font-semibold text-slate-900">
                  Limpieza técnica especializada
                </p>
              </div>

              <div className="rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1.5">
                <span className="cuerpo text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Profesional
                </span>
              </div>
            </div>

            {/* Overlay flotante */}
            {/* <div className="absolute -left-6 bottom-10 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)] md:block">
              <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Metodología
              </p>
              <p className="cuerpo mt-1 text-sm font-semibold text-slate-800">
                Planificación · Gestión · Precisión
              </p>
            </div> */}
          </div>

          {/* Card derecha */}
          <div className="absolute bottom-[8%] right-0 z-10 hidden w-[180px] rotate-[10deg] rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_26px_60px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-2 hover:rotate-[7deg] lg:block">
            <div className="overflow-hidden rounded-[20px] bg-slate-50">
              <img
                src={nextVisual.src}
                alt={nextVisual.alt}
                className="h-[180px] w-full object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="cuerpo text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Especialidad
              </p>
              <p className="cuerpo mt-1 text-sm font-semibold text-slate-800">
                Finales de obra
              </p>
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute -bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
            {VISUALS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'w-8 bg-[var(--color-primary)]'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ver visual ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
