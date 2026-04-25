// Benjamin Orellana - 2026/04/25 - Componente premium de beneficios VALMAT con layout horizontal en desktop y cards apiladas en mobile.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiCog6Tooth,
  HiSparkles,
  HiBeaker,
  HiUser,
  HiShieldCheck,
  HiCheckBadge
} from 'react-icons/hi2';

const BENEFICIOS = [
  {
    id: 1,
    title: 'Proceso técnico profesional',
    description: 'Inspección, planificación, ejecución y control.',
    icon: HiCog6Tooth
  },
  {
    id: 2,
    title: 'Resultados visibles',
    description: 'Limpieza profunda con terminación superior.',
    icon: HiSparkles
  },
  {
    id: 3,
    title: 'Equipamiento especializado',
    description: 'Productos y herramientas según cada superficie.',
    icon: HiBeaker
  },
  {
    id: 4,
    title: 'Atención personalizada',
    description: 'Cada servicio se adapta al espacio y necesidad.',
    icon: HiUser
  },
  {
    id: 5,
    title: 'Cumplimiento y compromiso',
    description: 'Coordinación clara y entrega en condiciones óptimas.',
    icon: HiShieldCheck
  }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.075
    }
  }
};

const itemMotion = {
  hidden: {
    opacity: 0,
    y: 22,
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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_55%,#ffffff_100%)] px-5 py-9 sm:px-6 sm:py-11 lg:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-28%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.12)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] bottom-[-36%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.10)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <div className="relative mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 flex items-center justify-between gap-4 sm:mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-4 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
              <HiCheckBadge className="text-[0.95rem]" />
            </span>

            <span className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-500">
              Beneficios
            </span>
          </div>

          <div className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(25,211,223,0.22)_0%,rgba(15,23,42,0.06)_55%,transparent_100%)] sm:block" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="relative"
        >
          <div className="absolute left-0 right-0 top-[42px] hidden h-px bg-[linear-gradient(90deg,transparent_0%,rgba(25,211,223,0.25)_15%,rgba(25,211,223,0.18)_85%,transparent_100%)] lg:block" />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-3 xl:gap-4">
            {BENEFICIOS.map((beneficio, index) => {
              const Icon = beneficio.icon;

              return (
                <motion.article
                  key={beneficio.id}
                  variants={itemMotion}
                  className="group relative overflow-hidden rounded-[28px] border border-sky-100/90 bg-white/86 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-primary)]/45 hover:bg-white hover:shadow-[0_28px_76px_rgba(15,23,42,0.10)] sm:p-5 lg:min-h-[218px]"
                >
                  <div className="pointer-events-none absolute right-[-35%] top-[-35%] h-36 w-36 rounded-full bg-[var(--color-primary)]/14 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-[22px] bg-[var(--color-primary)]/16 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#effbff_100%)] text-[var(--color-primary)] shadow-[0_14px_30px_rgba(15,23,42,0.07)] transition-all duration-500 group-hover:scale-105 group-hover:border-[var(--color-primary)]/40 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                          <Icon className="text-[1.45rem]" />
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.66rem] font-black tracking-[0.12em] text-slate-400 transition-all duration-500 group-hover:border-[var(--color-primary)]/35 group-hover:bg-[var(--color-primary)]/8 group-hover:text-[var(--color-primary)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="titulo text-[1.08rem] leading-tight tracking-[-0.02em] text-slate-950">
                        {beneficio.title}
                      </h3>

                      <p className="cuerpo mt-2 text-[0.88rem] leading-6 text-slate-600">
                        {beneficio.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-0 rounded-full bg-[linear-gradient(90deg,var(--color-primary)_0%,var(--color-secondary)_100%)] transition-all duration-700 group-hover:w-full" />
                      </div>

                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-40 transition-all duration-500 group-hover:opacity-100" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default BeneficiosValmat;
