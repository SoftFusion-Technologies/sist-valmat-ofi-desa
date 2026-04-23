// Benjamin Orellana - 2026/04/22 - Hero de VALMAT rediseñado con entrada premium, canvas oscuro visible detrás del bloque visual y movimiento constante en imágenes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi2';

const VISUALS = [
  {
    id: 1,
    src: '/hero/hero-clean-1.png',
    alt: 'Limpieza profesional y técnica de VALMAT',
    tag: 'Limpieza integral'
  },
  {
    id: 2,
    src: '/hero/hero-clean-2.png',
    alt: 'Servicio integral de limpieza VALMAT',
    tag: 'Espacios impecables'
  },
  {
    id: 3,
    src: '/hero/hero-clean-3.png',
    alt: 'Planificación y precisión en servicios de limpieza',
    tag: 'Finales de obra'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 34, filter: 'blur(12px)' },
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

const visualReveal = {
  hidden: { opacity: 0, scale: 0.94, y: 34, filter: 'blur(16px)' },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function RotatingWord({ words = [], interval = 2200 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [words, interval]);

  return (
    <span className="relative inline-flex min-w-[1.2ch] items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, scale: 0.985, filter: 'blur(10px)' }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block px-2 text-[var(--color-primary)]"
        >
          {words[index]}
          <span className="absolute bottom-[0.08em] left-1 right-1 h-[0.15em] rounded-full bg-[var(--color-primary)]/18" />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Benjamin Orellana - 2026/04/22 - Canvas global para todo el Hero con partículas y conexiones sutiles en tono negro/grafito.
function HeroBackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let particles = [];

    const pointer = {
      x: null,
      y: null,
      active: false
    };

    const getParticleCount = () => {
      if (window.innerWidth < 640) return 22;
      if (window.innerWidth < 1024) return 34;
      return 48;
    };

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      radius: Math.random() * 1.7 + 0.8
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: getParticleCount() }, createParticle);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

        if (pointer.active && pointer.x !== null && pointer.y !== null) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150 && distance > 0) {
            const force = (150 - distance) / 1500;
            particle.x += (dx / distance) * force * 16;
            particle.y += (dy / distance) * force * 16;
          }
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${0.10 * (1 - distance / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.x = null;
      pointer.y = null;
      pointer.active = false;
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function HeroImageCard({ src, alt, tag, className = '', floating = false }) {
  return (
    <motion.div
      animate={
        floating
          ? {
              y: [0, -8, 0, -4, 0],
              rotate: [0, -1.2, 0, 1.2, 0]
            }
          : {}
      }
      transition={
        floating
          ? {
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          : {}
      }
      className={`overflow-hidden rounded-[28px] border border-white/30 bg-white/28 p-3 shadow-[0_24px_52px_rgba(2,8,23,0.18)] backdrop-blur-xl ${className}`}
    >
      <div className="relative overflow-hidden rounded-[22px]">
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.00)_38%,rgba(2,6,23,0.45)_100%)]" />

        <img src={src} alt={alt} className="h-full w-full object-cover" />

        <div className="absolute bottom-3 left-3 z-20 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 backdrop-blur-md">
          <span className="cuerpo text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/88">
            {tag}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeVisual = useMemo(() => VISUALS[activeIndex], [activeIndex]);
  const prevVisual = useMemo(
    () => VISUALS[(activeIndex - 1 + VISUALS.length) % VISUALS.length],
    [activeIndex]
  );
  const nextVisual = useMemo(
    () => VISUALS[(activeIndex + 1) % VISUALS.length],
    [activeIndex]
  );

  useEffect(() => {
    if (paused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VISUALS.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfd_58%,#ffffff_100%)]"
    >
      {/* Benjamin Orellana - 2026/04/22 - Fondo general claro y limpio; el canvas fuerte vive solo en el bloque visual para que se note más. */}
      {/* Benjamin Orellana - 2026/04/22 - Fondo global del Hero con canvas visible en tono negro/gris, manteniendo la estética clara. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,rgba(15,23,42,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />

        <HeroBackgroundCanvas />

        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, 14, 0, -10, 0],
            y: [0, 12, 0, -8, 0],
            scale: [1, 1.06, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-[-8%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0)_72%)]"
        />

        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, -12, 0, 10, 0],
            y: [0, -8, 0, 8, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-[-8%] right-[8%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0)_72%)]"
        />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <motion.h1
            custom={0.12}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="titulo mt-6 max-w-xl text-[2.35rem] uppercase leading-[0.94] tracking-[-0.045em] text-slate-950 sm:text-[2.85rem] lg:text-[3.95rem]"
          >
            <span className="block">Limpieza</span>
            <span className="block">
              <RotatingWord
                words={['técnica', 'precisa', 'profesional', 'especializada']}
              />
            </span>
            <span className="block">para espacios que exigen calidad</span>
          </motion.h1>

          <motion.p
            custom={0.22}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="cuerpo mt-6 max-w-xl text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]"
          >
            En VALMAT brindamos servicios de limpieza profesional con enfoque
            técnico, planificación y ejecución precisa. Intervenimos espacios
            con una presentación final cuidada, moderna y profesional.
          </motion.p>

          <motion.div
            custom={0.32}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <motion.a
              href="#contacto"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(25,211,223,0.24)] transition-all duration-300 hover:bg-[var(--color-secondary)] hover:shadow-[0_24px_46px_rgba(25,211,223,0.30)]"
            >
              Solicitar evaluación
              <HiArrowRight className="text-[1.05rem]" />
            </motion.a>

            <motion.a
              href="https://wa.me/543815695970"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              target='_blank'
              className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_12px_26px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-slate-900 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
            >
              WhatsApp
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          variants={visualReveal}
          initial="hidden"
          animate="show"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mx-auto w-full max-w-[760px]"
        >
          {/* Benjamin Orellana - 2026/04/22 - Base oscura del bloque visual para que el canvas sea visible y jerarquice mejor las imágenes. */}
          <div className="relative min-h-[470px] overflow-hidden rounded-[38px] border border-sky-100/80 bg-[linear-gradient(180deg,#e9f8fc_0%,#dcf4fa_48%,#edf9fc_100%)] shadow-[0_40px_110px_rgba(2,8,23,0.12)] sm:min-h-[560px] lg:min-h-[610px]">
            <motion.div
              aria-hidden="true"
              animate={{
                x: [0, 18, 0, -14, 0],
                y: [0, 14, 0, -10, 0],
                scale: [1, 1.08, 1]
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute left-[-10%] top-[-8%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_72%)] blur-2xl"
            />

            <motion.div
              aria-hidden="true"
              animate={{
                x: [0, -14, 0, 10, 0],
                y: [0, -10, 0, 12, 0],
                scale: [1, 1.06, 1]
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute bottom-[-10%] right-[-6%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(59,130,246,0)_72%)] blur-2xl"
            />

            <div className="relative z-10 flex h-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
              <div className="relative flex h-full w-full items-center justify-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0, -5, 0],
                    rotate: [-8, -6.5, -8, -7.3, -8]
                  }}
                  transition={{
                    duration: 8.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute left-0 top-[6%] z-10 hidden w-[180px] lg:block"
                >
                  <HeroImageCard
                    src={prevVisual.src}
                    alt={prevVisual.alt}
                    tag={prevVisual.tag}
                    className="rotate-[-8deg]"
                  />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -8, 0, -4, 0]
                  }}
                  transition={{
                    duration: 7.4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative z-20 w-full max-w-[250px] sm:max-w-[320px] lg:max-w-[390px]"
                >
                  <div className="overflow-hidden rounded-[32px] border border-white/28 bg-white/22 p-3 shadow-[0_28px_74px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-4">
                    {' '}
                    <div className="relative overflow-hidden rounded-[26px]">
                      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.00)_38%,rgba(2,6,23,0.38)_100%)]" />

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeVisual.id}
                          initial={{
                            opacity: 0,
                            scale: 1.05,
                            y: 14,
                            filter: 'blur(12px)'
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            filter: 'blur(0px)'
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.985,
                            y: -12,
                            filter: 'blur(10px)'
                          }}
                          transition={{
                            duration: 0.68,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          className="relative aspect-[4/5] w-full"
                        >
                          <motion.img
                            src={activeVisual.src}
                            alt={activeVisual.alt}
                            animate={{
                              scale: [1.06, 1.03, 1.06],
                              x: [0, 4, 0, -4, 0],
                              y: [0, -4, 0, 4, 0]
                            }}
                            transition={{
                              duration: 14,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>

                      <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/14 bg-slate-950/58 px-3 py-1.5 backdrop-blur-md">
                        <span className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/88">
                          {activeVisual.tag}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {VISUALS.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeIndex === index
                              ? 'w-8 bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.45)]'
                              : 'w-2.5 bg-white/30 hover:bg-white/55'
                          }`}
                          aria-label={`Ver imagen ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -8, 0, -12, 0],
                    rotate: [8, 6.5, 8, 7.1, 8]
                  }}
                  transition={{
                    duration: 8.8,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute bottom-[7%] right-0 z-10 hidden w-[180px] lg:block"
                >
                  <HeroImageCard
                    src={nextVisual.src}
                    alt={nextVisual.alt}
                    tag={nextVisual.tag}
                    className="rotate-[8deg]"
                  />
                </motion.div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(6,17,27,0)_0%,rgba(6,17,27,0.45)_100%)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
