// Benjamin Orellana - 2026/04/23 - Componente externo premium para proceso global de VALMAT con timeline animado, flechas responsivas y cards comerciales full width.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiArrowRight,
  HiArrowDown,
  HiClipboardDocumentCheck,
  HiSparkles,
  HiShieldCheck,
  HiWrenchScrewdriver,
  HiCheckCircle,
  HiArrowUpRight,
  HiBolt,
  HiCursorArrowRays
} from 'react-icons/hi2';

const processSteps = [
  {
    id: 1,
    title: 'Inspección técnica',
    description:
      'Relevamos el estado del espacio, tipo de obra, superficies, suciedad presente y sectores críticos antes de definir la intervención.',
    accent: 'Evaluación inicial',
    icon: HiClipboardDocumentCheck
  },
  {
    id: 2,
    title: 'Planificación del servicio',
    description:
      'Definimos el orden de trabajo, recursos necesarios, tiempos estimados, prioridades y alcance real del servicio.',
    accent: 'Orden de trabajo',
    icon: HiWrenchScrewdriver
  },
  {
    id: 3,
    title: 'Ejecución profesional',
    description:
      'Realizamos la limpieza técnica con metodología, productos adecuados y control sobre cada etapa del proceso.',
    accent: 'Intervención técnica',
    icon: HiSparkles
  },
  {
    id: 4,
    title: 'Control final',
    description:
      'Revisamos detalles, terminaciones, puntos visibles y presentación general para entregar un resultado prolijo y profesional.',
    accent: 'Entrega cuidada',
    icon: HiShieldCheck
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 34, filter: 'blur(14px)' },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.82,
      delay,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const scaleReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.94, filter: 'blur(14px)' },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.78,
      delay,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// Benjamin Orellana - 2026/04/23 - Fondo animado premium para reforzar profundidad visual sin limitar el ancho de la sección.
function ProcessAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,rgba(15,23,42,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.16)_1px,transparent_1px)] [background-size:46px_46px]" />

      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, 28, 0, -18, 0],
          y: [0, 18, 0, -12, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute left-[-12%] top-[4%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.13)_0%,rgba(25,211,223,0)_70%)] blur-2xl"
      />

      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, -22, 0, 18, 0],
          y: [0, -14, 0, 16, 0],
          scale: [1, 1.06, 1]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute right-[-10%] top-[22%] h-[390px] w-[390px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.12)_0%,rgba(90,151,208,0)_72%)] blur-2xl"
      />

      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, 16, 0, -12, 0],
          y: [0, -12, 0, 14, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-[-16%] left-[22%] h-[330px] w-[330px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.055)_0%,rgba(15,23,42,0)_72%)] blur-2xl"
      />
    </div>
  );
}

// Benjamin Orellana - 2026/04/23 - Flecha del timeline con trazo animado horizontal en desktop y vertical en mobile.
function TimelineArrow({ index }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scaleX: 0.2, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, scaleX: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{
          duration: 0.72,
          delay: 0.52 + index * 0.28,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="hidden flex-[0.55] origin-left items-center justify-center px-2 lg:flex"
      >
        <div className="relative flex w-full items-center justify-center">
          <motion.div
            animate={{
              opacity: [0.45, 1, 0.45]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="h-px w-full bg-[linear-gradient(90deg,rgba(15,23,42,0.06),rgba(25,211,223,0.95),rgba(15,23,42,0.06))]"
          />

          <motion.div
            animate={{
              x: [-4, 4, -4],
              boxShadow: [
                '0 14px 34px rgba(15,23,42,0.08)',
                '0 18px 44px rgba(25,211,223,0.24)',
                '0 14px 34px rgba(15,23,42,0.08)'
              ]
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-cyan-100 bg-white text-[var(--color-primary)]"
          >
            <HiArrowRight className="text-[1.25rem]" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.9, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{
          duration: 0.62,
          delay: 0.52 + index * 0.24,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="flex justify-center py-3 lg:hidden"
      >
        <motion.div
          animate={{
            y: [-3, 3, -3],
            boxShadow: [
              '0 14px 34px rgba(15,23,42,0.08)',
              '0 18px 44px rgba(25,211,223,0.22)',
              '0 14px 34px rgba(15,23,42,0.08)'
            ]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-100 bg-white text-[var(--color-primary)]"
        >
          <HiArrowDown className="text-[1.25rem]" />
        </motion.div>
      </motion.div>
    </>
  );
}

// Benjamin Orellana - 2026/04/23 - Card individual del timeline con glassmorphism, número protagonista y entrada secuencial.
function ProcessStepCard({ step, index }) {
  return (
    <motion.article
      custom={0.16 + index * 0.25}
      variants={scaleReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.34 }}
      whileHover={{
        y: -8,
        rotateX: 1.4,
        rotateY: index % 2 === 0 ? -1.4 : 1.4
      }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18
      }}
      className="group relative h-full w-full overflow-hidden rounded-[36px] border border-white/90 bg-white/84 p-4 shadow-[0_28px_82px_rgba(15,23,42,0.08)] backdrop-blur-xl transform-gpu transition-colors duration-500 hover:border-cyan-200/90 lg:min-h-[280px]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute right-[-22%] top-[-28%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.22)_0%,rgba(25,211,223,0)_70%)] blur-2xl" />
        <div className="absolute bottom-[-28%] left-[-22%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.15)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(25,211,223,0.75),transparent)] opacity-60" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                '0 16px 34px rgba(15,23,42,0.07)',
                '0 20px 46px rgba(25,211,223,0.18)',
                '0 16px 34px rgba(15,23,42,0.07)'
              ]
            }}
            transition={{
              duration: 4 + index * 0.25,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex h-17 w-17 items-center justify-center rounded-[26px] border border-cyan-100 bg-[linear-gradient(135deg,rgba(25,211,223,0.16),rgba(255,255,255,0.94))] text-[2.15rem] font-black leading-none tracking-[-0.08em] text-slate-950"
          >
            {step.id}
          </motion.div>

          <motion.div
            animate={{
              rotate: [0, -4, 0, 4, 0]
            }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-950 text-cyan-200 shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
          >
            <step.icon className="text-[1.25rem]" />
          </motion.div>
        </div>

        <div className="mt-5">
          <span className="cuerpo inline-flex rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            {step.accent}
          </span>

          <h3 className="titulo mt-3 text-[1.22rem] leading-tight tracking-[-0.035em] text-slate-950 sm:text-[1.35rem]">
            {step.title}
          </h3>

          <p className="cuerpo mt-3 text-[0.9rem] leading-6 text-slate-600">
            {step.description}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: `${25 * step.id}%` }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{
                duration: 0.95,
                delay: 0.28 + index * 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary))]"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Benjamin Orellana - 2026/04/23 - Cards inferiores full width con mayor impacto visual, contraste y animaciones de aparición.
function BottomValueCards() {
  const benefits = [
    'Planificación antes de ejecutar',
    'Cuidado en superficies y detalles',
    'Equipo orientado a resultados',
    'Presentación final profesional'
  ];

  return (
    <div className="mt-8 grid w-full gap-5 lg:grid-cols-2">
      <motion.article
        initial={{ opacity: 0, x: -34, scale: 0.97, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: 0.82, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -5 }}
        className="group relative overflow-hidden rounded-[38px] border border-sky-100/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(230,248,252,0.90)_100%)] p-5 shadow-[0_28px_86px_rgba(15,23,42,0.08)] sm:p-7"
      >
        <div className="pointer-events-none absolute right-[-10%] top-[-32%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.17)_0%,rgba(25,211,223,0)_72%)] blur-2xl transition-transform duration-700 group-hover:scale-110" />
        <div className="pointer-events-none absolute left-[-16%] bottom-[-34%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.055)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />

        <div className="relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-[23px] border border-cyan-100 bg-white text-[var(--color-primary)] shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
            <HiCheckCircle className="text-[1.55rem]" />
          </div>

          <h3 className="titulo mt-5 text-[1.6rem] leading-tight tracking-[-0.045em] text-slate-950 sm:text-[1.9rem]">
            ¿Por qué elegir VALMAT?
          </h3>

          <p className="cuerpo mt-3 max-w-3xl text-[0.96rem] leading-7 text-slate-600">
            Porque una limpieza final de obra no es solo limpiar. Requiere
            técnica, orden, criterio visual y control de detalles para que el
            espacio quede listo para entregar, habitar, mostrar o inaugurar.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.52,
                  delay: 0.22 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/78 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] backdrop-blur-xl"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <HiBolt className="text-[0.86rem]" />
                </span>

                <span className="cuerpo text-[0.83rem] font-semibold text-slate-700">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, x: 34, scale: 0.97, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: 0.82, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -5 }}
        className="group relative overflow-hidden rounded-[38px] border border-slate-800 bg-[linear-gradient(135deg,#07111d_0%,#0f2530_54%,#102f38_100%)] p-5 shadow-[0_32px_96px_rgba(2,8,23,0.25)] sm:p-7"
      >
        <div className="pointer-events-none absolute left-[-12%] top-[-32%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.24)_0%,rgba(25,211,223,0)_72%)] blur-2xl transition-transform duration-700 group-hover:scale-110" />
        <div className="pointer-events-none absolute bottom-[-24%] right-[-12%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0)_72%)] blur-2xl" />

        <motion.div
          aria-hidden="true"
          animate={{
            x: ['-20%', '120%']
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1.5
          }}
          className="absolute top-0 h-full w-[34%] rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)]"
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-cyan-200" />
              <span className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/76">
                Resultado profesional
              </span>
            </div>

            <h3 className="titulo mt-5 text-[1.7rem] leading-tight tracking-[-0.05em] text-white sm:text-[2.05rem]">
              ¿Querés este resultado en tu espacio?
            </h3>
          
            <p className="cuerpo mt-3 max-w-3xl text-[0.96rem] leading-7 text-white/68">
              Coordinamos una evaluación para entender el estado del lugar,
              definir el alcance del servicio y preparar una propuesta acorde a
              tu necesidad.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-[0.86rem] font-semibold !text-white shadow-[0_18px_38px_rgba(25,211,223,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:!text-white"
            >
              Solicitar evaluación
              <HiArrowUpRight className="text-[1rem]" />
            </a>

            <a
              href="https://wa.me/543815695970"
              target="_blank"
              rel="noreferrer"
              className="cuerpo inline-flex items-center justify-center gap-2 rounded-full border border-white/16 bg-white/10 px-5 py-3 text-[0.86rem] font-semibold !text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:bg-white/16 hover:!text-white"
            >
              Consultar por WhatsApp
              <HiCursorArrowRays className="text-[1rem]" />
            </a>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function ValmatProceso() {
  return (
    <section
      id="proceso"
      className="relative w-full overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_48%,#ffffff_100%)] py-14 sm:py-16 lg:py-20"
    >
      <ProcessAmbientBackground />

      <div className="relative w-full px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="w-full"
        >
          <motion.div
            custom={0.08}
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />

            <span className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Nuestro proceso
            </span>
          </motion.div>

          <motion.div
            custom={0.16}
            variants={fadeUp}
            className="mt-5 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end"
          >
            <h2 className="titulo text-3xl uppercase leading-[1.03] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Así trabajamos una{' '}
              <span className="text-[var(--color-primary)]">
                limpieza final de obra
              </span>
            </h2>
          </motion.div>
        </motion.div>

        {/* Benjamin Orellana - 2026/04/23 - Timeline full width con entrada secuencial, flechas vivas y cards premium. */}
        <div className="mt-10 w-full">
          <div className="flex w-full flex-col lg:flex-row lg:items-stretch">
            {processSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="w-full lg:flex-[1.2]">
                  <ProcessStepCard step={step} index={index} />
                </div>

                {index < processSteps.length - 1 && (
                  <TimelineArrow index={index} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <BottomValueCards />
      </div>
    </section>
  );
}

export default ValmatProceso;
