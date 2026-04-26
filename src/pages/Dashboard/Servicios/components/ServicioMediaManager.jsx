// Benjamin Orellana - 25/04/2026 - Gestor premium de media para Servicios con upload real multipart/form-data.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const mediaBloqueOptions = [
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'SHOWCASE', label: 'Showcase' },
  { value: 'REEL', label: 'Reel' },
  { value: 'POSTER', label: 'Poster' },
  { value: 'GALERIA', label: 'Galería' }
];

const mediaTipoOptions = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'IMAGEN', label: 'Imagen' }
];

const cn = (...classes) => classes.filter(Boolean).join(' ');

const getPublicUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
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

const requestFormData = async (endpoint, { method, formData, authToken }) => {
  const headers = {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: formData
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

const requestDelete = async (endpoint, authToken) => {
  const headers = {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(response);

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.msg ||
        data?.error ||
        'No se pudo eliminar la media.'
    );
  }

  return data;
};

const getServicioMedia = (servicio) => {
  if (Array.isArray(servicio?.media)) return servicio.media;
  if (Array.isArray(servicio?.medias)) return servicio.medias;
  return [];
};

const normalizeMediaItem = (item = {}) => ({
  id: item.id,
  tipo_media: item.tipo_media || item.tipo || 'VIDEO',
  ubicacion: item.ubicacion || 'LOCAL',
  bloque: item.bloque || 'SHOWCASE',
  titulo: item.titulo || item.title || '',
  descripcion: item.descripcion || item.description || '',
  archivo_url: item.archivo_url || item.url || '',
  poster_url: item.poster_url || '',
  post_url: item.post_url || '',
  alt_text: item.alt_text || '',
  es_principal:
    item.es_principal === true ||
    item.es_principal === 1 ||
    item.es_principal === '1' ||
    item.es_principal === 'true',
  orden_visual: Number(item.orden_visual || 1),
  activo:
    item.activo === undefined ||
    item.activo === null ||
    item.activo === true ||
    item.activo === 1 ||
    item.activo === '1' ||
    item.activo === 'true'
});

const buildMediaFormData = ({ form, archivoFile, posterFile }) => {
  const formData = new FormData();

  formData.append('tipo_media', form.tipo_media);
  formData.append('ubicacion', form.ubicacion);
  formData.append('bloque', form.bloque);
  formData.append('titulo', form.titulo || '');
  formData.append('descripcion', form.descripcion || '');
  formData.append('post_url', form.post_url || '');
  formData.append('alt_text', form.alt_text || '');
  formData.append('es_principal', form.es_principal ? 'true' : 'false');
  formData.append('orden_visual', String(Number(form.orden_visual || 1)));
  formData.append('activo', form.activo ? 'true' : 'false');

  if (archivoFile) {
    formData.append('archivo', archivoFile);
  }

  if (posterFile) {
    formData.append('poster', posterFile);
  }

  return formData;
};

function useObjectUrl(file) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}

export default function ServicioMediaManager({
  servicio,
  authToken,
  reloadServicio,
  showToast = () => {}
}) {
  const [modalState, setModalState] = useState({
    open: false,
    item: null
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    item: null
  });

  const [deletingId, setDeletingId] = useState(null);

  const media = useMemo(() => {
    return getServicioMedia(servicio)
      .map(normalizeMediaItem)
      .sort(
        (a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0)
      );
  }, [servicio]);

  const notify = (type, message) => {
    showToast(type, message);
  };

  const openCreate = () => {
    setModalState({
      open: true,
      item: null
    });
  };

  const openEdit = (item) => {
    setModalState({
      open: true,
      item
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      item: null
    });
  };

  const askDelete = (item) => {
    setConfirmState({
      open: true,
      item
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      item: null
    });
  };

  const handleDelete = async () => {
    if (!confirmState.item?.id) return;

    try {
      setDeletingId(confirmState.item.id);

      await requestDelete(
        `/servicios-media/${confirmState.item.id}`,
        authToken
      );

      notify('success', 'Media eliminada correctamente.');

      if (typeof reloadServicio === 'function') {
        await reloadServicio();
      }

      closeConfirm();
    } catch (err) {
      notify('error', err.message || 'No se pudo eliminar la media.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-5 rounded-[1.5rem] border border-cyan-100 bg-cyan-50 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-slate-950">
              Media del servicio
            </h3>

            <p className="mt-1 text-sm leading-6 text-cyan-800/75">
              Subí videos, imágenes y posters reales al servidor. Ya no hace
              falta escribir rutas manualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4" />
            Agregar media
          </button>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-cyan-600 shadow-sm">
            <Video className="h-7 w-7" />
          </div>

          <h4 className="mt-4 text-base font-black text-slate-950">
            No hay media cargada
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Agregá un video principal, showcase, reel o imagen para que el
            servicio se vea dinámico en la web pública.
          </p>

          <button
            type="button"
            onClick={openCreate}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            <Upload className="h-4 w-4" />
            Subir primera media
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => askDelete(item)}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalState.open && (
          <MediaUploadModal
            key={modalState.item?.id || 'create-media'}
            servicioId={servicio?.id}
            item={modalState.item}
            authToken={authToken}
            onClose={closeModal}
            reloadServicio={reloadServicio}
            showToast={notify}
          />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        open={confirmState.open}
        item={confirmState.item}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        loading={Boolean(deletingId)}
      />
    </section>
  );
}

function MediaCard({ item, onEdit, onDelete, deleting }) {
  const archivoUrl = getPublicUrl(item.archivo_url);
  const posterUrl = getPublicUrl(item.poster_url);
  const isVideo = item.tipo_media === 'VIDEO';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {archivoUrl ? (
          isVideo ? (
            <video
              src={archivoUrl}
              poster={posterUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              controls
              preload="metadata"
            />
          ) : (
            <img
              src={archivoUrl}
              alt={item.alt_text || item.titulo || 'Media VALMAT'}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#020617,#0f172a)]">
            {isVideo ? (
              <Video className="h-9 w-9 text-white/35" />
            ) : (
              <ImageIcon className="h-9 w-9 text-white/35" />
            )}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-950">
            {item.bloque}
          </span>

          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-800 backdrop-blur">
            {item.tipo_media}
          </span>

          {item.es_principal && (
            <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-amber-950">
              Principal
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="line-clamp-1 text-sm font-black text-slate-950">
              {item.titulo || 'Media sin título'}
            </h4>

            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-400">
              {item.archivo_url || 'Sin archivo'}
            </p>
          </div>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]',
              item.activo
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            {item.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {item.descripcion && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {item.descripcion}
          </p>
        )}

        {item.poster_url && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Poster cargado
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
              {item.poster_url}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function MediaUploadModal({
  servicioId,
  item,
  authToken,
  onClose,
  reloadServicio,
  showToast
}) {
  const isEdit = Boolean(item?.id);
  const normalizedItem = normalizeMediaItem(item || {});

  const archivoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const [form, setForm] = useState({
    tipo_media: normalizedItem.tipo_media || 'VIDEO',
    ubicacion: normalizedItem.ubicacion || 'LOCAL',
    bloque: normalizedItem.bloque || 'SHOWCASE',
    titulo: normalizedItem.titulo || '',
    descripcion: normalizedItem.descripcion || '',
    post_url: normalizedItem.post_url || '',
    alt_text: normalizedItem.alt_text || '',
    es_principal: normalizedItem.es_principal || false,
    orden_visual: normalizedItem.orden_visual || 1,
    activo: normalizedItem.activo ?? true
  });

  const [archivoFile, setArchivoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const archivoPreviewUrl = useObjectUrl(archivoFile);
  const posterPreviewUrl = useObjectUrl(posterFile);

  const currentArchivoUrl = getPublicUrl(normalizedItem.archivo_url);
  const currentPosterUrl = getPublicUrl(normalizedItem.poster_url);

  const mainPreviewUrl = archivoPreviewUrl || currentArchivoUrl;
  const posterPreview = posterPreviewUrl || currentPosterUrl;

  const isVideo = form.tipo_media === 'VIDEO';

  const archivoAccept = isVideo
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp';

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleArchivoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setArchivoFile(file);
  };

  const handlePosterChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPosterFile(file);
  };

  const clearArchivoFile = () => {
    setArchivoFile(null);

    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const clearPosterFile = () => {
    setPosterFile(null);

    if (posterInputRef.current) {
      posterInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!servicioId && !isEdit) {
      showToast('error', 'No se encontró el ID del servicio.');
      return;
    }

    if (!form.titulo.trim()) {
      showToast('error', 'El título es obligatorio.');
      return;
    }

    if (form.ubicacion === 'LOCAL' && !isEdit && !archivoFile) {
      showToast('error', 'Seleccioná un archivo principal para subir.');
      return;
    }

    if (
      form.ubicacion === 'LOCAL' &&
      isEdit &&
      !archivoFile &&
      !normalizedItem.archivo_url
    ) {
      showToast('error', 'Seleccioná un archivo principal para subir.');
      return;
    }

    try {
      setSaving(true);

      const formData = buildMediaFormData({
        form,
        archivoFile,
        posterFile
      });

      const endpoint = isEdit
        ? `/servicios-media/${normalizedItem.id}`
        : `/servicios/${servicioId}/media`;

      await requestFormData(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        formData,
        authToken
      });

      showToast(
        'success',
        isEdit
          ? 'Media actualizada correctamente.'
          : 'Media creada correctamente.'
      );

      if (typeof reloadServicio === 'function') {
        await reloadServicio();
      }

      onClose();
    } catch (err) {
      showToast('error', err.message || 'No se pudo guardar la media.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-md sm:items-center sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.24 }}
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_110px_rgba(2,6,23,0.35)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              {isEdit ? 'Editar media' : 'Nueva media'}
            </p>

            <h3 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">
              {isEdit
                ? normalizedItem.titulo || 'Actualizar archivo'
                : 'Subir archivo al servidor'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                  <h4 className="text-base font-black text-slate-950">
                    Configuración
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Definí dónde se usa la media y qué tipo de archivo vas a
                    subir.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectInput
                    label="Bloque"
                    value={form.bloque}
                    onChange={(value) => updateForm('bloque', value)}
                    options={mediaBloqueOptions}
                  />

                  <SelectInput
                    label="Tipo"
                    value={form.tipo_media}
                    onChange={(value) => {
                      updateForm('tipo_media', value);
                      clearArchivoFile();
                    }}
                    options={mediaTipoOptions}
                  />

                  <Input
                    label="Título"
                    value={form.titulo}
                    onChange={(value) => updateForm('titulo', value)}
                    placeholder="Video principal hogares"
                  />

                  <Input
                    label="Orden visual"
                    type="number"
                    value={form.orden_visual}
                    onChange={(value) => updateForm('orden_visual', value)}
                  />

                  <Input
                    label="Post URL"
                    value={form.post_url}
                    onChange={(value) => updateForm('post_url', value)}
                    placeholder="https://www.instagram.com/p/..."
                  />

                  <Input
                    label="Alt text"
                    value={form.alt_text}
                    onChange={(value) => updateForm('alt_text', value)}
                    placeholder="Video servicio VALMAT"
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Descripción"
                    value={form.descripcion}
                    onChange={(value) => updateForm('descripcion', value)}
                    placeholder="Descripción corta para uso interno o público."
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Marcar como principal"
                    description="Útil para hero o media prioritaria."
                    checked={form.es_principal}
                    onChange={(value) => updateForm('es_principal', value)}
                  />

                  <Toggle
                    label="Activo"
                    description="Si está inactivo, no debería mostrarse públicamente."
                    checked={form.activo}
                    onChange={(value) => updateForm('activo', value)}
                  />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                  <h4 className="text-base font-black text-slate-950">
                    Archivo principal
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Seleccioná un archivo desde tu computadora. En edición, si
                    no elegís uno nuevo, se mantiene el actual.
                  </p>
                </div>

                <input
                  ref={archivoInputRef}
                  type="file"
                  accept={archivoAccept}
                  onChange={handleArchivoChange}
                  className="hidden"
                />

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-black text-slate-800">
                      {archivoFile
                        ? archivoFile.name
                        : normalizedItem.archivo_url
                          ? 'Archivo actual cargado'
                          : 'Sin archivo seleccionado'}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {isVideo
                        ? 'Formatos sugeridos: MP4, WEBM o MOV.'
                        : 'Formatos sugeridos: JPG, PNG o WEBP.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => archivoInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
                    >
                      <Upload className="h-4 w-4" />
                      {archivoFile || normalizedItem.archivo_url
                        ? 'Reemplazar'
                        : 'Seleccionar'}
                    </button>

                    {archivoFile && (
                      <button
                        type="button"
                        onClick={clearArchivoFile}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                  <h4 className="text-base font-black text-slate-950">
                    Poster opcional
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Recomendado para videos. Se usa como portada antes de cargar
                    o reproducir.
                  </p>
                </div>

                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterChange}
                  className="hidden"
                />

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-black text-slate-800">
                      {posterFile
                        ? posterFile.name
                        : normalizedItem.poster_url
                          ? 'Poster actual cargado'
                          : 'Sin poster seleccionado'}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Formatos sugeridos: JPG, PNG o WEBP.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {posterFile || normalizedItem.poster_url
                        ? 'Reemplazar'
                        : 'Seleccionar'}
                    </button>

                    {posterFile && (
                      <button
                        type="button"
                        onClick={clearPosterFile}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white shadow-sm">
                <div className="relative aspect-video bg-slate-900">
                  {mainPreviewUrl ? (
                    isVideo ? (
                      <video
                        src={mainPreviewUrl}
                        poster={posterPreview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={mainPreviewUrl}
                        alt={form.alt_text || form.titulo || 'Preview media'}
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#020617,#0f172a)]">
                      {isVideo ? (
                        <Video className="h-10 w-10 text-white/35" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-white/35" />
                      )}
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                    Preview
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                    {form.bloque} · {form.tipo_media}
                  </p>

                  <h4 className="mt-1 text-lg font-black">
                    {form.titulo || 'Media del servicio'}
                  </h4>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/62">
                    {form.descripcion ||
                      'Vista previa del archivo seleccionado o actualmente cargado.'}
                  </p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Poster
                </p>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-white">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </section>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_35px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? 'Guardar cambios' : 'Subir media'}
              </button>

              <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50 px-4 py-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />

                  <p className="text-sm leading-6 text-cyan-900/80">
                    El backend devuelve la URL pública del archivo. Esa URL será
                    usada automáticamente por la web pública.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfirmDeleteModal({ open, item, onClose, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(2,6,23,0.35)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Eliminar media
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Vas a eliminar{' '}
              <span className="font-black text-slate-800">
                {item?.titulo || 'esta media'}
              </span>
              . El backend también eliminará el archivo físico si corresponde.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>

      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white">
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>

        {description && (
          <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-400">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-cyan-600"
      />
    </label>
  );
}
