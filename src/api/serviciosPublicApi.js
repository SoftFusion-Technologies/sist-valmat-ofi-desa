// Benjamin Orellana - 25/04/2026 - Centraliza el consumo público dinámico del módulo Servicios.

const API_URL = import.meta.env.VITE_API_URL

const safeJson = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudo obtener la información solicitada.'
    );
  }

  return data;
};

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.servicios)) return data.servicios;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const getEntityFromResponse = (data) => {
  return data?.servicio || data?.data || data;
};

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getFirstMediaByBlock = (servicio, blocks = []) => {
  const media = normalizeArray(servicio?.media);

  return media.find((item) =>
    blocks.includes(String(item?.bloque || '').toUpperCase())
  );
};

const normalizeServicio = (servicio = {}) => {
  const principalMedia = getFirstMediaByBlock(servicio, [
    'PRINCIPAL',
    'SHOWCASE',
    'POSTER'
  ]);

  const mediaSrc =
    servicio.mediaSrc ||
    servicio.media_src ||
    principalMedia?.archivo_url ||
    principalMedia?.url ||
    '';

  const mediaPoster =
    servicio.mediaPoster ||
    servicio.media_poster ||
    principalMedia?.poster_url ||
    '';

  return {
    ...servicio,
    id: servicio.id,
    slug: servicio.slug || '',
    eyebrow: servicio.eyebrow || '',
    title: servicio.title || servicio.titulo || '',
    shortTitle:
      servicio.shortTitle || servicio.short_title || servicio.title || '',
    subtitle: servicio.subtitle || servicio.subtitulo || '',
    badge: servicio.badge || '',
    intent: servicio.intent || '',
    description: servicio.description || servicio.descripcion || '',
    detailTitle: servicio.detailTitle || servicio.detail_title || '',
    detailIntro: servicio.detailIntro || servicio.detail_intro || '',
    salesText: servicio.salesText || servicio.sales_text || '',
    includesTitle:
      servicio.includesTitle ||
      servicio.includes_title ||
      '¿Qué incluye este servicio?',
    ctaLabel:
      servicio.ctaLabel || servicio.cta_label || 'Solicitar visita técnica',
    secondaryCtaLabel:
      servicio.secondaryCtaLabel ||
      servicio.secondary_cta_label ||
      'Ver servicio completo',
    iconKey: servicio.iconKey || servicio.icon_key || 'HiSparkles',
    destacado:
      servicio.destacado === true ||
      servicio.destacado === 1 ||
      servicio.destacado === '1',
    orden_visual: Number(servicio.orden_visual || 1),
    estado: servicio.estado || 'ACTIVO',
    mediaType: servicio.mediaType || servicio.media_type || 'video',
    mediaSrc,
    mediaPoster,
    features: normalizeArray(servicio.features),
    benefits: normalizeArray(servicio.benefits),
    painPoints: normalizeArray(servicio.painPoints || servicio.pain_points),
    process: normalizeArray(servicio.process),
    useCases: normalizeArray(servicio.useCases || servicio.use_cases),
    trustItems: normalizeArray(servicio.trustItems || servicio.trust_items),
    faq: normalizeArray(servicio.faq),
    tipos_clientes: normalizeArray(servicio.tipos_clientes),
    media: normalizeArray(servicio.media)
  };
};

export const serviciosPublicApi = {
  async listarServiciosPublicos(tipoClienteCodigo = '') {
    const query = tipoClienteCodigo
      ? `?tipo_cliente_codigo=${encodeURIComponent(tipoClienteCodigo)}`
      : '';

    const data = await request(`/servicios-publicos${query}`);

    return getListFromResponse(data)
      .map(normalizeServicio)
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  },

  async obtenerServicioPublicoPorSlug(slug) {
    const data = await request(
      `/servicios-publicos/${encodeURIComponent(slug)}`
    );
    return normalizeServicio(getEntityFromResponse(data));
  }
};
