// Benjamin Orellana - 2026/04/24 - Página NotFound premium para rutas inexistentes y servicios no encontrados en VALMAT.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiArrowUpRight,
  HiExclamationTriangle,
  HiHome,
  HiSparkles,
  HiWrenchScrewdriver
} from 'react-icons/hi2';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { services } from '../data/valmatServices';

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.68,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

function NotFound({ logoSrc, variant = 'page' }) {
  const navigate = useNavigate();

  const isService = variant === 'service';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <>
      <Navbar logoSrc={logoSrc} />

      <main className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfe_52%,#ffffff_100%)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.14)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
          <div className="absolute right-[-12%] top-[22%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.12)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
          <div className="absolute bottom-[-12%] left-[24%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.045)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
        </div>

        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
        >
          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={handleBack}
              className="cuerpo inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/88 px-4 py-2.5 text-[0.82rem] font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <HiArrowLeft className="text-[0.95rem]" />
              Volver atrás
            </button>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                <HiExclamationTriangle className="text-[1rem]" />
              </span>

              <span className="cuerpo text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {isService ? 'Servicio no encontrado' : 'Página no encontrada'}
              </span>
            </div>

            <h1 className="titulo mt-6 text-4xl uppercase leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
              {isService ? (
                <>
                  Este servicio no está disponible en{' '}
                  <span className="text-[var(--color-primary)]">VALMAT</span>
                </>
              ) : (
                <>
                  Esta página no existe o cambió de{' '}
                  <span className="text-[var(--color-primary)]">ubicación</span>
                </>
              )}
            </h1>

            <p className="cuerpo mt-6 max-w-2xl text-[1.02rem] leading-8 text-slate-600 sm:text-[1.08rem]">
              Podés volver al inicio, revisar los servicios disponibles o
              completar el formulario para consultar directamente con VALMAT.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/#inicio"
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3.5 text-[0.9rem] font-semibold text-white shadow-[0_18px_36px_rgba(25,211,223,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)]"
              >
                Ir al inicio
                <HiHome className="text-[1rem]" />
              </Link>

              <Link
                to="/#servicios"
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3.5 text-[0.9rem] font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Ver servicios
                <HiArrowUpRight className="text-[1rem]" />
              </Link>

              <Link
                to="/#contacto"
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3.5 text-[0.9rem] font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Contactar
                <HiSparkles className="text-[1rem]" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-[38px] border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(228,248,253,0.78)_100%)] p-5 shadow-[0_34px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6 lg:p-7"
          >
            <div className="pointer-events-none absolute right-[-18%] top-[-25%] h-64 w-64 rounded-full bg-[var(--color-primary)]/18 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-28%] left-[-16%] h-64 w-64 rounded-full bg-slate-950/5 blur-3xl" />

            <div className="relative rounded-[30px] border border-white/80 bg-white/74 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Error
                  </p>

                  <h2 className="titulo mt-2 text-[4.8rem] leading-none tracking-[-0.08em] text-slate-950 sm:text-[6rem]">
                    404
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[var(--color-primary)] text-white shadow-[0_18px_40px_rgba(25,211,223,0.24)]">
                  <HiWrenchScrewdriver className="text-[1.55rem]" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {services.slice(0, 3).map((service) => {
                  const Icon = service.icon;

                  return (
                    <Link
                      key={service.id}
                      to={`/servicios/${service.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-[24px] border border-sky-100 bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                          <Icon className="text-[1.05rem]" />
                        </span>

                        <div className="min-w-0">
                          <p className="cuerpo truncate text-[0.95rem] font-bold text-slate-950">
                            {service.title}
                          </p>

                          <p className="cuerpo mt-0.5 truncate text-[0.78rem] text-slate-500">
                            {service.eyebrow}
                          </p>
                        </div>
                      </div>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-300 group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white">
                        <HiArrowUpRight className="text-[0.95rem]" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      <Footer logoSrc={logoSrc} />
    </>
  );
}

export default NotFound;
