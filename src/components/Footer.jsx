// Benjamin Orellana - 2026/04/21 - Footer institucional moderno y responsive para la landing pública de VALMAT.

import { HiArrowUpRight, HiOutlineEnvelope } from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' }
];

const SERVICE_LINKS = [
  { label: 'Final de obra', href: '#servicios' },
  { label: 'Limpieza integral', href: '#servicios' },
  { label: 'Tapizados y sillones', href: '#servicios' }
];

// Benjamin Orellana - 2026/04/22 - Accesos rápidos de redes y contacto institucional para reutilizar en el footer.
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

function Footer({ logoSrc, brand = 'VALMAT' }) {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
      {/* Benjamin Orellana - 2026/04/21 - Fondo sutil para dar presencia al footer sin ensuciar la experiencia. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.08)_0%,rgba(25,211,223,0)_72%)]" />
        <div className="absolute right-[-8%] bottom-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.08)_0%,rgba(90,151,208,0)_72%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-10 border-b border-slate-200 pb-10 lg:grid-cols-[1.2fr_0.85fr_0.9fr_1.05fr]">
          <div className="max-w-md">
            <a
              href="#inicio"
              className="group inline-flex items-center gap-3"
              aria-label="Ir al inicio"
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="VALMAT"
                  className="h-12 w-auto object-contain transition-all duration-300 group-hover:scale-[1.02] group-hover:drop-shadow-[0_10px_22px_rgba(25,211,223,0.16)] sm:h-14"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-extrabold tracking-[0.18em] text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                  V
                </div>
              )}

              <div className="min-w-0">
                <p className="titulo text-[1.5rem] leading-none tracking-[0.12em] text-slate-950 sm:text-[1.75rem]">
                  {brand}
                </p>
                <p className="cuerpo mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Servicios de limpieza profesional
                </p>
              </div>
            </a>

            <p className="cuerpo mt-5 text-[0.98rem] leading-7 text-slate-600">
              Limpieza técnica especializada, planificación, gestión y precisión
              para espacios que requieren una ejecución profesional e imagen
              impecable.
            </p>

            {/* Benjamin Orellana - 2026/04/22 - Iconos sociales y de contacto integrados al bloque principal del footer para reforzar la conversión. */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
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
              className="cuerpo mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(25,211,223,0.18)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] hover:shadow-[0_20px_42px_rgba(25,211,223,0.24)]"
            >
              Solicitar contacto
              <HiArrowUpRight className="text-[1rem]" />
            </a>
          </div>

          <div>
            <p className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Navegación
            </p>

            <nav className="mt-5 flex flex-col gap-3">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="cuerpo text-[0.98rem] font-semibold text-slate-700 transition-all duration-300 hover:translate-x-[2px] hover:text-[var(--color-primary)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Servicios
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {SERVICE_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="cuerpo text-[0.98rem] font-semibold text-slate-700 transition-all duration-300 hover:translate-x-[2px] hover:text-[var(--color-primary)]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="cuerpo text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Contacto
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </p>
                <a
                  href="mailto:valmatlimpieza@gmail.com"
                  className="cuerpo mt-1 block break-all text-[0.98rem] font-semibold text-slate-700 transition-colors duration-300 hover:text-[var(--color-primary)]"
                >
                  valmatlimpieza@gmail.com
                </a>
              </div>

              <div>
                <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Teléfono
                </p>
                <a
                  href="tel:+543815695970"
                  className="cuerpo mt-1 block text-[0.98rem] font-semibold text-slate-700 transition-colors duration-300 hover:text-[var(--color-primary)]"
                >
                  0381 569-5970
                </a>
              </div>

              <div>
                <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Instagram
                </p>
                <a
                  href="https://www.instagram.com/valmatlimpieza"
                  target="_blank"
                  rel="noreferrer"
                  className="cuerpo mt-1 inline-flex items-center gap-2 text-[0.98rem] font-semibold text-slate-700 transition-colors duration-300 hover:text-[var(--color-primary)]"
                >
                  @valmatlimpieza
                  <HiArrowUpRight className="text-[0.95rem]" />
                </a>
              </div>

              <div>
                <p className="cuerpo text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Facebook
                </p>
                <a
                  href="https://www.facebook.com/valmatlimpieza?mibextid=wwXIfr&rdid=MBp3xqKcy0NO34gK&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1PEX9i852y%2F%3Fmibextid%3DwwXIfr#"
                  target="_blank"
                  rel="noreferrer"
                  className="cuerpo mt-1 inline-flex items-center gap-2 text-[0.98rem] font-semibold text-slate-700 transition-colors duration-300 hover:text-[var(--color-primary)]"
                >
                  Ver perfil
                  <HiArrowUpRight className="text-[0.95rem]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="cuerpo text-[0.9rem] text-slate-500">
            © {new Date().getFullYear()} {brand}. Todos los derechos reservados.
          </p>

          {/* Benjamin Orellana - 2026/04/22 - Firma de desarrollo con enlace directo al sitio de Soft Fusion. */}
          <a
            href="https://softfusion.com.ar/"
            target="_blank"
            rel="noreferrer"
            className="cuerpo text-pi inline-flex items-center justify-center gap-2 text-[0.9rem] font-semibold text-slate-500 transition-colors duration-300 hover:text-[var(--color-primary)] sm:justify-end"
          >
            Diseñado y desarrollado por <span className="text-pink-600">Soft Fusion</span>
            <HiArrowUpRight className="text-[0.95rem]" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
