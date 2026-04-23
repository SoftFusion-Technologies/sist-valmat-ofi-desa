// Benjamin Orellana - 2026/04/21 - Navbar institucional moderna, responsive y con microinteracciones premium para VALMAT.

import { useEffect, useState } from 'react';
import {
  HiBars3,
  HiXMark,
  HiOutlineEnvelope,
  HiArrowUpRight
} from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';

const NAV_ITEMS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Contacto', href: '#contacto' },
  { label: 'Nosotros', href: '#nosotros' }
];

// Benjamin Orellana - 2026/04/22 - Accesos rápidos institucionales para redes y medios de contacto de VALMAT.
const SOCIAL_ITEMS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/valmatlimpieza',
    icon: FaInstagram
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/valmatlimpieza?mibextid=wwXIfr&rdid=MBp3xqKcy0NO34gK&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1PEX9i852y%2F%3Fmibextid%3DwwXIfr#',
    icon: FaFacebookF
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/543815695970',
    icon: FaWhatsapp
  },
  {
    label: 'Email',
    href: 'mailto:valmatlimpieza@gmail.com',
    icon: HiOutlineEnvelope
  }
];

function Navbar({ logoSrc, brand = 'VALMAT' }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Benjamin Orellana - 2026/04/21 - Ajusta la presencia visual del navbar según el desplazamiento vertical.
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Benjamin Orellana - 2026/04/21 - Bloquea el scroll del documento cuando el menú mobile está desplegado.
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Benjamin Orellana - 2026/04/22 - Cierra el menú mobile reutilizando un único handler para mantener consistente la experiencia.
  const handleCloseMenu = () => setOpen(false);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/80 bg-white/92 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'bg-white/88 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
          {/* Benjamin Orellana - 2026/04/21 - Marca principal con presencia visual y microinteracción sobria. */}
          <a
            href="#inicio"
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-300"
            onClick={handleCloseMenu}
            aria-label="Ir al inicio"
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="VALMAT"
                className="h-12 w-auto object-contain transition-all duration-300 group-hover:-translate-y-[1px] group-hover:scale-[1.03] group-hover:drop-shadow-[0_10px_22px_rgba(25,211,223,0.20)] sm:h-14"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-extrabold tracking-[0.18em] text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-[1px] group-hover:scale-[1.03] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] group-hover:shadow-[0_12px_26px_rgba(25,211,223,0.18)]">
                V
              </div>
            )}

            <div className="flex min-w-0 flex-col justify-center">
              <span className="titulo text-[1.7rem] leading-none tracking-[0.14em] text-slate-950 transition-all duration-300 group-hover:tracking-[0.18em] group-hover:text-[var(--color-accent)] sm:text-[1.95rem]">
                {brand}
              </span>

              <span className="cuerpo mt-1 hidden text-[0.68rem] font-medium uppercase tracking-[0.26em] text-slate-500 sm:block">
                Servicios de limpieza profesional
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="cuerpo relative text-[0.95rem] font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[1px] hover:text-slate-950 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-[var(--color-primary)] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {/* Benjamin Orellana - 2026/04/22 - Acciones sociales en desktop ubicadas a la izquierda del CTA principal sin alterar la estructura visual base. */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.03] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[0_18px_34px_rgba(25,211,223,0.18)]"
                  >
                    <Icon className="text-[1rem] transition-transform duration-300 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>

            <a
              href="#contacto"
              className="cuerpo inline-flex items-center justify-center rounded-full border border-[var(--color-primary)] bg-white px-5 py-3 text-[0.95rem] font-semibold text-[var(--color-primary)] shadow-[0_10px_30px_rgba(25,211,223,0.10)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.02] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[0_18px_38px_rgba(25,211,223,0.22)]"
            >
              Solicitar contacto
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border bg-white text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[1px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-[0_14px_26px_rgba(25,211,223,0.16)] lg:hidden ${
              open
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-slate-200'
            }`}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <HiXMark size={24} /> : <HiBars3 size={24} />}
          </button>
        </div>
      </header>

      <div className="h-[88px] sm:h-[96px]" />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[3px] lg:hidden"
          onClick={handleCloseMenu}
        >
          {/* Benjamin Orellana - 2026/04/22 - Rediseño mobile del navbar con panel tipo sheet, accesos rápidos visibles y jerarquía más clara. */}
          <div
            className="absolute inset-x-0 bottom-0 top-[84px] overflow-hidden rounded-t-[30px] border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,250,252,0.98)_100%)] shadow-[0_-24px_60px_rgba(15,23,42,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto px-5 pb-8 pt-5">
              <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-slate-200" />

              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="titulo text-[1.15rem] tracking-[0.18em] text-slate-950">
                    {brand}
                  </p>
                  <p className="cuerpo mt-1 text-[0.86rem] leading-relaxed text-slate-500">
                    Servicios de limpieza profesional
                  </p>
                </div>

                <a
                  href="#contacto"
                  onClick={handleCloseMenu}
                  className="cuerpo inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-[0.84rem] font-semibold text-white shadow-[0_12px_28px_rgba(25,211,223,0.22)] transition-all duration-300 active:scale-[0.98]"
                >
                  Contacto
                  <HiArrowUpRight className="text-[0.95rem]" />
                </a>
              </div>

              <div className="mb-6 rounded-[24px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                <p className="cuerpo mb-3 px-1 text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Canales directos
                </p>

                <div className="grid grid-cols-4 gap-2.5">
                  {SOCIAL_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        className="group flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50/80 px-2 py-3 text-center transition-all duration-300 active:scale-[0.98] active:border-[var(--color-primary)] active:bg-white"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-300 group-active:bg-[var(--color-primary)] group-active:text-white">
                          <Icon className="text-[1rem]" />
                        </span>
                        <span className="cuerpo text-[0.72rem] font-semibold leading-none text-slate-600">
                          {item.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              <nav className="flex flex-col gap-3">
                {NAV_ITEMS.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleCloseMenu}
                    className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-300 active:scale-[0.99] active:border-[var(--color-primary)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="cuerpo block text-[1rem] font-semibold text-slate-900">
                          {item.label}
                        </span>
                        <span className="cuerpo mt-1 block text-[0.78rem] text-slate-500">
                          Sección {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-300 group-active:border-[var(--color-primary)] group-active:bg-[var(--color-primary)] group-active:text-white">
                        <HiArrowUpRight className="text-[1rem]" />
                      </span>
                    </div>
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                <p className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Contacto rápido
                </p>

                <a
                  href="https://wa.me/543815695970"
                  target="_blank"
                  rel="noreferrer"
                  className="cuerpo mt-3 flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-[0.95rem] font-semibold text-slate-800 transition-all duration-300 active:scale-[0.99] active:border-[var(--color-primary)]"
                >
                  <span>0381 569-5970</span>
                  <FaWhatsapp className="text-[1.05rem] text-slate-500" />
                </a>

                <a
                  href="mailto:valmatlimpieza@gmail.com"
                  className="cuerpo mt-3 flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-[0.95rem] font-semibold text-slate-800 transition-all duration-300 active:scale-[0.99] active:border-[var(--color-primary)]"
                >
                  <span className="truncate">valmatlimpieza@gmail.com</span>
                  <HiOutlineEnvelope className="ml-3 shrink-0 text-[1.05rem] text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
