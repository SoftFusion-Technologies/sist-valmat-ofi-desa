// Benjamin Orellana - 28/04/2026 - Cotizador público Hogar VALMAT con carrito, cálculo backend, agenda y creación de solicitud.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  HiArrowLeft,
  HiArrowRight,
  HiCalculator,
  HiCalendarDays,
  HiCheckBadge,
  HiChevronRight,
  HiClock,
  HiEnvelope,
  HiHome,
  HiInformationCircle,
  HiMapPin,
  HiPhone,
  HiPlus,
  HiPlusCircle,
  HiRectangleStack,
  HiShieldCheck,
  HiSparkles,
  HiSquares2X2,
  HiTrash,
  HiTruck,
  HiUser,
  HiXMark
} from 'react-icons/hi2';
import Navbar from '../../components/Navbar';
const API_URL = import.meta.env.VITE_API_URL;
const WHATSAPP_URL =
  import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/5493815695970';

const SERVICE_ICON_MAP = {
  SILLON: HiHome,
  SILLON_L: HiRectangleStack,
  SILLA: HiSquares2X2,
  COLCHON: HiRectangleStack,
  ALFOMBRA: HiSquares2X2,
  ALFOMBRADO: HiRectangleStack,
  VEHICULO: HiTruck,
  INFANTIL: HiSparkles,
  ADICIONALES: HiPlusCircle
};

const SERVICE_COPY = {
  SILLON: {
    title: 'Sillones',
    subtitle:
      'Seleccioná el largo del sillón individual e ingresá las medidas.',
    hint: 'Medí de extremo a extremo.'
  },
  SILLON_L: {
    title: 'Sillón en L',
    subtitle: 'Ingresá el largo de cada tramo para calcular el precio final.',
    hint: 'Medí ambos tramos principales.'
  },
  SILLA: {
    title: 'Sillas',
    subtitle: 'Elegí el tipo de limpieza y la cantidad de sillas.',
    hint: 'Podés cargar varias unidades juntas.'
  },
  COLCHON: {
    title: 'Colchones',
    subtitle: 'Indicá el ancho del colchón para calcular el servicio.',
    hint: 'Usá el ancho real del colchón.'
  },
  ALFOMBRA: {
    title: 'Alfombras',
    subtitle: 'Ingresá largo y ancho para calcular los metros cuadrados.',
    hint: 'Medí largo por ancho.'
  },
  ALFOMBRADO: {
    title: 'Alfombrados',
    subtitle: 'Indicá los metros cuadrados aproximados del espacio.',
    hint: 'Cargá el total de m² a limpiar.'
  },
  VEHICULO: {
    title: 'Vehículos',
    subtitle: 'Seleccioná el tamaño del vehículo para calcular el servicio.',
    hint: 'La duración depende del tamaño elegido.'
  },
  INFANTIL: {
    title: 'Infantiles',
    subtitle: 'Elegí el elemento infantil y agregalo a la cotización.',
    hint: 'Ideal para huevitos, coches y sillitas.'
  }
};

const steps = [
  {
    id: 1,
    title: 'Ingresá tus medidas',
    icon: HiHome
  },
  {
    id: 2,
    title: 'El sistema calcula el precio',
    icon: HiCalculator
  },
  {
    id: 3,
    title: 'Agregás más servicios',
    icon: HiPlusCircle
  },
  {
    id: 4,
    title: 'Elegís día y horario',
    icon: HiCalendarDays
  }
];

const benefits = [
  {
    title: 'Desinfección profunda',
    text: 'Eliminamos ácaros, bacterias y malos olores.',
    icon: HiShieldCheck
  },
  {
    title: 'Secado rápido',
    text: 'Tecnología de última generación para un secado eficiente.',
    icon: HiClock
  },
  {
    title: 'Productos seguros',
    text: 'Utilizamos productos biodegradables y seguros para tu familia y mascotas.',
    icon: HiSparkles
  },
  {
    title: 'Resultados profesionales',
    text: 'Más de 10 años de experiencia y clientes satisfechos.',
    icon: HiCheckBadge
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
};

const formatDuration = (minutes) => {
  const total = Number(minutes || 0);

  if (total <= 0) return 'Sin calcular';

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours <= 0) return `${mins} min`;

  if (mins === 0) return `${hours} h`;

  return `${hours} h ${mins} min`;
};

const normalizeCode = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_');
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
};

const getTomorrowISO = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
};

const safeJson = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getServiceIcon = (code) => {
  return SERVICE_ICON_MAP[normalizeCode(code)] || HiSparkles;
};

const getServiceCopy = (code, service = {}) => {
  return (
    SERVICE_COPY[normalizeCode(code)] || {
      title: service.nombre || service.title || 'Servicio',
      subtitle: service.descripcion || 'Completá los datos para calcular.',
      hint: 'Ingresá la información solicitada.'
    }
  );
};

const getInitialDraft = (service, variants = []) => {
  const firstVariant = variants?.[0]?.codigo || '';

  return {
    cantidad: 1,
    largo: '',
    ancho: '',
    m2: '',
    tramo_a: '',
    tramo_b: '',
    variante_codigo: firstVariant,
    adicionales: {}
  };
};

const validateDraft = (service, draft) => {
  const code = normalizeCode(service?.codigo);

  if (!service) {
    return 'Seleccioná un servicio para continuar.';
  }

  if (toNumber(draft.cantidad, 1) <= 0) {
    return 'La cantidad debe ser mayor a cero.';
  }

  if (code === 'SILLON' && toNumber(draft.largo) <= 0) {
    return 'Ingresá el largo del sillón.';
  }

  if (
    code === 'SILLON_L' &&
    (toNumber(draft.tramo_a) <= 0 || toNumber(draft.tramo_b) <= 0)
  ) {
    return 'Ingresá el largo de ambos tramos del sillón en L.';
  }

  if (code === 'SILLA' && !draft.variante_codigo) {
    return 'Seleccioná el tipo de silla.';
  }

  if (code === 'COLCHON' && toNumber(draft.ancho) <= 0) {
    return 'Ingresá el ancho del colchón.';
  }

  if (
    code === 'ALFOMBRA' &&
    (toNumber(draft.largo) <= 0 || toNumber(draft.ancho) <= 0)
  ) {
    return 'Ingresá largo y ancho de la alfombra.';
  }

  if (code === 'ALFOMBRADO' && toNumber(draft.m2) <= 0) {
    return 'Ingresá los metros cuadrados del alfombrado.';
  }

  if ((code === 'VEHICULO' || code === 'INFANTIL') && !draft.variante_codigo) {
    return 'Seleccioná una variante para continuar.';
  }

  return '';
};

const buildItemPayload = (service, draft, adicionales = []) => {
  const code = normalizeCode(service.codigo);

  const payload = {
    codigo: code,
    cantidad: toNumber(draft.cantidad, 1)
  };

  if (code === 'SILLON') {
    payload.largo = toNumber(draft.largo);
  }

  if (code === 'SILLON_L') {
    payload.tramo_a = toNumber(draft.tramo_a);
    payload.tramo_b = toNumber(draft.tramo_b);
  }

  if (code === 'SILLA' || code === 'VEHICULO' || code === 'INFANTIL') {
    payload.variante_codigo = draft.variante_codigo;
  }

  if (code === 'COLCHON') {
    payload.ancho = toNumber(draft.ancho);
  }

  if (code === 'ALFOMBRA') {
    payload.largo = toNumber(draft.largo);
    payload.ancho = toNumber(draft.ancho);
  }

  if (code === 'ALFOMBRADO') {
    payload.m2 = toNumber(draft.m2);
  }

  const selectedAdicionales = Object.entries(draft.adicionales || {})
    .filter(([, selected]) => selected)
    .map(([codigo]) => {
      const adicional = adicionales.find(
        (item) => normalizeCode(item.codigo) === normalizeCode(codigo)
      );

      return {
        codigo,
        cantidad: adicional?.aplica_por_unidad ? payload.cantidad : 1
      };
    });

  if (selectedAdicionales.length > 0) {
    payload.adicionales = selectedAdicionales;
  }

  return payload;
};

const findVariantId = (catalog, codigoServicio, codigoVariante) => {
  if (!codigoServicio || !codigoVariante) return null;

  const service = catalog.servicios.find(
    (item) => normalizeCode(item.codigo) === normalizeCode(codigoServicio)
  );

  const serviceVariants = Array.isArray(service?.variantes_cotizador)
    ? service.variantes_cotizador
    : [];

  const variant =
    serviceVariants.find(
      (item) => normalizeCode(item.codigo) === normalizeCode(codigoVariante)
    ) ||
    catalog.variantes.find(
      (item) =>
        Number(item.cotizador_servicio_id) === Number(service?.id) &&
        normalizeCode(item.codigo) === normalizeCode(codigoVariante)
    );

  return variant?.id || null;
};

const buildSolicitudItems = (quoteItems = [], catalog) => {
  return quoteItems.map((item) => {
    const service = catalog.servicios.find(
      (servicio) =>
        normalizeCode(servicio.codigo) === normalizeCode(item.codigo_item)
    );

    return {
      cotizador_servicio_id: service?.id || null,
      cotizador_variante_id: findVariantId(
        catalog,
        item.codigo_item,
        item.variante_codigo
      ),
      codigo_item: item.codigo_item,
      nombre_item: item.nombre_item,
      categoria: item.categoria,
      variante: item.variante,
      cantidad: item.cantidad,
      largo: item.largo,
      ancho: item.ancho,
      m2: item.m2,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
      duracion_min: item.duracion_min,
      metadata: item.metadata || null
    };
  });
};

function TopProgress({ activeStep }) {
  return (
    <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)] lg:flex">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const active = activeStep >= step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex min-w-[205px] items-center gap-3 px-5 py-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                  active
                    ? 'border-emerald-100 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {step.id === 1 ? (
                  <span className="text-sm font-black">{step.id}</span>
                ) : (
                  <Icon className="text-[1.12rem]" />
                )}
              </span>

              <p className="cuerpo text-[0.9rem] font-semibold leading-5 text-slate-800">
                {step.title}
              </p>
            </div>

            {index !== steps.length - 1 && (
              <HiChevronRight className="mx-1 text-xl text-slate-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ServiceVisual({ code, draft }) {
  const normalizedCode = normalizeCode(code);

  if (normalizedCode === 'SILLON_L') {
    return (
      <div className="relative mx-auto mt-5 flex h-[230px] max-w-[330px] items-center justify-center">
        <div className="absolute left-10 top-10 h-24 w-52 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8f3eb_0%,#dfd4c5_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.12)]" />
        <div className="absolute bottom-8 left-10 h-28 w-24 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8f3eb_0%,#dfd4c5_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.12)]" />
        <div className="absolute left-8 top-4 text-[0.8rem] font-bold text-emerald-700">
          Tramo A {draft.tramo_a || '0'} m
        </div>
        <div className="absolute bottom-2 left-2 text-[0.8rem] font-bold text-emerald-700">
          Tramo B {draft.tramo_b || '0'} m
        </div>
      </div>
    );
  }

  if (normalizedCode === 'ALFOMBRA' || normalizedCode === 'ALFOMBRADO') {
    return (
      <div className="mx-auto mt-5 flex h-[230px] max-w-[330px] items-center justify-center">
        <div className="relative h-44 w-56 rounded-[26px] border-2 border-dashed border-emerald-500 bg-[linear-gradient(135deg,#f8fafc_0%,#e0f7f4_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-5 rounded-[20px] border border-emerald-200" />
          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-[0.8rem] font-bold text-emerald-700">
            {draft.largo || draft.m2 || '0'}{' '}
            {normalizedCode === 'ALFOMBRADO' ? 'm²' : 'm'}
          </div>
          {normalizedCode === 'ALFOMBRA' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[0.8rem] font-bold text-emerald-700">
              {draft.ancho || '0'} m
            </div>
          )}
        </div>
      </div>
    );
  }

  if (normalizedCode === 'VEHICULO') {
    return (
      <div className="mx-auto mt-5 flex h-[230px] max-w-[330px] items-center justify-center">
        <div className="relative h-28 w-64 rounded-[38px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#dbeafe_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
          <div className="absolute left-10 top-[-32px] h-14 w-36 rounded-t-[34px] border border-slate-200 bg-slate-50" />
          <div className="absolute bottom-[-18px] left-9 h-10 w-10 rounded-full border-4 border-white bg-slate-900" />
          <div className="absolute bottom-[-18px] right-9 h-10 w-10 rounded-full border-4 border-white bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto mt-5 flex h-[230px] max-w-[330px] items-center justify-center">
      <div className="absolute top-4 h-[1px] w-[78%] bg-emerald-600">
        <span className="absolute left-0 top-[-5px] h-3 w-3 rounded-full bg-emerald-600" />
        <span className="absolute right-0 top-[-5px] h-3 w-3 rounded-full bg-emerald-600" />
        <span className="absolute left-1/2 top-[-24px] -translate-x-1/2 text-sm font-black text-emerald-700">
          {draft.largo || draft.ancho || '0'} m
        </span>
      </div>

      <div className="relative mt-5 h-40 w-52 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f9f2e8_0%,#e5d8c8_100%)] shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
        <div className="absolute bottom-4 left-5 right-5 h-14 rounded-[22px] border border-white/70 bg-[#f8efe4] shadow-inner" />
        <div className="absolute left-[-20px] top-12 h-28 w-10 rounded-[18px] bg-[#e1d2c0]" />
        <div className="absolute right-[-20px] top-12 h-28 w-10 rounded-[18px] bg-[#e1d2c0]" />
        <div className="absolute bottom-[-18px] left-8 h-8 w-4 rounded-full bg-[#60432d]" />
        <div className="absolute bottom-[-18px] right-8 h-8 w-4 rounded-full bg-[#60432d]" />
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  type = 'number',
  placeholder = '0'
}) {
  return (
    <label className="block">
      <span className="cuerpo text-[0.9rem] font-semibold text-slate-800">
        {label}
      </span>

      <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)] focus-within:border-emerald-500">
        <input
          type={type}
          min="0"
          step="0.01"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="cuerpo h-12 w-full border-0 bg-transparent px-4 text-[1rem] font-semibold text-slate-900 outline-none"
        />

        {suffix && (
          <span className="flex h-12 min-w-14 items-center justify-center border-l border-slate-100 px-3 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

// Benjamin Orellana - 29/04/2026 - Formatea nombres de variantes del carrito para mostrar información legible al cliente.
const formatVariantLabel = (value) => {
  if (!value) return '';

  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// Benjamin Orellana - 29/04/2026 - Genera una descripción clara de medidas o variantes para cada ítem del carrito.
const getCartItemDetailLabel = (item = {}, calculatedItem = null) => {
  const code = normalizeCode(item.codigo || item.codigo_item);

  if (code === 'SILLON') {
    return item.largo ? `${item.largo} m` : calculatedItem?.largo ? `${calculatedItem.largo} m` : '';
  }

  if (code === 'SILLON_L') {
    if (item.tramo_a && item.tramo_b) {
      return `${item.tramo_a} m + ${item.tramo_b} m`;
    }

    return '';
  }

  if (code === 'SILLA' || code === 'VEHICULO' || code === 'INFANTIL') {
    return (
      calculatedItem?.variante ||
      formatVariantLabel(item.variante_codigo) ||
      ''
    );
  }

  if (code === 'COLCHON') {
    return item.ancho ? `${item.ancho} m de ancho` : calculatedItem?.ancho ? `${calculatedItem.ancho} m de ancho` : '';
  }

  if (code === 'ALFOMBRA') {
    if (item.largo && item.ancho) {
      return `${item.largo} m x ${item.ancho} m`;
    }

    if (calculatedItem?.m2) {
      return `${calculatedItem.m2} m²`;
    }

    return '';
  }

  if (code === 'ALFOMBRADO') {
    return item.m2 ? `${item.m2} m²` : calculatedItem?.m2 ? `${calculatedItem.m2} m²` : '';
  }

  return '';
};

// Benjamin Orellana - 29/04/2026 - Obtiene solo los ítems principales calculados, excluyendo adicionales.
const getMainQuoteItems = (quoteItems = []) => {
  if (!Array.isArray(quoteItems)) return [];

  return quoteItems.filter((item) => {
    return !item.metadata?.es_adicional && !item.metadata?.es_adicional_global;
  });
};

function HogarCotizador({ logoSrc }) {
  const [catalog, setCatalog] = useState({
    tiposCliente: [],
    servicios: [],
    variantes: [],
    adicionales: []
  });

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const [activeServiceCode, setActiveServiceCode] = useState('');
  const [draft, setDraft] = useState(getInitialDraft(null, []));
  const [cart, setCart] = useState([]);

  const [quote, setQuote] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTomorrowISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Benjamin Orellana - 28/04/2026 - Controla cuándo se muestra el bloque de agenda y datos luego de calcular el carrito.
  const [showTurnoStep, setShowTurnoStep] = useState(false);
  const turnoSectionRef = useRef(null);

  const [client, setClient] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    localidad: '',
    provincia: 'Tucumán',
    observaciones_cliente: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const hogarType = useMemo(() => {
    return (
      catalog.tiposCliente.find(
        (item) => normalizeCode(item.codigo) === 'PARTICULAR'
      ) ||
      catalog.tiposCliente.find(
        (item) => normalizeCode(item.nombre) === 'HOGAR'
      ) ||
      null
    );
  }, [catalog.tiposCliente]);

  const activeService = useMemo(() => {
    return catalog.servicios.find(
      (service) =>
        normalizeCode(service.codigo) === normalizeCode(activeServiceCode)
    );
  }, [catalog.servicios, activeServiceCode]);

  const activeServiceVariants = useMemo(() => {
    if (!activeService) return [];

    const inlineVariants = Array.isArray(activeService.variantes_cotizador)
      ? activeService.variantes_cotizador
      : [];

    const variants =
      inlineVariants.length > 0
        ? inlineVariants
        : catalog.variantes.filter(
            (item) =>
              Number(item.cotizador_servicio_id) === Number(activeService.id)
          );

    return variants
      .filter(
        (item) =>
          item.activo === 1 || item.activo === true || item.activo === '1'
      )
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  }, [activeService, catalog.variantes]);

  const activeStep = useMemo(() => {
    if (selectedSlot) return 4;
    if (quote?.total_estimado) return 3;
    if (cart.length > 0) return 2;
    return 1;
  }, [cart.length, quote, selectedSlot]);

  // Benjamin Orellana - 29/04/2026 - Relaciona los ítems del carrito con los ítems principales calculados por backend.
  const mainQuoteItems = useMemo(() => {
    return getMainQuoteItems(quote?.items);
  }, [quote]);

  const loadCatalog = async () => {
    try {
      setLoadingCatalog(true);
      setCatalogError('');

      const response = await fetch(`${API_URL}/servicios-cotizador-publico`);
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudo cargar la configuración del cotizador.'
        );
      }

      const payload = data?.data || {};
      const tiposCliente = Array.isArray(payload.tipos_cliente)
        ? payload.tipos_cliente
        : [];

      const serviciosRaw = Array.isArray(payload.servicios_cotizables)
        ? payload.servicios_cotizables
        : [];

      const hogar = tiposCliente.find(
        (item) => normalizeCode(item.codigo) === 'PARTICULAR'
      );

      const servicios = serviciosRaw
        .filter((service) => {
          if (!hogar?.id) return true;

          return Number(service.tipo_cliente_id) === Number(hogar.id);
        })
        .sort(
          (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
        );

      const variantes = Array.isArray(payload.variantes)
        ? payload.variantes
        : [];
      const adicionales = Array.isArray(payload.adicionales)
        ? payload.adicionales
        : [];

      setCatalog({
        tiposCliente,
        servicios,
        variantes,
        adicionales
      });

      const initialService =
        servicios.find(
          (service) => normalizeCode(service.codigo) === 'SILLON'
        ) || servicios[0];

      if (initialService) {
        const variants = Array.isArray(initialService.variantes_cotizador)
          ? initialService.variantes_cotizador
          : variantes.filter(
              (item) =>
                Number(item.cotizador_servicio_id) === Number(initialService.id)
            );

        setActiveServiceCode(initialService.codigo);
        setDraft(getInitialDraft(initialService, variants));
      }
    } catch (error) {
      setCatalogError(error.message || 'No se pudo cargar el cotizador.');
    } finally {
      setLoadingCatalog(false);
    }
  };

  const calculateCart = async (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setQuote(null);
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    try {
      setCalculating(true);

      const response = await fetch(
        `${API_URL}/servicios-cotizador/calcular-hogar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cartItems.map(({ uiId, ...item }) => item)
          })
        }
      );

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo calcular la cotización.'
        );
      }

      setQuote(data.data);
      setSelectedSlot(null);
      setShowTurnoStep(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo calcular',
        text: error.message || 'Revisá los datos ingresados.',
        confirmButtonColor: '#0f766e'
      });
    } finally {
      setCalculating(false);
    }
  };

  const loadSlots = async () => {
    if (!quote?.duracion_total_min || !selectedDate) {
      setSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);

      const params = new URLSearchParams({
        fecha: selectedDate,
        duracion_min: String(quote.duracion_total_min)
      });

      const response = await fetch(
        `${API_URL}/servicios-turnos-disponibles?${params.toString()}`
      );
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar los horarios disponibles.'
        );
      }

      setSlots(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setSlots([]);
      Swal.fire({
        icon: 'error',
        title: 'Agenda no disponible',
        text: error.message || 'No se pudieron consultar los horarios.',
        confirmButtonColor: '#0f766e'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateCart(cart);
    }, 250);

    return () => clearTimeout(timer);
  }, [cart]);

  useEffect(() => {
    loadSlots();
  }, [selectedDate, quote?.duracion_total_min]);

  const selectService = (service) => {
    const variants = Array.isArray(service.variantes_cotizador)
      ? service.variantes_cotizador
      : catalog.variantes.filter(
          (item) => Number(item.cotizador_servicio_id) === Number(service.id)
        );

    setActiveServiceCode(service.codigo);
    setDraft(getInitialDraft(service, variants));
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  };

  const toggleAdicional = (codigo) => {
    setDraft((current) => ({
      ...current,
      adicionales: {
        ...current.adicionales,
        [codigo]: !current.adicionales?.[codigo]
      }
    }));
  };

  const addToCart = () => {
    const error = validateDraft(activeService, draft);

    if (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta información',
        text: error,
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    const payload = buildItemPayload(activeService, draft, catalog.adicionales);

    setCart((current) => [
      ...current,
      {
        ...payload,
        uiId: `${Date.now()}-${Math.random()}`
      }
    ]);

    setDraft(getInitialDraft(activeService, activeServiceVariants));
  };

  const removeCartItem = (uiId) => {
    setCart((current) => current.filter((item) => item.uiId !== uiId));
  };

  const clearCart = () => {
    setCart([]);
    setQuote(null);
    setSelectedSlot(null);
    setSlots([]);
    setShowTurnoStep(false);
  };

  // Benjamin Orellana - 28/04/2026 - Abre el paso de agenda solo cuando el carrito ya tiene una cotización válida.
  const handleOpenTurnoStep = () => {
    if (!quote || cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Primero agregá un servicio',
        text: 'Necesitamos calcular el total y la duración antes de mostrar horarios.',
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    setShowTurnoStep(true);

    setTimeout(() => {
      turnoSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 120);
  };

  const submitSolicitud = async () => {
    if (!quote || cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agregá al menos un servicio para enviar la solicitud.',
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    if (!selectedSlot) {
      Swal.fire({
        icon: 'warning',
        title: 'Elegí un horario',
        text: 'Seleccioná un día y horario disponible para continuar.',
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    if (!client.nombre.trim() || !client.telefono.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Nombre y teléfono son obligatorios.',
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    if (!hogarType?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Configuración incompleta',
        text: 'No se encontró el tipo de cliente Hogar/PARTICULAR.',
        confirmButtonColor: '#0f766e'
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tipo_cliente_id: hogarType.id,
        nombre: client.nombre,
        apellido: client.apellido,
        telefono: client.telefono,
        email: client.email,
        direccion: client.direccion,
        localidad: client.localidad,
        provincia: client.provincia,
        estado: 'NUEVA',
        origen: 'WEB_HOGAR_COTIZADOR',
        subtotal: quote.subtotal,
        descuento_total: quote.descuento_total,
        total_estimado: quote.total_estimado,
        duracion_total_min: quote.duracion_total_min,
        fecha_preferida: selectedSlot.fecha,
        hora_preferida: selectedSlot.hora_inicio,
        requiere_visita_tecnica: 0,
        observaciones_cliente: client.observaciones_cliente,
        metadata: {
          flujo: 'HOGAR_COTIZADOR',
          carrito_original: cart,
          calculo_backend: quote.metadata,
          minimo_operativo: quote.minimo_operativo || 70000,
          ajuste_minimo_operativo: quote.ajuste_minimo_operativo || 0,
          total_antes_minimo_operativo:
            quote.total_antes_minimo_operativo || quote.total_estimado
        },
        items: buildSolicitudItems(quote.items, catalog),
        promociones: quote.promociones || [],
        turno: {
          fecha: selectedSlot.fecha,
          hora_inicio: selectedSlot.hora_inicio,
          hora_fin: selectedSlot.hora_fin,
          duracion_min: selectedSlot.duracion_min,
          estado: 'PRE_RESERVADO',
          metadata: {
            origen: 'WEB_HOGAR_COTIZADOR'
          }
        },
        comentario_estado: 'Solicitud creada desde cotizador público Hogar.'
      };

      const response = await fetch(`${API_URL}/servicios-solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message || data?.error || 'No se pudo enviar la solicitud.'
        );
      }

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'VALMAT recibió tu solicitud. Te contactaremos para confirmar el servicio.',
        confirmButtonColor: '#0f766e'
      });

      clearCart();
      setClient({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        direccion: '',
        localidad: '',
        provincia: 'Tucumán',
        observaciones_cliente: ''
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: error.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0f766e'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = getServiceCopy(activeServiceCode, activeService);
  const ActiveIcon = getServiceIcon(activeServiceCode);

  return (
    <>
      <Navbar logoSrc={logoSrc}></Navbar>
      <main className="min-h-screen bg-[#f7f9fb] px-3 py-4 text-[#071946] sm:px-5 lg:px-6">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <TopProgress activeStep={activeStep} />

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="cuerpo inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-white px-4 py-3 text-[0.9rem] font-black text-emerald-700 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-emerald-50"
          >
            <HiPhone className="text-[1.1rem]" />
            WhatsApp
          </a>
        </motion.header>

        <section className="mx-auto mt-5 grid max-w-[1520px] gap-5 lg:grid-cols-[280px_1fr_430px]">
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
          >
            <h2 className="titulo px-2 text-[1rem] font-black uppercase tracking-[0.08em] text-[#071946]">
              Agregá servicios
            </h2>

            {loadingCatalog ? (
              <div className="mt-5 grid gap-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : catalogError ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {catalogError}
              </div>
            ) : (
              <div className="mt-5 grid gap-2">
                {catalog.servicios.map((service) => {
                  const code = normalizeCode(service.codigo);
                  const Icon = getServiceIcon(code);
                  const active = normalizeCode(activeServiceCode) === code;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => selectService(service)}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                        active
                          ? 'bg-[#072b68] text-white shadow-[0_16px_34px_rgba(7,43,104,0.24)]'
                          : 'bg-white text-[#071946] hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`text-[1.45rem] ${
                          active ? 'text-white' : 'text-[#071946]'
                        }`}
                      />
                      <span className="cuerpo text-[0.95rem] font-bold">
                        {service.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <HiShieldCheck className="mt-1 shrink-0 text-[2rem] text-emerald-700" />
                <p className="cuerpo text-[0.82rem] font-semibold leading-6 text-emerald-900">
                  Todos los servicios incluyen proceso profesional y terminación
                  cuidada.
                </p>
              </div>
            </div>
          </motion.aside>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="cuerpo text-[0.76rem] font-black uppercase tracking-[0.22em] text-emerald-700">
                  Cotizador Hogar
                </p>
                <h2 className="titulo mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-[#071946] sm:text-4xl">
                  {copy.title}
                </h2>
                <p className="cuerpo mt-2 max-w-2xl text-[0.96rem] leading-7 text-slate-600">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#072b68] text-white shadow-[0_16px_36px_rgba(7,43,104,0.20)]">
                <ActiveIcon className="text-[1.6rem]" />
              </div>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="grid content-start gap-4">
                {normalizeCode(activeServiceCode) === 'SILLON' && (
                  <InputField
                    label="Largo del sillón"
                    value={draft.largo}
                    suffix="m"
                    onChange={(value) => updateDraft('largo', value)}
                  />
                )}

                {normalizeCode(activeServiceCode) === 'SILLON_L' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Tramo A"
                      value={draft.tramo_a}
                      suffix="m"
                      onChange={(value) => updateDraft('tramo_a', value)}
                    />
                    <InputField
                      label="Tramo B"
                      value={draft.tramo_b}
                      suffix="m"
                      onChange={(value) => updateDraft('tramo_b', value)}
                    />
                  </div>
                )}

                {normalizeCode(activeServiceCode) === 'COLCHON' && (
                  <InputField
                    label="Ancho del colchón"
                    value={draft.ancho}
                    suffix="m"
                    onChange={(value) => updateDraft('ancho', value)}
                  />
                )}

                {normalizeCode(activeServiceCode) === 'ALFOMBRA' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Largo"
                      value={draft.largo}
                      suffix="m"
                      onChange={(value) => updateDraft('largo', value)}
                    />
                    <InputField
                      label="Ancho"
                      value={draft.ancho}
                      suffix="m"
                      onChange={(value) => updateDraft('ancho', value)}
                    />
                  </div>
                )}

                {normalizeCode(activeServiceCode) === 'ALFOMBRADO' && (
                  <InputField
                    label="Metros cuadrados"
                    value={draft.m2}
                    suffix="m²"
                    onChange={(value) => updateDraft('m2', value)}
                  />
                )}

                {(normalizeCode(activeServiceCode) === 'SILLA' ||
                  normalizeCode(activeServiceCode) === 'VEHICULO' ||
                  normalizeCode(activeServiceCode) === 'INFANTIL') && (
                  <label className="block">
                    <span className="cuerpo text-[0.9rem] font-semibold text-slate-800">
                      Variante
                    </span>

                    <select
                      value={draft.variante_codigo}
                      onChange={(event) =>
                        updateDraft('variante_codigo', event.target.value)
                      }
                      className="cuerpo mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[1rem] font-semibold text-slate-900 outline-none transition focus:border-emerald-500"
                    >
                      {activeServiceVariants.map((variant) => (
                        <option key={variant.id} value={variant.codigo}>
                          {variant.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <InputField
                  label="Cantidad"
                  value={draft.cantidad}
                  suffix="u."
                  onChange={(value) => updateDraft('cantidad', value)}
                />

                {catalog.adicionales.length > 0 && (
                  <div>
                    <p className="cuerpo text-[0.9rem] font-semibold text-slate-800">
                      Adicionales opcionales
                    </p>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {catalog.adicionales.map((adicional) => {
                        const selected = Boolean(
                          draft.adicionales?.[adicional.codigo]
                        );

                        return (
                          <button
                            key={adicional.id}
                            type="button"
                            onClick={() => toggleAdicional(adicional.codigo)}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                              selected
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="cuerpo text-[0.86rem] font-black">
                                {adicional.nombre}
                              </span>
                              <span className="cuerpo shrink-0 text-[0.8rem] font-black">
                                {formatMoney(adicional.precio)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <ServiceVisual code={activeServiceCode} draft={draft} />

                <div className="mx-auto mt-4 flex max-w-[330px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <HiInformationCircle className="shrink-0 text-[1.2rem] text-[#072b68]" />
                  <p className="cuerpo text-[0.84rem] font-semibold text-slate-700">
                    {copy.hint}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              disabled={calculating || loadingCatalog}
              className="cuerpo mt-7 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#072b68] px-6 py-4 text-[1rem] font-black text-white shadow-[0_20px_46px_rgba(7,43,104,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#061f4b] disabled:cursor-wait disabled:opacity-70"
            >
              <HiPlus className="text-[1.25rem]" />
              Agregar al carrito
            </button>

            <button
              type="button"
              onClick={() => {
                if (catalog.servicios.length > 1) {
                  const currentIndex = catalog.servicios.findIndex(
                    (service) =>
                      normalizeCode(service.codigo) ===
                      normalizeCode(activeServiceCode)
                  );
                  const next =
                    catalog.servicios[
                      (currentIndex + 1) % catalog.servicios.length
                    ];
                  selectService(next);
                }
              }}
              className="cuerpo mx-auto mt-4 flex items-center justify-center gap-2 text-[0.9rem] font-black text-emerald-700"
            >
              Quiero agregar otro servicio
              <HiPlusCircle className="text-[1.2rem]" />
            </button>
          </motion.section>

          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] lg:sticky lg:top-5 lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="titulo text-[1.2rem] font-black uppercase tracking-[0.02em] text-[#071946]">
                Resumen de tu servicio
              </h2>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="cuerpo inline-flex items-center gap-1 text-[0.78rem] font-bold text-red-600"
                >
                  Vaciar carrito
                  <HiTrash />
                </button>
              )}
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <HiCalculator className="mx-auto text-[2rem] text-slate-300" />
                  <p className="cuerpo mt-2 text-[0.9rem] font-semibold text-slate-500">
                    Agregá un servicio para calcular el total.
                  </p>
                </div>
              ) : (
                cart.map((item, index) => {
                  const Icon = getServiceIcon(item.codigo);
                  const calculatedItem = mainQuoteItems[index];

                  const service = catalog.servicios.find((servicio) => {
                    return (
                      normalizeCode(servicio.codigo) ===
                      normalizeCode(item.codigo)
                    );
                  });

                  const itemName =
                    calculatedItem?.nombre_item ||
                    service?.nombre ||
                    formatVariantLabel(item.codigo);

                  const itemDetail = getCartItemDetailLabel(
                    item,
                    calculatedItem
                  );

                  const quantityLabel =
                    Number(item.cantidad || 1) > 1 ? ` x${item.cantidad}` : '';

                  return (
                    <div
                      key={item.uiId}
                      className="flex items-start gap-3 py-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#072b68]">
                        <Icon className="text-[1.25rem]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="cuerpo truncate text-[0.92rem] font-black text-slate-800">
                          {itemName}
                          {quantityLabel}
                        </p>

                        {itemDetail && (
                          <p className="cuerpo mt-0.5 text-[0.78rem] font-semibold text-slate-500">
                            {itemDetail}
                          </p>
                        )}

                        <p className="cuerpo mt-1 text-[0.82rem] font-black text-[#072b68]">
                          {calculatedItem
                            ? `${formatMoney(calculatedItem.subtotal)} · ${formatDuration(
                                calculatedItem.duracion_min
                              )}`
                            : calculating
                              ? 'Calculando...'
                              : 'Sin calcular'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.uiId)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <HiXMark />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {calculating && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
              </div>
            )}

            {quote && (
              <div className="mt-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between gap-3">
                    <span className="cuerpo font-bold text-slate-700">
                      Subtotal
                    </span>
                    <span className="cuerpo font-black text-[#071946]">
                      {formatMoney(quote.subtotal)}
                    </span>
                  </div>

                  {quote.promociones?.map((promo) => (
                    <div
                      key={promo.codigo}
                      className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="cuerpo text-[0.86rem] font-black text-emerald-900">
                            {promo.nombre}
                          </p>
                          <p className="cuerpo mt-1 text-[0.76rem] font-semibold leading-5 text-emerald-700">
                            {promo.descripcion}
                          </p>
                        </div>

                        <span className="cuerpo shrink-0 text-[0.88rem] font-black text-emerald-700">
                          -{formatMoney(promo.monto_descuento)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Benjamin Orellana - 29/04/2026 - Muestra ajuste por mínimo operativo cuando el total queda debajo de $70.000. */}
                  {Number(quote.ajuste_minimo_operativo || 0) > 0 && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="cuerpo text-[0.86rem] font-black text-amber-900">
                            Ajuste mínimo operativo
                          </p>

                          <p className="cuerpo mt-1 text-[0.76rem] font-semibold leading-5 text-amber-700">
                            El servicio cuenta con un mínimo operativo de{' '}
                            {formatMoney(quote.minimo_operativo || 70000)}.
                          </p>
                        </div>

                        <span className="cuerpo shrink-0 text-[0.88rem] font-black text-amber-700">
                          +{formatMoney(quote.ajuste_minimo_operativo)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                  <div className="flex items-center justify-between gap-4 px-5 py-5">
                    <span className="titulo text-xl font-black uppercase text-[#071946]">
                      Total final
                    </span>
                    <span className="titulo text-3xl font-black text-[#072b68]">
                      {formatMoney(quote.total_estimado)}
                    </span>
                  </div>

                  <div className="border-t border-blue-100 bg-blue-100/45 px-5 py-3">
                    <p className="cuerpo flex items-center gap-2 text-[0.85rem] font-semibold text-[#072b68]">
                      <HiClock className="text-[1.1rem]" />
                      Duración estimada:{' '}
                      {formatDuration(quote.duracion_total_min)}
                    </p>
                  </div>
                </div>

                {/* Benjamin Orellana - 28/04/2026 - Muestra sugerencia comercial y CTA para pasar a agenda cuando el carrito ya está calculado. */}
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <HiSparkles className="mt-1 shrink-0 text-[1.35rem] text-emerald-700" />

                    <div>
                      <p className="cuerpo text-[0.95rem] font-black leading-6 text-emerald-900">
                        {Number(quote.ajuste_minimo_operativo || 0) > 0
                          ? 'Podés sumar servicios y aprovechar mejor el mínimo operativo'
                          : 'Podés sumar más servicios para aprovechar la visita'}
                      </p>

                      <p className="cuerpo mt-1 text-[0.78rem] font-semibold leading-5 text-emerald-700">
                        {Number(quote.ajuste_minimo_operativo || 0) > 0
                          ? `Te faltan ${formatMoney(
                              quote.ajuste_minimo_operativo
                            )} para alcanzar el mínimo operativo con más servicios.`
                          : 'Sumar sillas, colchones o alfombras puede optimizar la visita.'}
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {catalog.servicios
                          .filter((service) => {
                            return !cart.some(
                              (item) =>
                                normalizeCode(item.codigo) ===
                                normalizeCode(service.codigo)
                            );
                          })
                          .slice(0, 3)
                          .map((service) => {
                            const Icon = getServiceIcon(service.codigo);

                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => selectService(service)}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-[0.76rem] font-black text-[#071946] shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[2px] hover:border-emerald-500 hover:text-emerald-700"
                              >
                                <Icon className="text-[1rem]" />
                                <span className="truncate">
                                  + {service.nombre}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenTurnoStep}
                  className="cuerpo mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-5 py-4 text-[0.98rem] font-black text-white shadow-[0_20px_46px_rgba(4,120,87,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-emerald-800"
                >
                  <HiCalendarDays className="text-[1.25rem]" />
                  Elegir fecha y horario
                  <HiArrowRight className="text-[1.1rem]" />
                </button>

                <p className="cuerpo mt-3 flex items-center justify-center gap-2 text-[0.78rem] font-semibold text-slate-400">
                  <HiShieldCheck />
                  Tus datos están protegidos.
                </p>

                <AnimatePresence>
                  {showTurnoStep && (
                    <motion.div
                      ref={turnoSectionRef}
                      initial={{ opacity: 0, y: 18, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 12, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="block">
                          <span className="cuerpo text-[0.88rem] font-black text-slate-800">
                            Elegí fecha
                          </span>

                          <input
                            type="date"
                            value={selectedDate}
                            min={getTomorrowISO()}
                            onChange={(event) => {
                              setSelectedDate(event.target.value);
                              setSelectedSlot(null);
                            }}
                            className="cuerpo mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-900 outline-none focus:border-emerald-500"
                          />
                        </label>

                        <div className="mt-4">
                          <p className="cuerpo text-[0.88rem] font-black text-slate-800">
                            Horarios disponibles
                          </p>

                          {loadingSlots ? (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {[1, 2, 3, 4].map((item) => (
                                <div
                                  key={item}
                                  className="h-11 animate-pulse rounded-xl bg-slate-100"
                                />
                              ))}
                            </div>
                          ) : slots.length === 0 ? (
                            <p className="cuerpo mt-3 rounded-2xl bg-slate-50 p-3 text-[0.82rem] font-semibold text-slate-500">
                              No hay horarios disponibles para esta duración.
                            </p>
                          ) : (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {slots.slice(0, 8).map((slot) => {
                                const active =
                                  selectedSlot?.hora_inicio ===
                                  slot.hora_inicio;

                                return (
                                  <button
                                    key={`${slot.fecha}-${slot.hora_inicio}`}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`rounded-xl border px-3 py-3 text-[0.82rem] font-black transition-all duration-300 ${
                                      active
                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'
                                    }`}
                                  >
                                    {String(slot.hora_inicio).slice(0, 5)}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        id="datos-cliente"
                        className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <p className="cuerpo text-[0.88rem] font-black text-slate-800">
                          Datos para confirmar
                        </p>

                        <div className="mt-3 grid gap-3">
                          <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={client.nombre}
                              onChange={(event) =>
                                setClient((current) => ({
                                  ...current,
                                  nombre: event.target.value
                                }))
                              }
                              placeholder="Nombre"
                              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="relative">
                            <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={client.telefono}
                              onChange={(event) =>
                                setClient((current) => ({
                                  ...current,
                                  telefono: event.target.value
                                }))
                              }
                              placeholder="Teléfono"
                              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="relative">
                            <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={client.email}
                              onChange={(event) =>
                                setClient((current) => ({
                                  ...current,
                                  email: event.target.value
                                }))
                              }
                              placeholder="Email"
                              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="relative">
                            <HiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={client.direccion}
                              onChange={(event) =>
                                setClient((current) => ({
                                  ...current,
                                  direccion: event.target.value
                                }))
                              }
                              placeholder="Dirección"
                              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <input
                            value={client.localidad}
                            onChange={(event) =>
                              setClient((current) => ({
                                ...current,
                                localidad: event.target.value
                              }))
                            }
                            placeholder="Localidad"
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-emerald-500"
                          />

                          <textarea
                            value={client.observaciones_cliente}
                            onChange={(event) =>
                              setClient((current) => ({
                                ...current,
                                observaciones_cliente: event.target.value
                              }))
                            }
                            placeholder="Observaciones"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={submitSolicitud}
                        disabled={submitting}
                        className="cuerpo mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#072b68] px-5 py-4 text-[0.98rem] font-black text-white shadow-[0_20px_46px_rgba(7,43,104,0.24)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#061f4b] disabled:cursor-wait disabled:opacity-70"
                      >
                        <HiCalendarDays className="text-[1.25rem]" />
                        {submitting
                          ? 'Enviando solicitud...'
                          : 'Solicitar turno'}
                        <HiArrowRight className="text-[1.1rem]" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.aside>
        </section>

        <section className="mx-auto mt-5 grid max-w-[1520px] gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#072b68]">
                  <Icon className="text-[1.7rem]" />
                </div>

                <div>
                  <h3 className="titulo text-[0.95rem] font-black text-[#071946]">
                    {benefit.title}
                  </h3>
                  <p className="cuerpo mt-1 text-[0.84rem] font-medium leading-6 text-slate-600">
                    {benefit.text}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

export default HogarCotizador;
