// Benjamin Orellana - 2026/04/25 - Componente de beneficios VALMAT con cards horizontales en desktop y apiladas en mobile.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiCog6Tooth,
  HiSparkles,
  HiBeaker,
  HiUser,
  HiShieldCheck,
  HiArrowUpRight
} from 'react-icons/hi2';

const BENEFICIOS = [
  {
    id: 1,
    title: 'Proceso técnico profesional',
    description: 'Inspección, planificación, ejecución y control de calidad.',
    icon: HiCog6Tooth
  },
  {
    id: 2,
    title: 'Resultados visibles',
    description:
      'Eliminamos suciedad profunda que una limpieza convencional no logra.',
    icon: HiSparkles
  },
  {
    id: 3,
    title: 'Equipamiento especializado',
    description:
      'Utilizamos tecnología y productos adecuados para cada superficie.',
    icon: HiBeaker
  },
  {
    id: 4,
    title: 'Atención personalizada',
    description:
      'Adaptamos cada servicio según el tipo de espacio y necesidad.',
    icon: HiUser
  },
  {
    id: 5,
    title: 'Cumplimiento y compromiso',
    description: 'Coordinamos y entregamos en condiciones óptimas.',
    icon: HiShieldCheck
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

const cardMotion = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
    filter: 'blur(10px)'
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function BeneficiosValmat() {
  return (
    <section className="relative overflow-hidden bg-white px-5 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-30%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.10)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-8%] bottom-[-40%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.08)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.22 }}
        className="relative mx-auto grid  grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-5"
      >
        {BENEFICIOS.map((beneficio, index) => {
          const Icon = beneficio.icon;

          return (
            <motion.article
              key={beneficio.id}
              variants={cardMotion}
              className="group relative min-h-[154px] overflow-hidden rounded-[28px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,251,254,0.90)_100%)] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-primary)]/45 hover:shadow-[0_26px_70px_rgba(15,23,42,0.11)] sm:p-5 lg:min-h-[230px]"
            >
              <div className="pointer-events-none absolute right-[-35%] top-[-35%] h-32 w-32 rounded-full bg-[var(--color-primary)]/14 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-[var(--color-primary)] shadow-[0_12px_26px_rgba(15,23,42,0.06)] transition-all duration-500 group-hover:scale-105 group-hover:border-[var(--color-primary)]/35 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <Icon className="text-[1.35rem]" />
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-500 group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)]">
                    <HiArrowUpRight className="text-[0.9rem]" />
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <p className="cuerpo text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Beneficio {String(index + 1).padStart(2, '0')}
                  </p>

                  <h3 className="titulo mt-2 text-[1.05rem] leading-tight text-slate-950 sm:text-[1.12rem]">
                    {beneficio.title}
                  </h3>

                  <p className="cuerpo mt-2 text-[0.88rem] leading-6 text-slate-600">
                    {beneficio.description}
                  </p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-0 rounded-full bg-[linear-gradient(90deg,var(--color-primary)_0%,var(--color-secondary)_100%)] transition-all duration-700 group-hover:w-full" />
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}

export default BeneficiosValmat;
