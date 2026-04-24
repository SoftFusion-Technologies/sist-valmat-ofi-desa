// Benjamin Orellana - 2026/04/22 - Componente de zonas de cobertura para exhibir de forma moderna, clara y responsive las áreas donde presta servicio la empresa.
// Benjamin Orellana - 2026/04/24 - Se moderniza Cobertura con UI premium, filtros por estado, panel visual compacto, cards interactivas y mejor experiencia mobile.

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiMapPin,
  HiCheckBadge,
  HiClock,
  HiPhoneArrowUpRight,
  HiSparkles,
  HiAdjustmentsHorizontal,
  HiArrowUpRight
} from 'react-icons/hi2';

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

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'scheduled', label: 'Programadas' },
  { id: 'consult', label: 'Consultar' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.64,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07
    }
  }
};

function getStatusStyles(status) {
  if (status === 'active') {
    return {
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      iconWrap: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      card: 'border-emerald-100/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.86)_0%,rgba(255,255,255,0.96)_100%)]',
      dot: 'bg-emerald-500',
      glow: 'bg-emerald-300/24',
      text: 'text-emerald-700',
      ring: 'ring-emerald-100'
    };
  }

  if (status === 'scheduled') {
    return {
      badge: 'border-sky-200 bg-sky-50 text-sky-700',
      iconWrap: 'bg-sky-50 text-sky-600 border-sky-100',
      card: 'border-sky-100/90 bg-[linear-gradient(180deg,rgba(240,249,255,0.90)_0%,rgba(255,255,255,0.96)_100%)]',
      dot: 'bg-sky-500',
      glow: 'bg-sky-300/24',
      text: 'text-sky-700',
      ring: 'ring-sky-100'
    };
  }

  return {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    iconWrap: 'bg-amber-50 text-amber-600 border-amber-100',
    card: 'border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.94)_0%,rgba(255,255,255,0.98)_100%)]',
    dot: 'bg-amber-500',
    glow: 'bg-amber-300/24',
    text: 'text-amber-700',
    ring: 'ring-amber-100'
  };
}

function getStatusIcon(status) {
  if (status === 'scheduled') return HiClock;
  if (status === 'consult') return HiSparkles;
  return HiMapPin;
}

function CoverageCard({ zone, index, active, onSelect }) {
  const styles = getStatusStyles(zone.status);
  const Icon = getStatusIcon(zone.status);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.98 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.5,
        delay: index * 0.045,
        ease: [0.22, 1, 0.36, 1]
      }}
      onClick={() => onSelect(zone)}
      className={`group relative h-full cursor-pointer overflow-hidden rounded-[28px] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)] sm:p-5 ${
        styles.card
      } ${active ? `ring-4 ${styles.ring}` : ''}`}
    >
      <div
        className={`pointer-events-none absolute right-[-18%] top-[-35%] h-32 w-32 rounded-full ${styles.glow} blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${styles.iconWrap}`}
        >
          <Icon className="text-[1.05rem]" />
        </div>

        <div
          className={`max-w-[150px] truncate rounded-full border px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] ${styles.badge}`}
        >
          {zone.badge}
        </div>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />

          <h3 className="truncate text-[1.15rem] font-bold tracking-tight text-slate-950 sm:text-[1.2rem]">
            {zone.name}
          </h3>
        </div>

        <p className="mt-2 line-clamp-2 text-[0.88rem] leading-6 text-slate-600 sm:text-[0.92rem]">
          {zone.description}
        </p>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/70 pt-3">
        <span
          className={`text-[0.76rem] font-bold uppercase tracking-[0.16em] ${styles.text}`}
        >
          Ver zona
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-all duration-300 group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white">
          <HiArrowUpRight className="text-[0.95rem]" />
        </span>
      </div>
    </motion.article>
  );
}

function CoverageFilters({ selectedFilter, onChange }) {
  return (
    <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
      {FILTERS.map((filter) => {
        const active = selectedFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`cuerpo flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.78rem] font-bold transition-all duration-300 ${
              active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(25,211,223,0.22)]'
                : 'border-sky-100 bg-white/82 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
          >
            {filter.id === 'all' ? (
              <HiAdjustmentsHorizontal className="text-[0.95rem]" />
            ) : filter.id === 'active' ? (
              <HiCheckBadge className="text-[0.95rem]" />
            ) : filter.id === 'scheduled' ? (
              <HiClock className="text-[0.95rem]" />
            ) : (
              <HiSparkles className="text-[0.95rem]" />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function CoverageVisualPanel({ selectedZone, stats }) {
  const selectedStyles = getStatusStyles(selectedZone.status);
  const Icon = getStatusIcon(selectedZone.status);

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(228,248,253,0.76)_100%)] p-4 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 lg:p-6"
    >
      <div className="pointer-events-none absolute right-[-16%] top-[-22%] h-56 w-56 rounded-full bg-[var(--color-primary)]/16 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-28%] left-[-12%] h-56 w-56 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="cuerpo text-[0.7rem] font-bold uppercase tracking-[0.22em] text-slate-400">
            Zona destacada
          </p>

          <h3 className="titulo mt-2 text-2xl leading-none tracking-[-0.04em] text-slate-950 sm:text-3xl">
            {selectedZone.name}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${selectedStyles.iconWrap}`}
        >
          <Icon className="text-[1.25rem]" />
        </div>
      </div>

      <p className="relative mt-4 line-clamp-2 text-[0.92rem] leading-7 text-slate-600">
        {selectedZone.description}
      </p>

      <div className="relative mt-5 rounded-[26px] border border-white/80 bg-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.045)]">
        <div className="relative h-[172px] overflow-hidden rounded-[22px] border border-sky-100 bg-[radial-gradient(circle_at_22%_18%,rgba(25,211,223,0.22),transparent_32%),radial-gradient(circle_at_80%_72%,rgba(90,151,208,0.18),transparent_34%),linear-gradient(135deg,#f8fdff_0%,#eaf9fc_100%)] sm:h-[210px]">
          <div className="absolute left-[14%] top-[24%] h-20 w-20 rounded-full border border-white/70 bg-white/50 blur-[1px]" />
          <div className="absolute right-[12%] top-[18%] h-24 w-24 rounded-full border border-white/70 bg-white/40 blur-[1px]" />
          <div className="absolute bottom-[13%] left-[34%] h-28 w-28 rounded-full border border-white/70 bg-white/45 blur-[1px]" />

          {COVERAGE_ZONES.slice(0, 5).map((zone, index) => {
            const styles = getStatusStyles(zone.status);

            const positions = [
              'left-[18%] top-[22%]',
              'left-[46%] top-[36%]',
              'right-[18%] top-[22%]',
              'left-[28%] bottom-[18%]',
              'right-[24%] bottom-[20%]'
            ];

            return (
              <button
                key={zone.id}
                type="button"
                className={`absolute ${positions[index]} flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition-all duration-300 ${
                  selectedZone.id === zone.id
                    ? 'scale-125 bg-[var(--color-primary)] text-white'
                    : `${styles.dot} text-white`
                }`}
                aria-label={zone.name}
              >
                <HiMapPin className="text-[0.9rem]" />
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/70 bg-white/72 px-3 py-2 backdrop-blur-xl">
            <p className="truncate text-[0.76rem] font-bold uppercase tracking-[0.16em] text-slate-500">
              Cobertura VALMAT
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-3 text-center">
          <p className="text-[1.15rem] font-black text-emerald-700">
            {stats.active}
          </p>
          <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-700/70">
            Activas
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-3 text-center">
          <p className="text-[1.15rem] font-black text-sky-700">
            {stats.scheduled}
          </p>
          <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sky-700/70">
            Agenda
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-3 text-center">
          <p className="text-[1.15rem] font-black text-amber-700">
            {stats.consult}
          </p>
          <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-700/70">
            Consulta
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Cobertura() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState(COVERAGE_ZONES[0]);

  const filteredZones = useMemo(() => {
    if (selectedFilter === 'all') return COVERAGE_ZONES;

    return COVERAGE_ZONES.filter((zone) => zone.status === selectedFilter);
  }, [selectedFilter]);

  const stats = useMemo(() => {
    return COVERAGE_ZONES.reduce(
      (acc, zone) => {
        acc[zone.status] += 1;
        return acc;
      },
      {
        active: 0,
        scheduled: 0,
        consult: 0
      }
    );
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);

    if (filter === 'all') {
      setSelectedZone(COVERAGE_ZONES[0]);
      return;
    }

    const firstZone = COVERAGE_ZONES.find((zone) => zone.status === filter);

    if (firstZone) {
      setSelectedZone(firstZone);
    }
  };

  return (
    <section
      id="cobertura"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfe_52%,#ffffff_100%)] py-14 sm:py-18 lg:py-20"
    >
      {/* Benjamin Orellana - 2026/04/22 - Fondo suave y limpio para acompañar visualmente la sección de cobertura. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[8%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.12)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[20%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.09)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-10%] left-[18%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      <div className="relative w-full px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="mx-auto max-w-7xl"
        >
          <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-md">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                <span className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Zonas de cobertura
                </span>
              </div>

              <h2 className="titulo mt-5 max-w-3xl text-3xl uppercase leading-[1.02] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Llegamos a distintas zonas con coordinación previa
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-[28px] border border-sky-100 bg-white/76 p-4 shadow-[0_18px_52px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                  <HiMapPin className="text-[1.2rem]" />
                </span>

                <div className="min-w-0">
                  <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Selección actual
                  </p>

                  <h3 className="titulo mt-1 truncate text-[1.15rem] text-slate-950">
                    {selectedZone.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>

          <CoverageFilters
            selectedFilter={selectedFilter}
            onChange={handleFilterChange}
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <CoverageVisualPanel selectedZone={selectedZone} stats={stats} />

            <div>
              <motion.div
                layout
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredZones.map((zone, index) => (
                    <CoverageCard
                      key={zone.id}
                      zone={zone}
                      index={index}
                      active={selectedZone.id === zone.id}
                      onSelect={setSelectedZone}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/84 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-[1.05rem] font-bold text-slate-950 sm:text-[1.12rem]">
                      ¿Tu zona no figura?
                    </h3>

                    <p className="mt-1 line-clamp-2 text-[0.9rem] leading-6 text-slate-600">
                      Podemos evaluar cobertura según servicio, distancia y
                      agenda.
                    </p>
                  </div>

                  <a
                    href="#contacto"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_14px_30px_rgba(25,211,223,0.18)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[var(--color-secondary)]"
                  >
                    Consultar mi zona
                    <HiPhoneArrowUpRight className="text-[1rem]" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Cobertura;
