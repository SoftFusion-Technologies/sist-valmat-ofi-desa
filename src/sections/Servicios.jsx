// Benjamin Orellana - 2026/04/22 - Sección moderna y animada para presentar los servicios principales de VALMAT con imágenes ilustrativas y layout responsive.

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiArrowUpRight,
  HiCheckBadge,
  HiSparkles,
  HiShieldCheck,
  HiWrenchScrewdriver
} from 'react-icons/hi2';
import ServicesVideosShowcase from '../components/sections/ServicesVideosShowcase';

const services = [
  {
    id: 1,
    eyebrow: 'Limpieza técnica',
    title: 'Final de obra',
    description:
      'Intervenimos espacios luego de obra con un enfoque técnico y ordenado. Eliminamos restos de material, polvo fino, marcas y residuos para dejar cada ambiente listo para su uso o entrega.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
    features: [
      'Retiro de restos y suciedad de obra',
      'Limpieza profunda de superficies',
      'Preparación final para entrega'
    ],
    icon: HiWrenchScrewdriver
  },
  {
    id: 2,
    eyebrow: 'Espacios impecables',
    title: 'Limpieza integral para hogares y empresas',
    description:
      'Brindamos un servicio de limpieza completo, organizado y profesional para mantener ambientes limpios, prolijos y listos para recibir personas, trabajar o habitar con comodidad.',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80',
    features: [
      'Rutinas planificadas según necesidad',
      'Cobertura para espacios residenciales y comerciales',
      'Ejecución cuidada y consistente'
    ],
    icon: HiShieldCheck
  },
  {
    id: 3,
    eyebrow: 'Detalle profesional',
    title: 'Tapizados, sillones y superficies delicadas',
    description:
      'Aplicamos procesos específicos para recuperar tapizados y superficies que requieren mayor cuidado. Mejoramos presencia, higiene y conservación sin perder terminación visual.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    features: [
      'Tratamiento cuidadoso de materiales',
      'Mejora visual y sanitización',
      'Proceso orientado a preservar el mobiliario'
    ],
    icon: HiSparkles
  }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  }
};

function Servicios() {
  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfd_52%,#ffffff_100%)] py-20 sm:py-24 lg:py-28"
    >
      {/* Benjamin Orellana - 2026/04/22 - Capas decorativas para dar profundidad y sensación premium a la sección. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[6%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.12)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[24%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.12)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-8%] left-[12%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
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
            className="titulo uppercase mt-6 text-3xl leading-[1.05] tracking-tight text-slate-950 sm:text-3xl lg:text-4xl"
          >
            Soluciones de{' '}
            <span className="text-[var(--color-primary)]">limpieza</span>{' '}
            pensadas para verse bien y funcionar mejor
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="cuerpo mx-auto mt-6 max-w-2xl text-[1.05rem] leading-8 text-slate-600 sm:text-[1.1rem]"
          >
            En VALMAT combinamos criterio técnico, planificación y ejecución
            profesional para intervenir espacios con detalle, prolijidad y una
            presentación final a la altura de cada necesidad.
          </motion.p>
        </motion.div>

        <div className="mt-14 space-y-8 sm:mt-16 lg:mt-20 lg:space-y-10">
          {services.map((service, index) => {
            const Icon = service.icon;
            const reverse = index % 2 !== 0;

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 42 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`group grid overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-2 ${
                  reverse ? 'lg:[&>div:first-child]:order-2' : ''
                }`}
              >
                <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px] lg:min-h-[520px]">
                  <div className="absolute inset-0">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.10)_0%,rgba(15,23,42,0.02)_30%,rgba(15,23,42,0.45)_100%)]" />

                  <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/14 px-3 py-2 text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] backdrop-blur-md">
                      <Icon className="text-[1rem]" />
                      <span className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                        {service.eyebrow}
                      </span>
                    </div>
                  </div>

                  {/* <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-xl rounded-[24px] border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md sm:p-5">
                      <p className="titulo uppercase text-[1.2rem] leading-tight sm:text-[1.45rem] lg:text-[1.7rem]">
                        {service.title}
                      </p>
                      <p className="cuerpo mt-2 text-sm leading-6 text-white/80 sm:text-[0.97rem]">
                        Presentación cuidada, ejecución precisa y enfoque en el
                        resultado final.
                      </p>
                    </div>
                  </div> */}
                </div>

                <div className="flex items-center">
                  <div className="w-full p-6 sm:p-8 lg:p-10 xl:p-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/90 px-3.5 py-2 text-slate-700">
                      <HiCheckBadge className="text-[1rem] text-[var(--color-primary)]" />
                      <span className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Servicio especializado
                      </span>
                    </div>

                    <h3 className="font-messina font-style: italic  mt-5 text-3xl leading-[1.08] tracking-tight text-slate-950 sm:text-4xl">
                      {service.title}
                    </h3>

                    <p className="cuerpo mt-5 text-[1rem] leading-8 text-slate-600 sm:text-[1.04rem]">
                      {service.description}
                    </p>

                    <div className="mt-7 grid gap-3">
                      {service.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 transition-all duration-300 hover:border-sky-200 hover:bg-white hover:shadow-[0_16px_30px_rgba(15,23,42,0.05)]"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                            <HiCheckBadge className="text-[0.95rem]" />
                          </span>
                          <span className="cuerpo text-[0.95rem] font-medium leading-6 text-slate-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <a
                        href="#contacto"
                        className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_42px_rgba(25,211,223,0.26)]"
                      >
                        Solicitar este servicio
                        <HiArrowUpRight className="text-[1rem]" />
                      </a>

                      <a
                        href="#contacto"
                        className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        Pedir asesoramiento
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Servicios;
