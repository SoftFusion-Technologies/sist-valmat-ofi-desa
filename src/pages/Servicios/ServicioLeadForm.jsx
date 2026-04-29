// Benjamin Orellana - 29/04/2026 - Formulario público reutilizable para solicitudes informativas de Empresas y Final de obra VALMAT.

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  HiArrowRight,
  HiBriefcase,
  HiBuildingOffice2,
  HiCalendarDays,
  HiCheckBadge,
  HiClipboardDocumentList,
  HiEnvelope,
  HiHomeModern,
  HiInformationCircle,
  HiMapPin,
  HiPhone,
  HiSparkles,
  HiUser
} from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  }
};

const normalizeCode = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_');
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

const getTiposFromResponse = (data) => {
  if (Array.isArray(data?.tiposClientes)) return data.tiposClientes;
  if (Array.isArray(data?.tipos_clientes)) return data.tipos_clientes;
  if (Array.isArray(data?.tipos)) return data.tipos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
};

const getServiceLeadConfig = (variant = 'EMPRESA') => {
  const normalizedVariant = normalizeCode(variant);

  if (normalizedVariant === 'OBRA' || normalizedVariant === 'FINAL_DE_OBRA') {
    return {
      tipoCodigo: 'OBRA',
      origen: 'WEB_FINAL_OBRA_FORM',
      badge: 'Visita técnica',
      title: 'Solicitá una visita técnica',
      subtitle:
        'Contanos los datos de la obra para evaluar alcance, tiempos y condiciones del servicio.',
      icon: HiHomeModern,
      submitLabel: 'Solicitar visita técnica',
      successTitle: 'Solicitud enviada',
      successText:
        'VALMAT recibió tu solicitud de final de obra. Te contactaremos para coordinar la visita técnica.',
      interestOptions: [
        'Limpieza final de obra',
        'Limpieza por refacción',
        'Entrega de unidad',
        'Limpieza técnica de superficies',
        'Otro'
      ],
      projectStatusOptions: [
        'Obra terminada',
        'Obra en terminaciones',
        'Refacción terminada',
        'Entrega próxima',
        'A definir'
      ]
    };
  }

  return {
    tipoCodigo: 'EMPRESA',
    origen: 'WEB_EMPRESAS_FORM',
    badge: 'Empresas',
    title: 'Solicitá contacto comercial',
    subtitle:
      'Completá los datos de tu empresa para que VALMAT pueda evaluar el servicio y contactarte.',
    icon: HiBuildingOffice2,
    submitLabel: 'Enviar consulta',
    successTitle: 'Consulta enviada',
    successText:
      'VALMAT recibió tu consulta empresarial. Te contactaremos para avanzar con la propuesta.',
    interestOptions: [
      'Alfombrados',
      'Tapizados',
      'Mantenimiento',
      'Final de obra',
      'Limpieza integral',
      'Otro'
    ],
    projectStatusOptions: []
  };
};

function FieldWrapper({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="cuerpo text-[0.84rem] font-black text-slate-800">
        {label}
      </span>

      <div className="relative mt-2">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[1.05rem] text-slate-400" />
        )}

        {children}
      </div>
    </label>
  );
}

function ServicioLeadForm({ variant = 'EMPRESA', service = null }) {
  const config = useMemo(() => getServiceLeadConfig(variant), [variant]);
  const ConfigIcon = config.icon;

  const [tiposCliente, setTiposCliente] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    empresa: '',
    direccion: '',
    localidad: '',
    provincia: 'Tucumán',
    servicio_interes: config.interestOptions[0] || '',
    tipo_proyecto: '',
    metros_aprox: '',
    estado_obra: config.projectStatusOptions[0] || '',
    fecha_estimada: '',
    preferencia_contacto: 'WhatsApp',
    observaciones: ''
  });

  const tipoCliente = useMemo(() => {
    return tiposCliente.find((tipo) => {
      return normalizeCode(tipo.codigo) === normalizeCode(config.tipoCodigo);
    });
  }, [tiposCliente, config.tipoCodigo]);

  const isObra = normalizeCode(config.tipoCodigo) === 'OBRA';

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const loadTiposCliente = async () => {
    try {
      setLoadingTipos(true);

      const response = await fetch(
        `${API_URL}/servicios-tipos-clientes?activo=true`
      );
      const data = await safeJson(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar los tipos de cliente.'
        );
      }

      setTiposCliente(getTiposFromResponse(data));
    } catch (error) {
      setTiposCliente([]);

      Swal.fire({
        icon: 'error',
        title: 'Configuración incompleta',
        text:
          error.message ||
          'No se pudieron cargar los tipos de cliente para crear la solicitud.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setLoadingTipos(false);
    }
  };

  useEffect(() => {
    loadTiposCliente();
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      servicio_interes: config.interestOptions[0] || '',
      estado_obra: config.projectStatusOptions[0] || ''
    }));
  }, [config]);

  const validateForm = () => {
    if (!tipoCliente?.id) {
      return 'No se encontró el tipo de cliente correspondiente para esta solicitud.';
    }

    if (!form.nombre.trim()) {
      return 'El nombre es obligatorio.';
    }

    if (!form.telefono.trim()) {
      return 'El teléfono es obligatorio.';
    }

    if (!form.localidad.trim()) {
      return 'La localidad es obligatoria.';
    }

    if (isObra && !form.direccion.trim()) {
      return 'La dirección de obra es obligatoria.';
    }

    if (!isObra && !form.empresa.trim()) {
      return 'El nombre de la empresa o comercio es obligatorio.';
    }

    return '';
  };

  const buildObservaciones = () => {
    const lines = [];

    if (!isObra) {
      lines.push(`Empresa / comercio: ${form.empresa || '-'}`);
      lines.push(`Servicio de interés: ${form.servicio_interes || '-'}`);
      lines.push(
        `Preferencia de contacto: ${form.preferencia_contacto || '-'}`
      );
    }

    if (isObra) {
      lines.push(`Tipo de proyecto: ${form.tipo_proyecto || '-'}`);
      lines.push(`Metros aproximados: ${form.metros_aprox || '-'}`);
      lines.push(`Estado de obra: ${form.estado_obra || '-'}`);
      lines.push(`Fecha estimada: ${form.fecha_estimada || '-'}`);
    }

    if (form.observaciones) {
      lines.push(`Observaciones: ${form.observaciones}`);
    }

    return lines.join('\n');
  };

  const submitLead = async () => {
    const error = validateForm();

    if (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: error,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tipo_cliente_id: tipoCliente.id,
        servicio_principal_id: service?.id || null,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
        localidad: form.localidad,
        provincia: form.provincia,
        estado: 'NUEVA',
        origen: config.origen,
        requiere_visita_tecnica: 1,
        observaciones_cliente: buildObservaciones(),
        metadata: {
          flujo: isObra ? 'FINAL_OBRA_FORM' : 'EMPRESAS_FORM',
          servicio_slug: service?.slug || null,
          servicio_titulo: service?.title || service?.titulo || null,
          empresa: form.empresa,
          servicio_interes: form.servicio_interes,
          tipo_proyecto: form.tipo_proyecto,
          metros_aprox: form.metros_aprox,
          estado_obra: form.estado_obra,
          fecha_estimada: form.fecha_estimada,
          preferencia_contacto: form.preferencia_contacto
        },
        comentario_estado: isObra
          ? 'Solicitud creada desde formulario público de Final de obra.'
          : 'Solicitud creada desde formulario público de Empresas.'
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
          data?.message || data?.error || 'No se pudo crear la solicitud.'
        );
      }

      await Swal.fire({
        icon: 'success',
        title: config.successTitle,
        text: config.successText,
        confirmButtonColor: '#0284c7'
      });

      setForm({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        empresa: '',
        direccion: '',
        localidad: '',
        provincia: 'Tucumán',
        servicio_interes: config.interestOptions[0] || '',
        tipo_proyecto: '',
        metros_aprox: '',
        estado_obra: config.projectStatusOptions[0] || '',
        fecha_estimada: '',
        preferencia_contacto: 'WhatsApp',
        observaciones: ''
      });
    } catch (submitError) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: submitError.message || 'Intentá nuevamente.',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      id="contacto-servicio"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(25,211,223,0.18)_0%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(90,151,208,0.12)_0%,transparent_70%)] blur-2xl" />

      <div className="relative grid gap-7 lg:grid-cols-[0.9fr_1.3fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
            <ConfigIcon className="text-[1rem] text-[var(--color-primary)]" />
            <span className="cuerpo text-[0.72rem] font-black uppercase tracking-[0.18em] text-slate-500">
              {config.badge}
            </span>
          </div>

          <h2 className="titulo mt-5 text-3xl font-black uppercase leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-4xl">
            {config.title}
          </h2>

          <p className="cuerpo mt-4 max-w-xl text-[0.96rem] font-medium leading-7 text-slate-600">
            {config.subtitle}
          </p>

          <div className="mt-6 grid gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/82 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
              <HiCheckBadge className="mt-1 shrink-0 text-[1.25rem] text-emerald-600" />
              <p className="cuerpo text-[0.88rem] font-semibold leading-6 text-slate-700">
                La solicitud ingresa directamente a la bandeja interna de VALMAT
                para revisión comercial.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/82 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
              <HiInformationCircle className="mt-1 shrink-0 text-[1.25rem] text-sky-600" />
              <p className="cuerpo text-[0.88rem] font-semibold leading-6 text-slate-700">
                Este formulario no calcula precio automático. El equipo revisa
                el alcance y responde con una propuesta o visita técnica.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label="Nombre" icon={HiUser}>
              <input
                value={form.nombre}
                onChange={(event) => updateForm('nombre', event.target.value)}
                placeholder="Nombre"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            <FieldWrapper label="Apellido" icon={HiUser}>
              <input
                value={form.apellido}
                onChange={(event) => updateForm('apellido', event.target.value)}
                placeholder="Apellido"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            <FieldWrapper label="Teléfono" icon={HiPhone}>
              <input
                value={form.telefono}
                onChange={(event) => updateForm('telefono', event.target.value)}
                placeholder="Teléfono o WhatsApp"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            <FieldWrapper label="Email" icon={HiEnvelope}>
              <input
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="Email"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            {!isObra && (
              <FieldWrapper label="Empresa / comercio" icon={HiBriefcase}>
                <input
                  value={form.empresa}
                  onChange={(event) =>
                    updateForm('empresa', event.target.value)
                  }
                  placeholder="Nombre de empresa"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                />
              </FieldWrapper>
            )}

            <FieldWrapper
              label={isObra ? 'Dirección de obra' : 'Dirección'}
              icon={HiMapPin}
            >
              <input
                value={form.direccion}
                onChange={(event) =>
                  updateForm('direccion', event.target.value)
                }
                placeholder={
                  isObra ? 'Ubicación de la obra' : 'Dirección del espacio'
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            <FieldWrapper label="Localidad" icon={HiMapPin}>
              <input
                value={form.localidad}
                onChange={(event) =>
                  updateForm('localidad', event.target.value)
                }
                placeholder="Localidad"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            <FieldWrapper label="Provincia" icon={HiMapPin}>
              <input
                value={form.provincia}
                onChange={(event) =>
                  updateForm('provincia', event.target.value)
                }
                placeholder="Provincia"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
              />
            </FieldWrapper>

            {!isObra && (
              <FieldWrapper
                label="Servicio de interés"
                icon={HiClipboardDocumentList}
              >
                <select
                  value={form.servicio_interes}
                  onChange={(event) =>
                    updateForm('servicio_interes', event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                >
                  {config.interestOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FieldWrapper>
            )}

            {!isObra && (
              <FieldWrapper label="Preferencia de contacto" icon={HiPhone}>
                <select
                  value={form.preferencia_contacto}
                  onChange={(event) =>
                    updateForm('preferencia_contacto', event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Llamada">Llamada</option>
                  <option value="Email">Email</option>
                </select>
              </FieldWrapper>
            )}

            {isObra && (
              <FieldWrapper
                label="Tipo de proyecto"
                icon={HiClipboardDocumentList}
              >
                <input
                  value={form.tipo_proyecto}
                  onChange={(event) =>
                    updateForm('tipo_proyecto', event.target.value)
                  }
                  placeholder="Casa, local, departamento, oficina..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                />
              </FieldWrapper>
            )}

            {isObra && (
              <FieldWrapper label="Metros aproximados" icon={HiSparkles}>
                <input
                  type="number"
                  min="0"
                  value={form.metros_aprox}
                  onChange={(event) =>
                    updateForm('metros_aprox', event.target.value)
                  }
                  placeholder="Ej: 120"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                />
              </FieldWrapper>
            )}

            {isObra && (
              <FieldWrapper label="Estado de obra" icon={HiCheckBadge}>
                <select
                  value={form.estado_obra}
                  onChange={(event) =>
                    updateForm('estado_obra', event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                >
                  {config.projectStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FieldWrapper>
            )}

            {isObra && (
              <FieldWrapper label="Fecha estimada" icon={HiCalendarDays}>
                <input
                  type="date"
                  value={form.fecha_estimada}
                  onChange={(event) =>
                    updateForm('fecha_estimada', event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
                />
              </FieldWrapper>
            )}
          </div>

          <label className="mt-4 block">
            <span className="cuerpo text-[0.84rem] font-black text-slate-800">
              Observaciones
            </span>

            <textarea
              rows={4}
              value={form.observaciones}
              onChange={(event) =>
                updateForm('observaciones', event.target.value)
              }
              placeholder={
                isObra
                  ? 'Contanos detalles de la obra, estado general, plazos o necesidades puntuales.'
                  : 'Contanos el tipo de espacio, frecuencia, superficie o necesidad del servicio.'
              }
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition focus:border-[var(--color-primary)]"
            />
          </label>

          <button
            type="button"
            onClick={submitLead}
            disabled={submitting || loadingTipos}
            className="cuerpo mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-5 py-4 text-[0.95rem] font-black text-white shadow-[0_18px_40px_rgba(25,211,223,0.22)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[var(--color-secondary)] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : config.submitLabel}
            <HiArrowRight className="text-[1.1rem]" />
          </button>

          <p className="cuerpo mt-3 flex items-center justify-center gap-2 text-[0.76rem] font-semibold text-slate-400">
            <HiCheckBadge />
            Tu solicitud se registrará en la bandeja interna de VALMAT.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export default ServicioLeadForm;
