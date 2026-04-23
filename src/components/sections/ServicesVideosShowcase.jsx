// Benjamin Orellana - 2026/04/22 - Showcase de videos para servicios de VALMAT con 3 videos principales y una grilla inferior de reels adicionales.

import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowUpRight, HiCheckBadge, HiOutlinePlay } from 'react-icons/hi2';

const featuredVideos = [
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
const extraReels = [
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

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

function ServicesVideosShowcase() {
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
            <span className="text-[var(--color-primary)]">resultado</span> se vea
            de verdad
          </h2>

          <p className="cuerpo mt-5 text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
            Estos videos acompañan la presentación de servicios con trabajos
            reales. Cada bloque reproduce en silencio y en loop, y al hacer
            click lleva al contenido original en Instagram.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featuredVideos.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.postUrl}
              target="_blank"
              rel="noreferrer"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              transition={{ delay: index * 0.06 }}
              className="group block overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_36px_90px_rgba(15,23,42,0.12)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
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

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition-transform duration-300 group-hover:translate-x-[2px]">
                  Ver en Instagram
                  <HiArrowUpRight className="text-[1rem]" />
                </div>
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
                href={item.postUrl}
                target="_blank"
                rel="noreferrer"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
                className="group block overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-[4px] hover:shadow-[0_28px_68px_rgba(15,23,42,0.10)]"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-slate-100">
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
