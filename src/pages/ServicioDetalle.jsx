// Benjamin Orellana - 2026/04/24 - Página individual de servicio 2.0 con estructura comercial, CTA sticky mobile, FAQs y formulario integrado.

import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft,
  HiArrowUpRight,
  HiCheckBadge,
  HiChevronDown,
  HiChevronRight,
  HiClock,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiSparkles
} from 'react-icons/hi2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Contacto from '../sections/Contacto';
import { getServiceBySlug, services } from '../data/valmatServices';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
  }
};

function ServiceVideoBlock({ service }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-slate-950 shadow-[0_34px_100px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.03)_0%,rgba(2,6,23,0.08)_38%,rgba(2,6,23,0.72)_100%)]" />

      {service.mediaType === 'video' ? (
        <video
          className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[560px]"
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
          className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[560px]"
        />
      )}

      <div className="absolute bottom-5 left-5 right-5 z-20 rounded-[26px] border border-white/16 bg-white/14 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
        <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.22em] text-cyan-100/80">
          Servicio especializado
        </p>

        <h2 className="titulo mt-2 text-3xl leading-none tracking-[-0.05em] sm:text-4xl">
          {service.title}
        </h2>

        <p className="cuerpo mt-3 max-w-2xl text-[0.92rem] leading-6 text-white/78">
          {service.subtitle}
        </p>
      </div>
    </div>
  );
}

function StickyMobileCTA({ service }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/20 bg-white/88 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_50px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <Link
          to="/#servicios"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
          aria-label="Volver a servicios"
        >
          <HiArrowLeft className="text-[1rem]" />
        </Link>

        <a
          href="#contacto-servicio"
          className="cuerpo inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-[0.86rem] font-bold text-white shadow-[0_16px_34px_rgba(25,211,223,0.24)]"
        >
          Consultar por {service.shortTitle}
          <HiArrowUpRight className="text-[0.95rem]" />
        </a>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = [
    'Planificación previa',
    'Ejecución profesional',
    'Servicio adaptable',
    'Consulta desde mobile'
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="mt-7 grid gap-2 rounded-[28px] border border-white/80 bg-white/78 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-2xl border border-sky-50 bg-white/88 px-3 py-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
            <HiCheckBadge className="text-[0.9rem]" />
          </span>

          <span className="cuerpo text-[0.82rem] font-semibold text-slate-700">
            {item}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

function InfoCard({ title, items, icon: Icon }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[30px] border border-sky-100/90 bg-white/88 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
          <Icon className="text-[1.2rem]" />
        </div>

        <h3 className="titulo text-xl leading-tight text-slate-950">{title}</h3>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-sky-50 bg-sky-50/50 px-3.5 py-3"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <HiCheckBadge className="text-[0.9rem]" />
            </span>

            <span className="cuerpo text-[0.92rem] font-medium leading-6 text-slate-600">
              {item}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProcessTimeline({ steps }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[34px] border border-sky-100 bg-white/82 p-5 shadow-[0_26px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6 lg:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Método de trabajo
          </p>

          <h3 className="titulo mt-2 text-2xl leading-tight text-slate-950 sm:text-3xl">
            Un proceso claro para evitar improvisaciones
          </h3>
        </div>

        <p className="cuerpo max-w-xl text-[0.95rem] leading-7 text-slate-600">
          Cada servicio se organiza por etapas para definir alcance, ejecutar
          con criterio y cerrar con una revisión final.
        </p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.55,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative overflow-hidden rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f2fbfe_100%)] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-sm font-black text-white shadow-[0_14px_28px_rgba(25,211,223,0.24)]">
              {index + 1}
            </div>

            <h4 className="titulo mt-4 text-[1.05rem] leading-snug text-slate-950">
              {step}
            </h4>

            {index !== steps.length - 1 && (
              <HiChevronRight className="absolute right-4 top-5 hidden text-xl text-slate-300 md:block" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FAQBlock({ faq }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[34px] border border-sky-100 bg-white/84 p-5 shadow-[0_26px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6 lg:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
          <HiQuestionMarkCircle className="text-[1.35rem]" />
        </div>

        <div>
          <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Preguntas frecuentes
          </p>

          <h3 className="titulo mt-1 text-2xl leading-tight text-slate-950 sm:text-3xl">
            Dudas antes de consultar
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {faq.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-[22px] border border-sky-100 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
              >
                <span className="titulo text-[1rem] leading-snug text-slate-950">
                  {item.question}
                </span>

                <HiChevronDown
                  className={`shrink-0 text-lg text-[var(--color-primary)] transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="cuerpo border-t border-sky-50 px-4 py-4 text-[0.92rem] leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ConversionBand({ service }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#07111f_0%,#0b2230_48%,#062b34_100%)] px-5 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.22)_0%,rgba(25,211,223,0)_70%)] blur-2xl" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_68%)] blur-2xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
        <div>
          <p className="cuerpo text-[0.74rem] font-bold uppercase tracking-[0.24em] text-cyan-100/80">
            Cotización y asesoramiento
          </p>

          <h2 className="titulo mt-4 text-3xl uppercase leading-[1.02] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Contanos qué necesitás y armamos una propuesta según tu espacio.
          </h2>

          <p className="cuerpo mt-5 max-w-2xl text-[1rem] leading-8 text-white/74">
            Para cotizar mejor necesitamos entender el tipo de servicio, zona,
            tamaño aproximado, estado actual y prioridad. El formulario está
            pensado para que puedas enviarlo fácil desde el celular.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/12 bg-white/10 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="grid gap-3">
            {[
              `Consulta específica por ${service.title}`,
              'Datos claros para responder mejor',
              'Formulario optimizado para mobile'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-200/18 text-cyan-100">
                  <HiCheckBadge />
                </span>

                <span className="cuerpo text-[0.92rem] font-medium text-white/84">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <a
            href="#contacto-servicio"
            style={{ color: 'var(--color-primary)' }}
            className="cuerpo mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white px-5 py-3.5 text-[0.9rem] font-bold shadow-[0_14px_32px_rgba(255,255,255,0.14)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-cyan-50"
          >
            <span style={{ color: 'var(--color-primary)' }}>
              Completar formulario
            </span>

            <HiArrowUpRight
              className="text-[1rem]"
              style={{ color: 'var(--color-primary)' }}
            />
          </a>
        </div>
      </div>
    </section>
  );
}

function OtherServices({ currentSlug }) {
  const relatedServices = services.filter(
    (service) => service.slug !== currentSlug
  );

  return (
    <section className="relative bg-white px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="cuerpo text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              También puede interesarte
            </p>

            <h2 className="titulo mt-2 text-2xl leading-tight text-slate-950 sm:text-3xl">
              Otros servicios VALMAT
            </h2>
          </div>

          <Link
            to="/#servicios"
            className="cuerpo inline-flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[0.84rem] font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Ver todos
            <HiArrowUpRight className="text-[0.95rem]" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {relatedServices.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.id}
                to={`/servicios/${service.slug}`}
                className="group overflow-hidden rounded-[30px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f4fcff_100%)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                    <Icon className="text-[1.2rem]" />
                  </div>

                  <div>
                    <p className="cuerpo text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {service.eyebrow}
                    </p>

                    <h3 className="titulo mt-1 text-xl text-slate-950">
                      {service.title}
                    </h3>

                    <p className="cuerpo mt-2 text-[0.92rem] leading-6 text-slate-600">
                      {service.intent}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ServicioDetalle = ({ logoSrc }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <>
        <Navbar logoSrc={logoSrc} />

        <main className="min-h-screen bg-white px-5 py-32 text-center">
          <div className="mx-auto max-w-xl rounded-[32px] border border-sky-100 bg-white p-8 shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
            <p className="cuerpo text-[0.75rem] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Servicio no encontrado
            </p>

            <h1 className="titulo mt-3 text-3xl text-slate-950">
              No encontramos el servicio solicitado
            </h1>

            <p className="cuerpo mt-4 text-slate-600">
              Podés volver al inicio y consultar los servicios disponibles de
              VALMAT.
            </p>

            <Link
              to="/"
              className="cuerpo mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(25,211,223,0.22)]"
            >
              Volver al inicio
            </Link>
          </div>
        </main>

        <Footer logoSrc={logoSrc} />
      </>
    );
  }

  const Icon = service.icon;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <>
      <Navbar logoSrc={logoSrc} />

      <StickyMobileCTA service={service} />

      <main className="-mt-20 overflow-hidden bg-white pb-[86px] md:pb-0">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f2fbfe_52%,#ffffff_100%)] px-5 pb-14 pt-28 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-32">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-10%] top-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.14)_0%,rgba(25,211,223,0)_72%)] blur-2xl" />
            <div className="absolute right-[-12%] top-[24%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.12)_0%,rgba(90,151,208,0)_72%)] blur-2xl" />
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative mx-auto max-w-7xl"
          >
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={handleBack}
              className="cuerpo inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/88 px-4 py-2.5 text-[0.82rem] font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <HiArrowLeft className="text-[0.95rem]" />
              Volver atrás
            </motion.button>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <motion.div variants={fadeUp}>

                <h1 className="titulo mt-6 text-2xl uppercase leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-3xl lg:text-4xl">
                  {service.detailTitle}
                </h1>

                <p className="cuerpo mt-6 max-w-2xl text-[1.02rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                  {service.detailIntro}
                </p>

                <div className="mt-7 rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(25,211,223,0.24)]">
                      <HiSparkles className="text-[1.1rem]" />
                    </div>

                    <p className="cuerpo text-[0.98rem] font-medium leading-7 text-slate-700">
                      {service.salesText}
                    </p>
                  </div>
                </div>

                <TrustBar />

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="#contacto-servicio"
                    className="cuerpo inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3.5 text-[0.9rem] font-semibold text-white shadow-[0_18px_36px_rgba(25,211,223,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)]"
                  >
                    {service.ctaLabel}
                    <HiArrowUpRight className="text-[1rem]" />
                  </a>

                  <Link
                    to="/#servicios"
                    className="cuerpo inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-5 py-3.5 text-[0.9rem] font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Ver otros servicios
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <ServiceVideoBlock service={service} />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="relative bg-white px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.16 }}
            className="mx-auto max-w-7xl"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <InfoCard
                title="Problemas que resuelve"
                items={service.painPoints}
                icon={HiClock}
              />

              <InfoCard
                title="Qué incluye"
                items={service.features}
                icon={HiCheckBadge}
              />

              <InfoCard
                title="Beneficios"
                items={service.benefits}
                icon={HiShieldCheck}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.78fr]">
              <ProcessTimeline steps={service.process} />

              <InfoCard
                title="Ideal para"
                items={service.useCases}
                icon={HiSparkles}
              />
            </div>

            <div className="mt-6">
              <FAQBlock faq={service.faq} />
            </div>
          </motion.div>
        </section>

        <ConversionBand service={service} />

        <OtherServices currentSlug={service.slug} />

        <section
          id="contacto-servicio"
          className="relative scroll-mt-24 bg-[linear-gradient(180deg,#f3fbfe_0%,#ffffff_100%)]"
        >
          <Contacto />
        </section>
      </main>

      <Footer logoSrc={logoSrc} />
    </>
  );
};

export default ServicioDetalle;
