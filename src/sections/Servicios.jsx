// Benjamin Orellana - 2026/04/22 - Sección de servicios optimizada para reducir altura, limpiar overlays sobre video y mejorar densidad visual/UX sin perder contenido.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiArrowUpRight,
  HiCheckBadge,
  HiSparkles,
  HiShieldCheck,
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
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
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
    processTitle: 'Nuestro proceso',
    process: [
      'Inspección técnica',
      'Planificación del servicio',
      'Ejecución profesional',
      'Control final de calidad'
    ],
    whyTitle: '¿Por qué es necesario?',
    whyItMatters:
      'El polvo de obra se deposita en todas las superficies y no se elimina con limpieza convencional. Una limpieza técnica garantiza una entrega profesional.',
    resultTitle: '¿Querés este resultado en tu espacio?',
    resultDescription:
      'Coordinamos una visita técnica para evaluar el trabajo, definir alcance y planificar la intervención de forma profesional.',
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
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80',
    description:
      'Este servicio está preparado para presentar hogares con una imagen limpia, cuidada y profesional. Dejamos la estructura lista para sumar la información exacta que te pase el cliente.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Limpieza general de ambientes',
      'Orden visual y terminación cuidada',
      'Superficies y sectores de uso frecuente',
      'Detalle final según alcance acordado'
    ],
    processTitle: 'Nuestro proceso',
    process: [
      'Relevamiento del espacio',
      'Definición del alcance',
      'Ejecución del servicio',
      'Revisión y cierre final'
    ],
    whyTitle: '¿Por qué es importante?',
    whyItMatters:
      'Una limpieza bien ejecutada mejora la presencia general del espacio, aporta confort y transmite orden desde el primer vistazo.',
    resultTitle: 'Preparado para completar',
    resultDescription:
      'Cuando el cliente te pase el detalle definitivo, esta card ya está lista para cargar la información sin tocar la estructura.',
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
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    description:
      'Dejamos este bloque preparado para completar con la información formal del cliente. La idea es conservar la misma jerarquía visual y el mismo patrón de lectura del servicio principal.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Evaluación inicial del material',
      'Proceso de limpieza según superficie',
      'Tratamiento visual y sanitario',
      'Terminación cuidada'
    ],
    processTitle: 'Nuestro proceso',
    process: [
      'Evaluación del tapizado',
      'Definición del método',
      'Limpieza profesional',
      'Control del resultado'
    ],
    whyTitle: '¿Por qué conviene hacerlo?',
    whyItMatters:
      'Los tapizados y superficies delicadas requieren un tratamiento específico para mejorar presencia, higiene y conservación sin comprometer su terminación.',
    resultTitle: 'Preparado para completar',
    resultDescription:
      'Cuando te pasen el contenido definitivo, solo reemplazás los textos de este objeto y mantenés intacto el diseño.',
    ctaLabel: 'Solicitar este servicio',
    secondaryCtaLabel: 'Pedir asesoramiento',
    icon: HiSparkles
  }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
  }
};

// Benjamin Orellana - 2026/04/22 - Media del servicio sin textos superpuestos para priorizar limpieza visual, mejor lectura y menor ruido sobre el video.
function ServiceMedia({ service, reverse }) {
  return (
    <div
      className={`relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-full ${
        reverse ? 'lg:order-2' : ''
      }`}
    >
      <div className="absolute inset-0">
        {service.mediaType === 'video' ? (
          <video
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={service.mediaPoster}
          >
            <source src={service.mediaSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.02)_35%,rgba(15,23,42,0.18)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.16)_100%)]" />
    </div>
  );
}

// Benjamin Orellana - 2026/04/22 - Proceso rediseñado en formato compacto para reducir altura, evitar desbordes y mantener buena lectura en mobile y desktop.
function ProcessFlow({ steps }) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.88)_0%,rgba(255,255,255,1)_100%)] p-3.5 sm:p-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={`${step}-${index}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: index * 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="group relative flex min-h-[112px] flex-col rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_18px_34px_rgba(15,23,42,0.06)] sm:min-h-[118px] sm:p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                {index + 1}
              </div>

              <span className="h-1.5 w-10 rounded-full bg-[var(--color-primary)]/14 sm:w-12" />
            </div>

            <div className="mt-3 flex flex-1 items-end">
              <p className="cuerpo break-words text-[0.88rem] font-semibold leading-5 text-slate-700 sm:text-[0.92rem]">
                {step}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Servicios() {
  return (
    <>
      <section
        id="servicios"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfd_52%,#ffffff_100%)] py-16 sm:py-20 lg:py-24"
      >
        {/* Benjamin Orellana - 2026/04/22 - Capas decorativas suavizadas para conservar profundidad sin recargar visualmente la sección. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-8%] top-[6%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.10)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
          <div className="absolute right-[-10%] top-[24%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.10)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
          <div className="absolute bottom-[-8%] left-[12%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            className="mx-auto max-w-3xl text-center"
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

          <div className="mt-12 space-y-7 sm:mt-14 lg:mt-16 lg:space-y-8">
            {services.map((service, index) => {
              const reverse = index % 2 !== 0;

              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.16 }}
                  transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                  className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl"
                >
                  <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
                    <ServiceMedia service={service} reverse={reverse} />

                    <div
                      className={`flex items-center ${reverse ? 'lg:order-1' : ''}`}
                    >
                      <div className="w-full p-5 sm:p-7 lg:p-8 xl:p-9">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/90 px-3.5 py-2 text-slate-700">
                            <service.icon className="text-[0.95rem] text-[var(--color-primary)]" />
                            <span className="cuerpo text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {service.eyebrow}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                            <HiCheckBadge className="text-[0.9rem] text-[var(--color-primary)]" />
                            <span className="cuerpo text-[0.76rem] font-semibold uppercase tracking-[0.16em]">
                              Servicio especializado
                            </span>
                          </div>
                        </div>

                        <h3 className="font-messina mt-4 text-[2rem] leading-[0.98] tracking-tight text-slate-950 sm:text-[2.25rem] lg:text-[2.5rem]">
                          {service.title}
                        </h3>

                        <p className="cuerpo mt-3 text-[0.98rem] font-medium leading-7 text-slate-700 sm:text-[1rem]">
                          {service.subtitle}
                        </p>

                        <p className="cuerpo mt-4 text-[0.96rem] leading-7 text-slate-600 sm:text-[1rem]">
                          {service.description}
                        </p>

                        {/* Benjamin Orellana - 2026/04/22 - Reorganización compacta del contenido interno para reducir scroll y mantener una lectura más ordenada por bloques. */}
                        <div className="mt-7 space-y-5">
                          <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.75)_0%,rgba(255,255,255,1)_100%)] p-4 sm:p-5">
                            <h4 className="titulo text-[1rem] font-semibold text-slate-950 sm:text-[1.08rem]">
                              {service.includesTitle}
                            </h4>

                            {/* Benjamin Orellana - 2026/04/22 - Se agrega animación progresiva a los ítems del bloque de features para mejorar percepción visual y ritmo de lectura. */}
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {service.features.map((feature, index) => (
                                <motion.div
                                  key={feature}
                                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                  viewport={{ once: true, amount: 0.3 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: index * 0.14,
                                    ease: [0.22, 1, 0.36, 1]
                                  }}
                                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.035)] transition-all duration-300 hover:border-sky-200 hover:shadow-[0_16px_28px_rgba(15,23,42,0.05)]"
                                >
                                  <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                                    <HiCheckBadge className="text-[0.85rem]" />
                                  </span>

                                  <span className="cuerpo text-[0.9rem] font-medium leading-6 text-slate-700">
                                    {feature}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Benjamin Orellana - 2026/04/22 - Se separa el bloque "Por qué es necesario" debajo del proceso para reducir ruido lateral y mejorar la jerarquía visual. */}
                          <div className="space-y-5">
                            <div>
                              <h4 className="titulo mb-3 text-[1rem] font-semibold text-slate-950 sm:text-[1.08rem]">
                                {service.processTitle}
                              </h4>

                              <ProcessFlow steps={service.process} />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                                <h4 className="titulo text-[1rem] font-semibold text-slate-950 sm:text-[1.08rem]">
                                  {service.whyTitle}
                                </h4>

                                <p className="cuerpo mt-2.5 text-[0.94rem] leading-7 text-slate-600">
                                  {service.whyItMatters}
                                </p>
                              </div>

                              <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,1)_100%)] p-4">
                                <h4 className="titulo text-[1rem] font-semibold text-slate-950 sm:text-[1.08rem]">
                                  {service.resultTitle}
                                </h4>

                                <p className="cuerpo mt-2.5 text-[0.94rem] leading-7 text-slate-600">
                                  {service.resultDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                          <a
                            href="#contacto"
                            className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_42px_rgba(25,211,223,0.26)]"
                          >
                            {service.ctaLabel}
                            <HiArrowUpRight className="text-[1rem]" />
                          </a>

                          <a
                            href="#contacto"
                            className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          >
                            {service.secondaryCtaLabel}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Servicios;
