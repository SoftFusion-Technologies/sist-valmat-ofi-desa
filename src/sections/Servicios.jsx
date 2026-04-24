// Benjamin Orellana - 2026/04/23 - Sección de servicios compacta, moderna y sin bloques repetidos de proceso, motivos y resultado final.

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiArrowUpRight,
  HiArrowsPointingOut,
  HiCheckBadge,
  HiSparkles,
  HiShieldCheck,
  HiXMark,
  HiWrenchScrewdriver
} from 'react-icons/hi2';

const services = [
  {
    id: 1,
    eyebrow: 'Limpieza técnica',
    title: 'Final de obra',
    subtitle:
      'Limpieza técnica final de obra con planificación y control de calidad',
    mediaType: 'video',
    mediaSrc: '/videos/final-obra.mp4',
    mediaPoster: '/videos/posters/final-obra.jpg',
    description:
      'Realizamos limpiezas técnicas finales de obra con un enfoque profesional, ordenado y controlado. El servicio está pensado para dejar el espacio en condiciones reales de entrega, uso o presentación.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Eliminación de polvo fino',
      'Limpieza de pisos y zócalos',
      'Detalles en aberturas y superficies',
      'Limpieza de sanitarios y cocina',
      'Limpieza de cristales según alcance',
      'Revisión final'
    ],
    ctaLabel: 'Solicitar visita técnica',
    secondaryCtaLabel: 'Pedir asesoramiento',
    icon: HiWrenchScrewdriver
  },
  {
    id: 2,
    eyebrow: 'Espacios impecables',
    title: 'Hogares',
    subtitle: 'Limpieza integral para hogares con ejecución cuidada',
    mediaType: 'video',
    mediaSrc: '/videos/hogares.mp4',
    mediaPoster: '/videos/posters/hogares.jpg',
    description:
      'Este servicio está preparado para presentar hogares con una imagen limpia, cuidada y profesional. Dejamos la estructura lista para sumar la información exacta.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Limpieza general de ambientes',
      'Orden visual y terminación cuidada',
      'Superficies y sectores de uso frecuente',
      'Detalle final según alcance acordado'
    ],
    ctaLabel: 'Solicitar este servicio',
    secondaryCtaLabel: 'Pedir asesoramiento',
    icon: HiShieldCheck
  },
  {
    id: 3,
    eyebrow: 'Detalle profesional',
    title: 'Tapizados',
    subtitle: 'Limpieza de tapizados y superficies delicadas',
    mediaType: 'video',
    mediaSrc: '/videos/tapizado.mp4',
    mediaPoster: '/videos/posters/tapizado.jpg',
    description:
      'Servicio orientado a superficies delicadas, tapizados y elementos que requieren una intervención más precisa, cuidada y profesional.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Evaluación inicial del material',
      'Proceso de limpieza según superficie',
      'Tratamiento visual y sanitario',
      'Terminación cuidada'
    ],
    ctaLabel: 'Solicitar este servicio',
    secondaryCtaLabel: 'Pedir asesoramiento',
    icon: HiSparkles
  }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] }
  }
};

// Benjamin Orellana - 2026/04/23 - Modal premium para expandir el video del servicio sin salir de la sección.
function ExpandedServiceVideo({ service, onClose }) {
  if (!service) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          aria-label="Cerrar video expandido"
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/82 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(10px)' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/16 bg-slate-950 shadow-[0_34px_120px_rgba(0,0,0,0.55)]"
        >
          <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-white backdrop-blur-xl">
            <service.icon className="text-[1rem] text-cyan-200" />
            <span className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/82">
              {service.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar video"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20"
          >
            <HiXMark className="text-[1.35rem]" />
          </button>

          <div className="relative aspect-[16/10] w-full bg-slate-950 sm:aspect-video">
            {service.mediaType === 'video' ? (
              <video
                className="h-full w-full object-cover"
                src={service.mediaSrc}
                poster={service.mediaPoster}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <img
                src={service.mediaSrc}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.72)_100%)]" />

            <div className="absolute bottom-5 left-5 right-5 z-20">
              <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                Servicio VALMAT
              </p>

              <h3 className="titulo mt-1 text-[2rem] leading-none tracking-[-0.05em] text-white sm:text-[2.65rem]">
                {service.title}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Benjamin Orellana - 2026/04/23 - Media compacta con botón de expandir video integrado en el badge superior.
function ServiceMedia({ service, onExpand }) {
  return (
    <div className="relative h-[170px] overflow-hidden rounded-[26px] border border-white/70 bg-slate-950 shadow-[0_22px_54px_rgba(15,23,42,0.14)] sm:h-[190px] xl:h-[175px]">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.05)_35%,rgba(2,6,23,0.66)_100%)]" />

      {service.mediaType === 'video' ? (
        <video
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.055]"
          src={service.mediaSrc}
          poster={service.mediaPoster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={service.mediaSrc}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.055]"
        />
      )}

      <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/16 px-2 py-1.5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Expandir video de ${service.title}`}
          className="group/expand flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/14 text-white transition-all duration-300 hover:scale-105 hover:border-cyan-200/60 hover:bg-cyan-200/20"
        >
          <HiArrowsPointingOut className="text-[0.95rem] transition-transform duration-300 group-hover/expand:scale-110" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-3">
        <div>
          <h3 className="titulo mt-1 text-[1.45rem] leading-none tracking-[-0.045em] text-white sm:text-[1.65rem]">
            {service.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
// Benjamin Orellana - 2026/04/23 - Card de servicio simplificada para mostrar solo descripción, alcance incluido y acciones comerciales.
function ServiceCard({ service, index, onExpand }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.66,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[34px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(226,247,252,0.80)_100%)] p-3 shadow-[0_26px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-200/90 hover:shadow-[0_34px_90px_rgba(15,23,42,0.12)] sm:p-4"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute right-[-18%] top-[-18%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.18)_0%,rgba(25,211,223,0)_70%)] blur-2xl" />
        <div className="absolute bottom-[-22%] left-[-18%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.14)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <div className="relative z-10">
        <ServiceMedia service={service} onExpand={() => onExpand(service)} />
        <div className="px-1 pt-4 sm:px-2">
          <p className="cuerpo text-[0.9rem] leading-6 text-slate-600">
            {service.description}
          </p>
        </div>

        {/* Benjamin Orellana - 2026/04/23 - El bloque de incluye aparece recién al llegar con scroll y con animación más lenta. */}
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.975, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.42 }}
          transition={{
            duration: 0.92,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="mt-4 rounded-[26px] border border-white/90 bg-white/72 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <h4 className="titulo text-[0.94rem] font-semibold text-slate-950">
              {service.includesTitle}
            </h4>

            <span className="hidden rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] sm:inline-flex">
              Incluye
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {service.features.map((feature, featureIndex) => (
              <motion.div
                key={feature}
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.97,
                  filter: 'blur(8px)'
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)'
                }}
                viewport={{ once: true, amount: 0.48 }}
                transition={{
                  duration: 0.62,
                  delay: 0.14 + featureIndex * 0.09,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex items-start gap-2.5 rounded-2xl border border-sky-100/80 bg-white/90 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.025)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                  <HiCheckBadge className="text-[0.78rem]" />
                </span>

                <span className="cuerpo text-[0.82rem] font-medium leading-5 text-slate-700">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <a
            href="#contacto"
            className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-[0.82rem] font-semibold text-white shadow-[0_16px_32px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_40px_rgba(25,211,223,0.26)]"
          >
            {service.ctaLabel}
            <HiArrowUpRight className="text-[0.95rem]" />
          </a>

          <a
            href="#contacto"
            className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-[0.82rem] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            {service.secondaryCtaLabel}
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function Servicios() {
  const [expandedService, setExpandedService] = useState(null);

  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfe_52%,#ffffff_100%)] py-14 sm:py-16 lg:py-18"
    >
      <ExpandedServiceVideo
        service={expandedService}
        onClose={() => setExpandedService(null)}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[6%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.11)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[18%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.09)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-8%] left-[14%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.035)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      <div className="relative w-full px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Nuestros servicios
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="titulo mt-5 text-3xl uppercase leading-[1.03] tracking-tight text-slate-950 sm:text-3xl lg:text-4xl"
          >
            Soluciones de{' '}
            <span className="text-[var(--color-primary)]">limpieza</span>{' '}
            pensadas para verse bien y funcionar mejor
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="cuerpo mx-auto mt-5 max-w-2xl text-[0.98rem] leading-7 text-slate-600 sm:text-[1.03rem]"
          >
            En VALMAT combinamos criterio técnico, planificación y ejecución
            profesional para intervenir espacios con detalle, prolijidad y una
            presentación final a la altura de cada necesidad.
          </motion.p>
        </motion.div>

        {/* Benjamin Orellana - 2026/04/23 - Grid compacto de servicios para reducir altura visual y mantener lectura clara en desktop y mobile. */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onExpand={setExpandedService}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Servicios;
