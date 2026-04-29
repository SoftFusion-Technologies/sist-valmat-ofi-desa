// Benjamin Orellana - 2026/04/24 - Sección de servicios 2.0 con navegación a páginas individuales, foco mobile, video expandible y mayor orientación comercial.
// Benjamin Orellana - 25/04/2026 - Se migra la sección a servicios públicos dinámicos y se agrega filtro por tipo de cliente.
// Benjamin Orellana - 28/04/2026 - Se adapta la sección al nuevo enfoque comercial VALMAT: Hogar, Empresas y Final de obra.

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowUpRight,
  HiArrowsPointingOut,
  HiCheckBadge,
  HiChevronRight,
  HiClock,
  HiShieldCheck,
  HiSparkles,
  HiWrenchScrewdriver,
  HiXMark
} from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getPublicUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  return `${API_URL}${normalizedUrl}`;
};

function getMediaByPriority(service) {
  const media = Array.isArray(service?.media) ? service.media : [];

  const activeMedia = media.filter((item) => {
    const activo =
      item.activo === undefined ||
      item.activo === null ||
      item.activo === true ||
      item.activo === 1 ||
      item.activo === '1' ||
      item.activo === 'true';

    return activo && item.archivo_url;
  });

  return (
    activeMedia.find(
      (item) =>
        item.es_principal === true ||
        item.es_principal === 1 ||
        item.es_principal === '1'
    ) ||
    activeMedia.find(
      (item) => String(item.bloque || '').toUpperCase() === 'PRINCIPAL'
    ) ||
    activeMedia.find(
      (item) => String(item.bloque || '').toUpperCase() === 'SHOWCASE'
    ) ||
    activeMedia.find(
      (item) => String(item.bloque || '').toUpperCase() === 'REEL'
    ) ||
    activeMedia[0] ||
    null
  );
}

function normalizeMediaType(value) {
  const type = String(value || '').toUpperCase();

  if (type === 'IMAGEN' || type === 'IMAGE') return 'image';

  return 'video';
}

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

const iconMap = {
  HiWrenchScrewdriver,
  HiShieldCheck,
  HiSparkles
};

function getIconByKey(iconKey) {
  return iconMap[iconKey] || HiSparkles;
}

function normalizeTextItem(item) {
  if (!item) return '';

  if (typeof item === 'string') return item;

  return (
    item.titulo ||
    item.title ||
    item.descripcion ||
    item.description ||
    item.texto ||
    ''
  );
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map(normalizeTextItem).filter(Boolean);
}

// Benjamin Orellana - 25/04/2026 - Normaliza perfiles/tipos de cliente dinámicos para filtros públicos.
function normalizeTipoCliente(tipo = {}) {
  return {
    id: tipo.id,
    codigo: tipo.codigo || '',
    nombre: tipo.nombre || tipo.codigo || '',
    descripcion: tipo.descripcion || '',
    orden_visual: Number(tipo.orden_visual || 0),
    activo:
      tipo.activo === undefined ||
      tipo.activo === null ||
      tipo.activo === true ||
      tipo.activo === 1 ||
      tipo.activo === '1' ||
      tipo.activo === 'true'
  };
}

// Benjamin Orellana - 28/04/2026 - Normaliza slugs para reconocer los tres bloques principales del home.
function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replaceAll('_', '-')
    .replace(/\s+/g, '-');
}

// Benjamin Orellana - 28/04/2026 - Detecta el bloque Hogar aunque venga como hogar, hogares o perfil PARTICULAR.
function isHogarService(service = {}) {
  const slug = normalizeSlug(service.slug);
  const title = normalizeSlug(service.title || service.titulo);
  const shortTitle = normalizeSlug(service.shortTitle || service.short_title);
  const tipoCodigo = String(
    service.tipo_cliente_codigo ||
      service.tipoClienteCodigo ||
      service.codigo_tipo_cliente ||
      service.tipo_cliente?.codigo ||
      ''
  ).toUpperCase();

  return (
    slug === 'hogar' ||
    slug === 'hogares' ||
    title === 'hogar' ||
    title === 'hogares' ||
    shortTitle === 'hogar' ||
    shortTitle === 'hogares' ||
    tipoCodigo === 'PARTICULAR'
  );
}

// Benjamin Orellana - 28/04/2026 - Resuelve la ruta pública final de cada bloque principal.
function getServicePublicRoute(service = {}) {
  if (isHogarService(service)) {
    return '/servicios/hogar';
  }

  const slug = normalizeSlug(service.slug);

  if (!slug) {
    return '/#servicios';
  }

  return `/servicios/${slug}`;
}

// Benjamin Orellana - 28/04/2026 - Define CTA principal según el tipo de experiencia del bloque.
function getPrimaryCtaLabel(service = {}) {
  if (isHogarService(service)) {
    return 'Cotizar ahora';
  }

  const slug = normalizeSlug(service.slug);
  const tipoCodigo = String(
    service.tipo_cliente_codigo ||
      service.tipoClienteCodigo ||
      service.codigo_tipo_cliente ||
      service.tipo_cliente?.codigo ||
      ''
  ).toUpperCase();

  if (slug === 'final-de-obra' || slug === 'obra' || tipoCodigo === 'OBRA') {
    return 'Solicitar visita técnica';
  }

  if (slug === 'empresa' || slug === 'empresas' || tipoCodigo === 'EMPRESA') {
    return 'Solicitar contacto';
  }

  return service.ctaLabel || service.cta_label || 'Consultar servicio';
}

// Benjamin Orellana - 28/04/2026 - Ordena servicios públicos manteniendo todos los activos del backend y priorizando Hogar.
function getServiceWeight(service = {}) {
  if (isHogarService(service)) return 1;

  const slug = normalizeSlug(service.slug);
  const title = normalizeSlug(service.title || service.titulo);
  const shortTitle = normalizeSlug(service.shortTitle || service.short_title);
  const tipoCodigo = String(
    service.tipo_cliente_codigo ||
      service.tipoClienteCodigo ||
      service.codigo_tipo_cliente ||
      service.tipo_cliente?.codigo ||
      ''
  ).toUpperCase();

  if (
    slug === 'tapizados' ||
    title === 'tapizados' ||
    shortTitle === 'tapizados'
  ) {
    return 2;
  }

  if (
    slug === 'empresa' ||
    slug === 'empresas' ||
    title === 'empresa' ||
    title === 'empresas' ||
    shortTitle === 'empresa' ||
    shortTitle === 'empresas' ||
    tipoCodigo === 'EMPRESA'
  ) {
    return 3;
  }

  if (
    slug === 'final-de-obra' ||
    slug === 'obra' ||
    title === 'final-de-obra' ||
    title === 'obra' ||
    shortTitle === 'obra' ||
    shortTitle === 'final-de-obra' ||
    tipoCodigo === 'OBRA'
  ) {
    return 4;
  }

  return Number(service.orden_visual || 99);
}

// Benjamin Orellana - 25/04/2026 - Obtiene tipos de clientes activos desde backend para no usar filtros estáticos.
async function fetchTiposClientesPublicos() {
  const response = await fetch(
    `${API_URL}/servicios-tipos-clientes?activo=true`
  );
  const data = await response.json();

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudieron cargar los perfiles de cliente.'
    );
  }

  const tipos = Array.isArray(data?.tiposClientes)
    ? data.tiposClientes
    : Array.isArray(data?.tipos_clientes)
      ? data.tipos_clientes
      : Array.isArray(data?.tipos)
        ? data.tipos
        : Array.isArray(data)
          ? data
          : [];

  return tipos
    .map(normalizeTipoCliente)
    .filter((tipo) => tipo.activo && tipo.codigo)
    .sort((a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0));
}

function normalizeService(service) {
  const Icon = getIconByKey(service.iconKey || service.icon_key);
  const selectedMedia = getMediaByPriority(service);

  const rawMediaSrc =
    selectedMedia?.archivo_url ||
    selectedMedia?.url ||
    service.mediaSrc ||
    service.media_src ||
    '';

  const rawMediaPoster =
    selectedMedia?.poster_url ||
    service.mediaPoster ||
    service.media_poster ||
    '';

  const rawMediaType =
    selectedMedia?.tipo_media ||
    service.mediaType ||
    service.media_type ||
    'VIDEO';

  return {
    ...service,
    icon: Icon,
    slug: service.slug || '',
    eyebrow: service.eyebrow || 'Servicio VALMAT',
    title: service.title || service.titulo || 'Servicio',
    shortTitle:
      service.shortTitle ||
      service.short_title ||
      service.title ||
      service.titulo ||
      'Servicio',
    subtitle: service.subtitle || service.subtitulo || '',
    intent:
      service.intent ||
      service.subtitle ||
      service.subtitulo ||
      service.description ||
      service.descripcion ||
      '',
    description:
      service.description ||
      service.descripcion ||
      service.subtitle ||
      service.subtitulo ||
      '',
    ctaLabel:
      service.ctaLabel || service.cta_label || 'Solicitar visita técnica',
    secondaryCtaLabel:
      service.secondaryCtaLabel ||
      service.secondary_cta_label ||
      'Ver servicio completo',
    mediaType: normalizeMediaType(rawMediaType),
    mediaSrc: getPublicUrl(rawMediaSrc),
    mediaPoster: getPublicUrl(rawMediaPoster),
    features: normalizeItems(service.features),
    benefits: normalizeItems(service.benefits),
    painPoints: normalizeItems(service.painPoints || service.pain_points),
    process: normalizeItems(service.process),
    useCases: normalizeItems(service.useCases || service.use_cases),
    trustItems: normalizeItems(service.trustItems || service.trust_items),
    orden_visual: Number(service.orden_visual || 1),
    media: Array.isArray(service.media) ? service.media : []
  };
}

async function fetchServiciosPublicos(tipoClienteCodigo = '') {
  const query = tipoClienteCodigo
    ? `?tipo_cliente_codigo=${encodeURIComponent(tipoClienteCodigo)}`
    : '';

  const response = await fetch(`${API_URL}/servicios-publicos${query}`);
  const data = await response.json();

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudieron cargar los servicios.'
    );
  }

  const servicios = Array.isArray(data?.servicios)
    ? data.servicios
    : Array.isArray(data)
      ? data
      : [];

  const normalizedServices = servicios.map(normalizeService);

  // Benjamin Orellana - 28/04/2026 - Se muestran todos los servicios activos del backend, manteniendo prioridad visual para Hogar.
  return normalizedServices.sort((a, b) => {
    const weightA = getServiceWeight(a);
    const weightB = getServiceWeight(b);

    if (weightA !== weightB) return weightA - weightB;

    return Number(a.orden_visual || 0) - Number(b.orden_visual || 0);
  });
}

function ExpandedServiceVideo({ service, onClose }) {
  if (!service) return null;

  const Icon = service.icon || HiSparkles;

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
            {service.mediaSrc ? (
              service.mediaType === 'video' ? (
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
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-950">
                <HiSparkles className="text-[2rem] text-cyan-100/70" />
              </div>
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

      {service.mediaSrc ? (
        service.mediaType === 'video' ? (
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
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-950">
          <HiSparkles className="text-[2rem] text-cyan-100/70" />
        </div>
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

// Benjamin Orellana - 25/04/2026 - Filtro público por tipo de cliente sin alterar la estética general de la sección.
// Benjamin Orellana - 25/04/2026 - Filtro público por perfiles de cliente dinámicos desde servicios_tipos_clientes.
// Benjamin Orellana - 28/04/2026 - Mantiene filtros dinámicos alineados a Hogar, Empresas y Final de obra.
function ClientTypeFilter({ activeType, onChange, loading, tiposCliente }) {
  const filterOptions = [
    {
      id: 'TODOS',
      label: 'Todos',
      value: ''
    },
    ...tiposCliente.map((tipo) => ({
      id: tipo.id,
      label: tipo.nombre || tipo.codigo,
      value: tipo.codigo
    }))
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="mx-auto mt-7 flex max-w-fit gap-2 overflow-x-auto rounded-full border border-sky-100 bg-white/82 p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.055)] backdrop-blur-xl"
    >
      {filterOptions.map((tipo) => {
        const active = activeType === tipo.value;

        return (
          <button
            key={tipo.id || tipo.value || 'TODOS'}
            type="button"
            onClick={() => onChange(tipo.value)}
            disabled={loading}
            className={`cuerpo shrink-0 rounded-full px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
              active
                ? 'bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(25,211,223,0.22)]'
                : 'text-slate-500 hover:bg-sky-50 hover:text-[var(--color-primary)]'
            } ${loading ? 'cursor-wait opacity-70' : ''}`}
          >
            {tipo.label}
          </button>
        );
      })}
    </motion.div>
  );
}

function ServiceCard({ service, index, onExpand }) {
  const navigate = useNavigate();
  const Icon = service.icon || HiSparkles;

  const serviceRoute = useMemo(() => getServicePublicRoute(service), [service]);
  const primaryCtaLabel = useMemo(() => getPrimaryCtaLabel(service), [service]);

  const goToDetail = () => {
    navigate(serviceRoute);
  };

  const goToPrimaryAction = (event) => {
    event.stopPropagation();

    if (isHogarService(service)) {
      navigate('/servicios/hogar');
      return;
    }

    navigate(`${serviceRoute}#contacto-servicio`);
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
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[36px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(226,247,252,0.82)_100%)] p-3 shadow-[0_26px_80px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-200/90 hover:shadow-[0_34px_90px_rgba(15,23,42,0.12)] focus-visible:ring-4 focus-visible:ring-cyan-200/70 sm:p-4"
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
              {isHogarService(service) ? 'Cotizador' : 'Click para ver'}
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
                key={`${service.slug}-${feature}-${featureIndex}`}
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
                {isHogarService(service)
                  ? 'Cotizá en línea, agregá servicios y elegí disponibilidad.'
                  : 'Consultá por alcance, zona y disponibilidad desde el formulario.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={goToPrimaryAction}
                className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-[0.82rem] font-semibold text-white shadow-[0_16px_32px_rgba(25,211,223,0.20)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_22px_40px_rgba(25,211,223,0.26)]"
              >
                {primaryCtaLabel}
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
                {isHogarService(service)
                  ? 'Abrir cotizador'
                  : service.secondaryCtaLabel}
                <HiChevronRight className="text-[0.9rem]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ServiciosLoading() {
  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[480px] animate-pulse rounded-[36px] border border-sky-100/90 bg-white/70 shadow-[0_26px_80px_rgba(15,23,42,0.06)]"
        />
      ))}
    </div>
  );
}

function ServiciosError({ error, onRetry }) {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-red-100 bg-red-50/90 p-5 text-center shadow-[0_18px_52px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <h3 className="titulo text-xl text-red-950">
        No se pudieron cargar los servicios
      </h3>

      <p className="cuerpo mx-auto mt-2 max-w-xl text-[0.9rem] leading-6 text-red-700">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="cuerpo mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-[0.82rem] font-semibold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}

function ServiciosEmpty() {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-sky-100 bg-white/78 p-6 text-center shadow-[0_18px_52px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <h3 className="titulo text-xl text-slate-950">
        No hay servicios disponibles
      </h3>

      <p className="cuerpo mx-auto mt-2 max-w-xl text-[0.9rem] leading-6 text-slate-600">
        Cuando se activen servicios para este perfil, se mostrarán
        automáticamente.
      </p>
    </div>
  );
}

function Servicios() {
  const [expandedService, setExpandedService] = useState(null);
  const [services, setServices] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(false);
  const [error, setError] = useState('');

  // Benjamin Orellana - 25/04/2026 - Carga perfiles activos para armar filtros públicos dinámicos.
  const loadTiposCliente = async () => {
    try {
      setLoadingTipos(true);

      const data = await fetchTiposClientesPublicos();

      setTiposCliente(data);

      setActiveType((currentType) => {
        if (!currentType) return '';

        const exists = data.some((tipo) => tipo.codigo === currentType);

        return exists ? currentType : '';
      });
    } catch (err) {
      setTiposCliente([]);
    } finally {
      setLoadingTipos(false);
    }
  };

  const loadServices = async (tipoClienteCodigo = '', mode = 'initial') => {
    try {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setSoftLoading(true);
      }

      setError('');

      const data = await fetchServiciosPublicos(tipoClienteCodigo);

      setServices(data);
    } catch (err) {
      setServices([]);
      setError(err.message || 'No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
      setSoftLoading(false);
    }
  };

  useEffect(() => {
    loadTiposCliente();
    loadServices('', 'initial');
  }, []);

  const handleTypeChange = (tipoClienteCodigo) => {
    setActiveType(tipoClienteCodigo);
    loadServices(tipoClienteCodigo, 'soft');
  };

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
              Elegí cómo querés avanzar
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="titulo mt-5 text-3xl uppercase leading-[1.03] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            Hogar, empresas y{' '}
            <span className="text-[var(--color-primary)]">final de obra</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="cuerpo mx-auto mt-5 max-w-2xl text-[0.98rem] leading-7 text-slate-600 sm:text-[1.03rem]"
          >
            VALMAT organiza cada servicio según el tipo de necesidad: cotización
            interactiva para hogares, consultas comerciales para empresas y
            visita técnica para finales de obra.
          </motion.p>

          <ClientTypeFilter
            activeType={activeType}
            onChange={handleTypeChange}
            loading={softLoading || loading || loadingTipos}
            tiposCliente={tiposCliente}
          />

          {softLoading && (
            <motion.p
              variants={fadeUp}
              className="cuerpo mt-3 text-[0.78rem] font-semibold text-slate-400"
            >
              Actualizando servicios...
            </motion.p>
          )}
        </motion.div>

        {loading ? (
          <ServiciosLoading />
        ) : error ? (
          <ServiciosError
            error={error}
            onRetry={() => loadServices(activeType, 'initial')}
          />
        ) : services.length === 0 ? (
          <ServiciosEmpty />
        ) : (
          <>
            {/* Benjamin Orellana - 2026/04/27 - Se elimina ServiceQuickSelector y mobile muestra todos los servicios disponibles sin selector intermedio. */}
            {/* Benjamin Orellana - 28/04/2026 - Mobile muestra los bloques principales Hogar, Empresas y Final de obra. */}
            <div className="mt-7 grid gap-5 lg:hidden">
              <AnimatePresence mode="popLayout">
                {services.map((service, index) => (
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
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Benjamin Orellana - 2026/04/24 - Desktop mantiene siempre las cards visibles para comparar servicios. */}
            {/* Benjamin Orellana - 28/04/2026 - Desktop prioriza una fila de 3 bloques principales. */}
            <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id || service.slug}
                  service={service}
                  index={index}
                  onExpand={setExpandedService}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Servicios;
