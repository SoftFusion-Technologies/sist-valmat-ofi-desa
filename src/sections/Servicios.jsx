// Benjamin Orellana - 2026/04/24 - Sección de servicios 2.0 con navegación a páginas individuales, foco mobile, video expandible y mayor orientación comercial.

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowUpRight,
  HiArrowsPointingOut,
  HiCheckBadge,
  HiChevronRight,
  HiClock,
  HiSparkles,
  HiXMark
} from 'react-icons/hi2';
import { services } from '../data/valmatServices';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
  }
};

function ExpandedServiceVideo({ service, onClose }) {
  if (!service) return null;

  const Icon = service.icon;

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
          className="absolute inset-0 bg-slate-950/84 backdrop-blur-xl"
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
            <Icon className="text-[1rem] text-cyan-200" />
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

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.80)_100%)]" />

            <div className="absolute bottom-5 left-5 right-5 z-20">
              <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                Servicio VALMAT
              </p>

              <h3 className="titulo mt-1 text-[2rem] leading-none tracking-[-0.05em] text-white sm:text-[2.65rem]">
                {service.title}
              </h3>

              <p className="cuerpo mt-2 max-w-2xl text-[0.92rem] leading-6 text-white/72">
                {service.subtitle}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ServiceMedia({ service, onExpand }) {
  return (
    <div className="relative h-[190px] overflow-hidden rounded-[28px] border border-white/70 bg-slate-950 shadow-[0_22px_54px_rgba(15,23,42,0.14)] sm:h-[210px] lg:h-[190px] 2xl:h-[210px]">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.03)_0%,rgba(2,6,23,0.08)_34%,rgba(2,6,23,0.74)_100%)]" />

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



      <button
        type="button"
        onClick={onExpand}
        aria-label={`Expandir video de ${service.title}`}
        className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/16 text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-200/60 hover:bg-cyan-200/20"
      >
        <HiArrowsPointingOut className="text-[1rem]" />
      </button>

      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
        <div>
          <p className="cuerpo text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cyan-100/80">
            {service.eyebrow}
          </p>

          <h3 className="titulo mt-1 text-[1.55rem] leading-none tracking-[-0.045em] text-white sm:text-[1.75rem]">
            {service.title}
          </h3>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/16 text-white backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-white/22">
          <HiArrowUpRight className="text-[1rem]" />
        </span>
      </div>
    </div>
  );
}

// Benjamin Orellana - 2026/04/24 - Selector mobile con opción "Todos" para mostrar todos los servicios o filtrar una sola card.
function ServiceQuickSelector({ selectedSlug, onSelect }) {
  return (
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`cuerpo flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.78rem] font-bold transition-all duration-300 ${
          !selectedSlug
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(25,211,223,0.22)]'
            : 'border-sky-100 bg-white/82 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)]'
        }`}
      >
        Todos
      </button>

      {services.map((service) => {
        const active = selectedSlug === service.slug;
        const Icon = service.icon;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.slug)}
            className={`cuerpo flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.78rem] font-bold transition-all duration-300 ${
              active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(25,211,223,0.22)]'
                : 'border-sky-100 bg-white/82 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)]'
            }`}
          >
            <Icon className="text-[0.95rem]" />
            {service.shortTitle}
          </button>
        );
      })}
    </div>
  );
}

function ServiceCard({ service, index, onExpand, selectedSlug }) {
  const navigate = useNavigate();
  const Icon = service.icon;
  const isHighlighted = selectedSlug === service.slug;

  const goToDetail = () => {
    navigate(`/servicios/${service.slug}`);
  };

  const goToContact = (event) => {
    event.stopPropagation();
    navigate(`/servicios/${service.slug}#contacto-servicio`);
  };

  const handleExpand = (event) => {
    event.stopPropagation();
    onExpand(service);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDetail();
    }
  };

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.66,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[36px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(226,247,252,0.82)_100%)] p-3 shadow-[0_26px_80px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-200/90 hover:shadow-[0_34px_90px_rgba(15,23,42,0.12)] focus-visible:ring-4 focus-visible:ring-cyan-200/70 sm:p-4 ${
        isHighlighted
          ? 'border-[var(--color-primary)]/60 ring-4 ring-cyan-100/70'
          : 'border-sky-100/90'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute right-[-18%] top-[-18%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.20)_0%,rgba(25,211,223,0)_70%)] blur-2xl" />
        <div className="absolute bottom-[-22%] left-[-18%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.14)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <ServiceMedia service={service} onExpand={handleExpand} />

        <div className="flex flex-1 flex-col px-1 pt-4 sm:px-2">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white/82 px-3 py-1.5">
              <Icon className="text-[0.92rem] text-[var(--color-primary)]" />
              <span className="cuerpo text-[0.68rem] font-bold uppercase tracking-[0.17em] text-slate-500">
                {service.eyebrow}
              </span>
            </div>

            <span className="hidden shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white sm:inline-flex">
              Click para ver
            </span>
          </div>

          <h4 className="titulo mt-4 text-[1.28rem] leading-tight tracking-[-0.035em] text-slate-950">
            {service.intent}
          </h4>

          <p className="cuerpo mt-3 text-[0.9rem] leading-6 text-slate-600">
            {service.description}
          </p>

          <div className="mt-4 grid gap-2">
            {service.features.slice(0, 3).map((feature, featureIndex) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{
                  duration: 0.5,
                  delay: 0.08 + featureIndex * 0.06,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex items-start gap-2.5 rounded-2xl border border-sky-100/80 bg-white/86 px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.025)]"
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

          <div className="mt-auto pt-5">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-sky-100 bg-white/72 px-3 py-2.5">
              <HiClock className="shrink-0 text-[1rem] text-[var(--color-primary)]" />
              <p className="cuerpo text-[0.78rem] font-medium leading-5 text-slate-600">
                Consultá por alcance, zona y disponibilidad desde el formulario.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={goToContact}
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-[0.82rem] font-semibold text-white shadow-[0_16px_32px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_40px_rgba(25,211,223,0.26)]"
              >
                {service.ctaLabel}
                <HiArrowUpRight className="text-[0.95rem]" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToDetail();
                }}
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-[0.82rem] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {service.secondaryCtaLabel}
                <HiChevronRight className="text-[0.9rem]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CommercialStrip() {
  const items = [
    {
      title: 'Servicio planificado',
      text: 'Cada trabajo se organiza por alcance, zona y prioridad.'
    },
    {
      title: 'Detalle profesional',
      text: 'La limpieza no se improvisa: se revisa, se ejecuta y se controla.'
    },
    {
      title: 'Pensado para cotizar',
      text: 'El formulario permite captar consultas con datos útiles desde mobile.'
    }
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="mt-8 grid gap-3 rounded-[30px] border border-sky-100 bg-white/78 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl md:grid-cols-3"
    >
      {items.map((item, index) => (
        <div
          key={item.title}
          className="rounded-[24px] border border-sky-50 bg-[linear-gradient(180deg,#ffffff_0%,#f4fcff_100%)] p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-sm font-black text-white shadow-[0_12px_24px_rgba(25,211,223,0.22)]">
              {index + 1}
            </span>

            <h3 className="titulo text-[1rem] leading-tight text-slate-950">
              {item.title}
            </h3>
          </div>

          <p className="cuerpo mt-3 text-[0.84rem] leading-6 text-slate-600">
            {item.text}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

function Servicios() {
  const [expandedService, setExpandedService] = useState(null);

  // Benjamin Orellana - 2026/04/24 - En mobile inicia sin servicio seleccionado para mostrar las 3 cards.
  const [selectedSlug, setSelectedSlug] = useState(null);

  const selectedService = useMemo(() => {
    if (!selectedSlug) return null;

    return services.find((service) => service.slug === selectedSlug) || null;
  }, [selectedSlug]);

  // Benjamin Orellana - 2026/04/24 - En mobile, si hay servicio seleccionado, se muestra solo esa card; si no, se muestran todos.
  const visibleMobileServices = useMemo(() => {
    if (!selectedSlug) return services;

    return services.filter((service) => service.slug === selectedSlug);
  }, [selectedSlug]);

  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfe_52%,#ffffff_100%)] py-14 sm:py-16 lg:py-20"
    >
      <ExpandedServiceVideo
        service={expandedService}
        onClose={() => setExpandedService(null)}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[6%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.12)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[18%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.10)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-8%] left-[14%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.035)_0%,rgba(15,23,42,0)_72%)] blur-2xl" />
      </div>

      <div className="relative w-full px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="mx-auto max-w-5xl text-center"
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
            className="titulo mt-5 text-3xl uppercase leading-[1.03] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
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

        <ServiceQuickSelector
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
        />

        <div className="mt-6 rounded-[30px] border border-cyan-100 bg-white/74 p-4 shadow-[0_18px_52px_rgba(15,23,42,0.05)] backdrop-blur-xl lg:hidden">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
              <HiSparkles className="text-[1.1rem]" />
            </span>

            <div>
              <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                {selectedService ? 'Servicio seleccionado' : 'Vista general'}
              </p>

              <h3 className="titulo mt-1 text-xl text-slate-950">
                {selectedService
                  ? selectedService.title
                  : 'Todos los servicios'}
              </h3>

              <p className="cuerpo mt-2 text-[0.9rem] leading-6 text-slate-600">
                {selectedService
                  ? selectedService.intent
                  : 'Elegí un servicio para ver solo esa opción o mantené esta vista para comparar las alternativas disponibles.'}
              </p>
            </div>
          </div>
        </div>

        {/* Benjamin Orellana - 2026/04/24 - Grilla mobile filtrable: muestra todos o solo el servicio seleccionado. */}
        <div className="mt-7 grid gap-5 lg:hidden">
          <AnimatePresence mode="popLayout">
            {visibleMobileServices.map((service, index) => (
              <motion.div
                key={service.slug}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{
                  duration: 0.36,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  onExpand={setExpandedService}
                  selectedSlug={selectedSlug}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Benjamin Orellana - 2026/04/24 - Desktop mantiene siempre las 3 cards visibles para comparar servicios. */}
        <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onExpand={setExpandedService}
              selectedSlug={selectedSlug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Servicios;
