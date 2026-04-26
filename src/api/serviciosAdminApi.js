// Benjamin Orellana - 25/04/2026 - Centraliza consumo API del módulo Servicios para dashboard admin.

const API_URL = import.meta.env.VITE_API_URL;

const buildHeaders = (authToken, hasBody = true) => {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

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

const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, authToken, hasBody = true } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: buildHeaders(authToken, hasBody),
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudo completar la operación.'
    );
  }

  return data;
};

const getListFromResponse = (data, possibleKeys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
};

const getEntityFromResponse = (data, possibleKeys = []) => {
  for (const key of possibleKeys) {
    if (data?.[key]) return data[key];
  }

  return data?.data || data;
};

export const serviciosAdminApi = {
  async listarServicios(authToken) {
    const data = await request('/servicios', { authToken });
    return getListFromResponse(data, ['servicios']);
  },

  async obtenerServicio(id, authToken) {
    const data = await request(`/servicios/${id}`, { authToken });
    return getEntityFromResponse(data, ['servicio']);
  },

  async crearServicio(payload, authToken) {
    const data = await request('/servicios', {
      method: 'POST',
      body: payload,
      authToken
    });

    return getEntityFromResponse(data, ['servicio']);
  },

  async actualizarServicio(id, payload, authToken) {
    const data = await request(`/servicios/${id}`, {
      method: 'PUT',
      body: payload,
      authToken
    });

    return getEntityFromResponse(data, ['servicio']);
  },

  async eliminarServicio(id, authToken) {
    return request(`/servicios/${id}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  },

  async listarTiposClientes(authToken) {
    const data = await request('/servicios-tipos-clientes', { authToken });
    return getListFromResponse(data, [
      'tipos',
      'tipos_clientes',
      'tiposClientes'
    ]);
  },

  async vincularTipoCliente(servicioId, tipoClienteId, authToken) {
    return request(`/servicios/${servicioId}/tipos-clientes`, {
      method: 'POST',
      body: { tipo_cliente_id: tipoClienteId },
      authToken
    });
  },

  async desvincularTipoCliente(servicioId, tipoClienteId, authToken) {
    return request(`/servicios/${servicioId}/tipos-clientes/${tipoClienteId}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  },

  async crearItem(servicioId, payload, authToken) {
    return request(`/servicios/${servicioId}/items`, {
      method: 'POST',
      body: payload,
      authToken
    });
  },

  async actualizarItem(itemId, payload, authToken) {
    return request(`/servicios-items/${itemId}`, {
      method: 'PUT',
      body: payload,
      authToken
    });
  },

  async eliminarItem(itemId, authToken) {
    return request(`/servicios-items/${itemId}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  },

  async crearFaq(servicioId, payload, authToken) {
    return request(`/servicios/${servicioId}/faq`, {
      method: 'POST',
      body: payload,
      authToken
    });
  },

  async actualizarFaq(faqId, payload, authToken) {
    return request(`/servicios-faq/${faqId}`, {
      method: 'PUT',
      body: payload,
      authToken
    });
  },

  async eliminarFaq(faqId, authToken) {
    return request(`/servicios-faq/${faqId}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  },

  async crearMedia(servicioId, payload, authToken) {
    return request(`/servicios/${servicioId}/media`, {
      method: 'POST',
      body: payload,
      authToken
    });
  },

  async actualizarMedia(mediaId, payload, authToken) {
    return request(`/servicios-media/${mediaId}`, {
      method: 'PUT',
      body: payload,
      authToken
    });
  },

  async eliminarMedia(mediaId, authToken) {
    return request(`/servicios-media/${mediaId}`, {
      method: 'DELETE',
      authToken,
      hasBody: false
    });
  }
};
