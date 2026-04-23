import React from 'react';
import { motion } from 'framer-motion';
import {
  HiMapPin,
  HiCheckBadge,
  HiClock,
  HiPhoneArrowUpRight,
  HiSparkles
} from 'react-icons/hi2';

// Benjamin Orellana - 2026/04/22 - Componente de zonas de cobertura para exhibir de forma moderna, clara y responsive las áreas donde presta servicio la empresa.

const COVERAGE_ZONES = [
  {
    id: 1,
    name: 'Concepción',
    status: 'active',
    description:
      'Cobertura operativa activa para coordinación habitual de servicios.',
    badge: 'Cobertura activa'
  },
  {
    id: 2,
    name: 'Monteros',
    status: 'active',
    description:
      'Atención frecuente con coordinación directa y disponibilidad regular.',
    badge: 'Cobertura activa'
  },
  {
    id: 3,
    name: 'Famaillá',
    status: 'scheduled',
    description:
      'Cobertura disponible según agenda, tipo de servicio y planificación.',
    badge: 'Cobertura programada'
  },
  {
    id: 4,
    name: 'San Miguel de Tucumán',
    status: 'scheduled',
    description:
      'Disponible para servicios planificados con coordinación previa.',
    badge: 'Cobertura programada'
  },
  {
    id: 5,
    name: 'Yerba Buena',
    status: 'consult',
    description:
      'La disponibilidad puede variar según distancia, agenda y alcance.',
    badge: 'Consultar disponibilidad'
  },
  {
    id: 6,
    name: 'Otras zonas',
    status: 'consult',
    description:
      'Si tu ubicación no figura, podemos evaluar el servicio según el caso.',
    badge: 'Consultar disponibilidad'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.64,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function getStatusStyles(status) {
  if (status === 'active') {
    return {
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      iconWrap: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      card: 'border-emerald-100/70 bg-[linear-gradient(180deg,rgba(236,253,245,0.78)_0%,rgba(255,255,255,0.94)_100%)]'
    };
  }

  if (status === 'scheduled') {
    return {
      badge: 'border-sky-200 bg-sky-50 text-sky-700',
      iconWrap: 'bg-sky-50 text-sky-600 border-sky-100',
      card: 'border-sky-100/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.86)_0%,rgba(255,255,255,0.96)_100%)]'
    };
  }

  return {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    iconWrap: 'bg-amber-50 text-amber-600 border-amber-100',
    card: 'border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.98)_100%)]'
  };
}

function CoverageCard({ zone, index }) {
  const styles = getStatusStyles(zone.status);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`group h-full overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${styles.iconWrap}`}
        >
          {zone.status === 'scheduled' ? (
            <HiClock className="text-[1.05rem]" />
          ) : zone.status === 'consult' ? (
            <HiSparkles className="text-[1.05rem]" />
          ) : (
            <HiMapPin className="text-[1.05rem]" />
          )}
        </div>

        <div
          className={`rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${styles.badge}`}
        >
          {zone.badge}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-[1.2rem] font-bold tracking-tight text-slate-950">
          {zone.name}
        </h3>

        <p className="mt-2 text-[0.92rem] leading-6 text-slate-600">
          {zone.description}
        </p>
      </div>
    </motion.article>
  );
}

function Cobertura() {
  return (
    <section
      id="cobertura"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_52%,#ffffff_100%)] py-16 sm:py-20"
    >
      {/* Benjamin Orellana - 2026/04/22 - Fondo suave y limpio para acompañar visualmente la sección de cobertura. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[8%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.10)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[20%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.08)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-10%] left-[18%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      <div className="relative w-full px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Zonas de cobertura
            </span>
          </div>

          <h2 className="mt-5 titulo uppercase text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Llegamos a distintas zonas con planificación y coordinación previa
          </h2>
        
        </motion.div>

 

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COVERAGE_ZONES.map((zone, index) => (
            <CoverageCard key={zone.id} zone={zone} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-4xl rounded-[30px] border border-slate-200/80 bg-white/84 p-5 text-center shadow-[0_16px_42px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-6"
        >
          <h3 className="text-[1.08rem] font-semibold text-slate-950 sm:text-[1.15rem]">
            ¿Tu zona no figura?
          </h3>

          <p className="mx-auto mt-2 max-w-2xl text-[0.94rem] leading-7 text-slate-600">
            Podemos evaluar cobertura según tipo de servicio, distancia y agenda
            disponible. Esta parte funciona muy bien para invitar a la consulta
            sin cortar la intención del cliente.
          </p>

          <a
            href="#contacto"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_14px_30px_rgba(25,211,223,0.18)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[var(--color-secondary)]"
          >
            Consultar mi zona
            <HiPhoneArrowUpRight className="text-[1rem]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default Cobertura;
