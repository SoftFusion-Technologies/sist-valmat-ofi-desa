// Benjamin Orellana - 2026/04/23 - Sección de servicios optimizada a ancho completo, con cards más anchas, fondo celeste más presente y mejor aprovechamiento horizontal para reducir scroll.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiArrowUpRight,
  HiCheckBadge,
  HiSparkles,
  HiShieldCheck,
  HiWrenchScrewdriver,
  HiPlay
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
    description:
      'Este servicio está preparado para presentar hogares con una imagen limpia, cuidada y profesional. Dejamos la estructura lista para sumar la información exacta.',
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
      'lista para cargar la información sin tocar la estructura.',
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
      'completar con la información formal . La idea es conservar la misma jerarquía visual y el mismo patrón de lectura del servicio principal.',
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

// Benjamin Orellana - 2026/04/23 - Se corrige el bloque de proceso para evitar cortes feos dentro de palabras y mejorar la lectura de cada paso.
function CompactProcessFlow({ steps }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {steps.map((step, index) => (
        <motion.div
          key={`${step}-${index}`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.42,
            delay: index * 0.06,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-sky-100/90 bg-white/92 px-3.5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.035)]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/14 text-[0.78rem] font-bold text-[var(--color-primary)]">
            {index + 1}
          </div>

          <p className="cuerpo flex-1 text-[0.84rem] font-medium leading-[1.35] text-slate-700 break-normal [word-break:normal] [overflow-wrap:normal]">
            {step}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// Benjamin Orellana - 2026/04/23 - Se reorganiza el contenido interno de la card para que "Nuestro proceso" quede debajo de "¿Qué incluye?" y el ancho se aproveche mejor.
function ServiceCard({ service, index }) {
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
      className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(225,247,252,0.92)_0%,rgba(210,241,249,0.92)_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
          <service.icon className="text-[0.95rem] text-[var(--color-primary)]" />
          <span className="cuerpo text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {service.eyebrow}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-messina text-[1.8rem] leading-[0.94] tracking-tight text-slate-950 sm:text-[2rem]">
          {service.title}
        </h3>

        {/* <p className="cuerpo mt-2 text-[0.9rem] font-medium leading-6 text-slate-700">
          {service.subtitle}
        </p> */}

        <p className="cuerpo mt-3 text-[0.9rem] leading-6 text-slate-600">
          {service.description}
        </p>
      </div>

      {/* Benjamin Orellana - 2026/04/23 - Incluye arriba, proceso debajo y bloques informativos al final para ocupar mejor el ancho y no la altura. */}
      <div className="mt-5 grid gap-4">
        <div className="rounded-[24px] border border-white/90 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
          <h4 className="titulo text-[0.94rem] font-semibold text-slate-950">
            {service.includesTitle}
          </h4>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {service.features.map((feature, featureIndex) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: featureIndex * 0.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex items-start gap-2.5 rounded-2xl border border-sky-100/90 bg-white/94 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.03)]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                  <HiCheckBadge className="text-[0.78rem]" />
                </span>

                <span className="cuerpo text-[0.83rem] font-medium leading-5 text-slate-700">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/90 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
          <h4 className="titulo mb-3 text-[0.94rem] font-semibold text-slate-950">
            {service.processTitle}
          </h4>

          <CompactProcessFlow steps={service.process} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/90 bg-white/76 p-4 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
            <h4 className="titulo text-[0.9rem] font-semibold text-slate-950">
              {service.whyTitle}
            </h4>

            <p className="cuerpo mt-2 text-[0.84rem] leading-6 text-slate-600">
              {service.whyItMatters}
            </p>
          </div>

          <div className="rounded-[22px] border border-white/90 bg-white/76 p-4 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
            <h4 className="titulo text-[0.9rem] font-semibold text-slate-950">
              {service.resultTitle}
            </h4>

            <p className="cuerpo mt-2 text-[0.84rem] leading-6 text-slate-600">
              {service.resultDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <a
          href="#contacto"
          className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-[0.82rem] font-semibold text-white shadow-[0_16px_32px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_40px_rgba(25,211,223,0.26)]"
        >
          {service.ctaLabel}
          <HiArrowUpRight className="text-[0.95rem]" />
        </a>

        <a
          href="#contacto"
          className="cuerpo inline-flex items-center justify-center rounded-full border border-white/90 bg-white/84 px-4 py-3 text-[0.82rem] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {service.secondaryCtaLabel}
        </a>
      </div>
    </motion.article>
  );
}

function Servicios() {
  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfe_52%,#ffffff_100%)] py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[6%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.11)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[18%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.09)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-8%] left-[14%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.035)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      {/* Benjamin Orellana - 2026/04/23 - Se elimina el ancho máximo para que la sección aproveche todo el largo disponible y reduzca sensación de altura. */}
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

        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Servicios;
