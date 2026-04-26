// Benjamin Orellana - 2026/04/22 - Showcase de videos para servicios de VALMAT con 3 videos principales y una grilla inferior de reels adicionales.
// Benjamin Orellana - 25/04/2026 - Se migra el showcase a consumo dinámico desde servicios públicos, conservando fallback local para reels.

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowUpRight, HiOutlinePlay } from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Benjamin Orellana - 25/04/2026 - Resuelve URLs públicas de media local subida al backend sin romper archivos del public frontend.
const getPublicUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  if (normalizedUrl.startsWith('/uploads')) {
    return `${API_URL}${normalizedUrl}`;
  }

  return normalizedUrl;
};

const fallbackFeaturedVideos = [
  {
    id: 1,
    service: 'Final de obra',
    title: 'Intervenciones post obra con terminación profesional',
    description:
      'Mostramos resultados reales de limpieza final de obra con foco en detalle, prolijidad visual y entrega lista para uso.',
    postUrl: 'https://www.instagram.com/p/DWg3jsbkkwT/',
    videoSrc: '/videos/final-obra.mp4',
    poster: '/videos/posters/final-obra.jpg',
    accent: 'from-cyan-500/20 via-sky-500/10 to-transparent'
  },
  {
    id: 2,
    service: 'Limpieza de tapizado',
    title: 'Recuperación visual y limpieza profunda de tapizados',
    description:
      'Aplicamos procesos orientados a mejorar presencia, higiene y conservación en sillones, tapizados y superficies delicadas.',
    postUrl: 'https://www.instagram.com/p/DVyTrE2EgZt/',
    videoSrc: '/videos/tapizado.mp4',
    poster: '/videos/posters/tapizado.jpg',
    accent: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 3,
    service: 'Hogares',
    title: 'Espacios cotidianos con una presentación impecable',
    description:
      'Mostramos trabajos orientados a hogares donde la limpieza profesional mejora confort, imagen y sensación general del ambiente.',
    postUrl: 'https://www.instagram.com/p/DRhlKpXEZ0K/',
    videoSrc: '/videos/hogares.mp4',
    poster: '/videos/posters/hogares.jpg',
    accent: 'from-indigo-500/20 via-violet-500/10 to-transparent'
  }
];

// Benjamin Orellana - 2026/04/22 - Reels secundarios listos para completar con nuevos links y archivos locales.
const fallbackExtraReels = [
  {
    id: 1,
    label: 'Reel adicional 01',
    title: 'Sumar nuevo caso real',
    postUrl: 'https://www.instagram.com/p/DVhZlUAElXk/',
    videoSrc: '/videos/reel-01.mp4',
    poster: '/videos/posters/reel-01.jpg'
  },
  {
    id: 2,
    label: 'Reel adicional 02',
    title: 'Sumar nuevo proceso',
    postUrl: 'https://www.instagram.com/p/DRhlKpXEZ0K/',
    videoSrc: '/videos/reel-02.mp4',
    poster: '/videos/posters/reel-02.jpg'
  },
  {
    id: 3,
    label: 'Reel adicional 03',
    title: 'Sumar nuevo resultado',
    postUrl: 'https://www.instagram.com/p/DKIIsg-Osg5/',
    videoSrc: '/videos/reel-03.mp4',
    poster: '/videos/posters/reel-03.jpg'
  }
];

const accents = [
  'from-cyan-500/20 via-sky-500/10 to-transparent',
  'from-emerald-500/20 via-teal-500/10 to-transparent',
  'from-indigo-500/20 via-violet-500/10 to-transparent',
  'from-amber-500/20 via-orange-500/10 to-transparent',
  'from-rose-500/20 via-pink-500/10 to-transparent'
];

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

function safeString(value, fallback = '') {
  return value || fallback;
}

function isVideoMedia(item) {
  const type = String(
    item?.tipo_media || item?.mediaType || item?.media_type || 'VIDEO'
  ).toUpperCase();

  return type === 'VIDEO' || type === 'VIDEO_MP4';
}

// Benjamin Orellana - 25/04/2026 - Normaliza media dinámica usando URLs públicas correctas para uploads del backend.
function normalizeMediaItem(item = {}, service = {}, index = 0, block = 'SHOWCASE') {
  const rawVideoSrc =
    item.archivo_url ||
    item.videoSrc ||
    item.mediaSrc ||
    item.url ||
    service.mediaSrc ||
    service.media_src ||
    '';

  const rawPoster =
    item.poster_url ||
    item.poster ||
    item.mediaPoster ||
    service.mediaPoster ||
    service.media_poster ||
    '';

  return {
    id: item.id || `${block}-${service.id || service.slug || index}-${index}`,
    service:
      service.shortTitle ||
      service.short_title ||
      service.title ||
      service.titulo ||
      item.service ||
      'VALMAT',
    title:
      item.title ||
      item.titulo ||
      service.title ||
      service.titulo ||
      'Servicio VALMAT',
    description:
      item.descripcion ||
      item.description ||
      service.description ||
      service.descripcion ||
      service.subtitle ||
      service.subtitulo ||
      'Mostramos el servicio en acción con resultados reales y presentación profesional.',
    postUrl:
      item.post_url ||
      item.postUrl ||
      item.url_post ||
      service.postUrl ||
      '#',
    videoSrc: getPublicUrl(rawVideoSrc),
    poster: getPublicUrl(rawPoster),
    accent: accents[index % accents.length],
    isVideo: isVideoMedia(item)
  };
}

// Benjamin Orellana - 25/04/2026 - Normaliza servicio público para showcase y conserva media dinámica subida.
function normalizeService(service = {}) {
  return {
    ...service,
    id: service.id,
    slug: service.slug || '',
    title: service.title || service.titulo || '',
    shortTitle:
      service.shortTitle ||
      service.short_title ||
      service.title ||
      service.titulo ||
      '',
    description:
      service.description ||
      service.descripcion ||
      service.subtitle ||
      service.subtitulo ||
      '',
    mediaSrc: getPublicUrl(service.mediaSrc || service.media_src || ''),
    mediaPoster: getPublicUrl(service.mediaPoster || service.media_poster || ''),
    media: Array.isArray(service.media) ? service.media : []
  };
}

function getMediaByBlock(service, block) {
  const normalizedBlock = String(block).toUpperCase();

  return service.media.filter(
    (item) => String(item?.bloque || '').toUpperCase() === normalizedBlock
  );
}

// Benjamin Orellana - 25/04/2026 - Arma videos principales priorizando media activa subida desde dashboard.
function buildFeaturedVideosFromServices(services) {
  const dynamicItems = [];

  services.forEach((service, serviceIndex) => {
    const showcaseMedia = getMediaByBlock(service, 'SHOWCASE').filter(
      (item) => item?.archivo_url
    );

    const principalMedia = getMediaByBlock(service, 'PRINCIPAL').filter(
      (item) => item?.archivo_url
    );

    const selectedMedia =
      showcaseMedia.find((item) => item.activo !== false && item.activo !== 0) ||
      principalMedia.find((item) => item.activo !== false && item.activo !== 0) ||
      showcaseMedia[0] ||
      principalMedia[0];

    if (selectedMedia?.archivo_url) {
      dynamicItems.push(
        normalizeMediaItem(selectedMedia, service, dynamicItems.length, 'SHOWCASE')
      );

      return;
    }

    if (service.mediaSrc) {
      dynamicItems.push(
        normalizeMediaItem(
          {
            archivo_url: service.mediaSrc,
            poster_url: service.mediaPoster,
            tipo_media: 'VIDEO',
            title: service.title
          },
          service,
          serviceIndex,
          'PRINCIPAL'
        )
      );
    }
  });

  return dynamicItems.slice(0, 3);
}

// Benjamin Orellana - 25/04/2026 - Arma reels inferiores desde media REEL subida al backend.
function buildExtraReelsFromServices(services) {
  const dynamicItems = [];

  services.forEach((service) => {
    const reels = getMediaByBlock(service, 'REEL').filter(
      (item) => item?.archivo_url
    );

    reels.forEach((item) => {
      const activo =
        item.activo === undefined ||
        item.activo === null ||
        item.activo === true ||
        item.activo === 1 ||
        item.activo === '1' ||
        item.activo === 'true';

      if (!activo) return;

      dynamicItems.push(
        normalizeMediaItem(item, service, dynamicItems.length, 'REEL')
      );
    });
  });

  return dynamicItems.slice(0, 6);
}

async function safeJson(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function fetchServiciosPublicos() {
  const response = await fetch(`${API_URL}/servicios-publicos`);
  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudieron cargar los videos de servicios.'
    );
  }

  const servicios = Array.isArray(data?.servicios)
    ? data.servicios
    : Array.isArray(data)
      ? data
      : [];

  return servicios.map(normalizeService);
}

function ServicesVideosShowcase() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      try {
        setLoading(true);

        const data = await fetchServiciosPublicos();

        if (!isMounted) return;

        setServices(data);
      } catch {
        if (!isMounted) return;

        setServices([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredVideos = useMemo(() => {
    const dynamicFeatured = buildFeaturedVideosFromServices(services);

    return dynamicFeatured.length > 0
      ? dynamicFeatured
      : fallbackFeaturedVideos;
  }, [services]);

  const extraReels = useMemo(() => {
    const dynamicReels = buildExtraReelsFromServices(services);

    return dynamicReels.length > 0 ? dynamicReels : fallbackExtraReels;
  }, [services]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Benjamin Orellana - 2026/04/22 - Capas decorativas suaves para integrar el bloque de videos con la estética premium de la landing. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-5%] top-[8%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.12)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
        <div className="absolute right-[-8%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.10)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Casos reales en video
            </span>
          </div>

          <h2 className="titulo uppercase mt-6 text-3xl leading-[1.05] tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Mostramos el servicio en acción para que el{' '}
            <span className="text-[var(--color-primary)]">resultado</span> se
            vea de verdad
          </h2>

          {loading && (
            <p className="cuerpo mt-4 text-[0.82rem] font-medium text-slate-400">
              Cargando videos...
            </p>
          )}
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featuredVideos.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.postUrl || '#'}
              target={
                item.postUrl && item.postUrl !== '#' ? '_blank' : undefined
              }
              rel={
                item.postUrl && item.postUrl !== '#' ? 'noreferrer' : undefined
              }
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              transition={{ delay: index * 0.06 }}
              className="group block overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_36px_90px_rgba(15,23,42,0.12)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                {item.videoSrc ? (
                  item.isVideo !== false ? (
                    <video
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster={item.poster}
                    >
                      <source src={item.videoSrc} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={item.videoSrc}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,#e0f7fb_0%,#f8fdff_100%)]" />
                )}

                <div
                  className={`absolute inset-0 bg-gradient-to-b ${item.accent}`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.10)_42%,rgba(15,23,42,0.62)_100%)]" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-2 backdrop-blur-md">
                  <HiOutlinePlay className="text-[0.95rem] text-white" />
                  <span className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white">
                    {item.service}
                  </span>
                </div>

                {/* 
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="rounded-[24px] border border-white/20 bg-white/12 p-4 backdrop-blur-md">
                    <h3 className="titulo text-[1.2rem] leading-tight text-white sm:text-[1.35rem]">
                      {item.title}
                    </h3>
                    <p className="cuerpo mt-2 text-[0.92rem] leading-6 text-white/80">
                      Click para ver la publicación original.
                    </p>
                  </div>
                </div> */}
              </div>

              <div className="p-5 sm:p-6">
                <p className="cuerpo text-[0.98rem] leading-7 text-slate-600">
                  {item.description}
                </p>

                {item.postUrl && item.postUrl !== '#' && (
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition-transform duration-300 group-hover:translate-x-[2px]">
                    Ver en Instagram
                    <HiArrowUpRight className="text-[1rem]" />
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14"
        >
          <div className="grid gap-5 md:grid-cols-3">
            {extraReels.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.postUrl || '#'}
                target={
                  item.postUrl && item.postUrl !== '#' ? '_blank' : undefined
                }
                rel={
                  item.postUrl && item.postUrl !== '#'
                    ? 'noreferrer'
                    : undefined
                }
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
                className="group block overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-[4px] hover:shadow-[0_28px_68px_rgba(15,23,42,0.10)]"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-slate-100">
                  {item.videoSrc ? (
                    item.isVideo !== false ? (
                      <video
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={item.poster}
                      >
                        <source src={item.videoSrc} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        src={item.videoSrc}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,#e0f7fb_0%,#f8fdff_100%)]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.00)_0%,rgba(15,23,42,0.10)_45%,rgba(15,23,42,0.62)_100%)]" />
                  {/* <div className="absolute bottom-4 left-4 right-4">
                    <div className="rounded-[20px] border border-white/20 bg-white/12 px-4 py-3 backdrop-blur-md">
                      <p className="titulo text-[1rem] leading-tight text-white">
                        {item.title}
                      </p>
                    </div>
                  </div> */}
                </div>
                {/* 
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="cuerpo text-sm font-semibold text-slate-700">
                    Abrir reel
                  </span>
                  <HiArrowUpRight className="text-[1rem] text-slate-400 transition-all duration-300 group-hover:text-[var(--color-primary)]" />
                </div> */}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesVideosShowcase;
