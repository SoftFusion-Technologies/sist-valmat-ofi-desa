// Benjamin Orellana - 2026/04/24 - Data centralizada de servicios VALMAT para cards, páginas individuales y futuras secciones comerciales.

import {
  HiSparkles,
  HiShieldCheck,
  HiWrenchScrewdriver
} from 'react-icons/hi2';

export const services = [
  {
    id: 1,
    slug: 'final-de-obra',
    eyebrow: 'Limpieza técnica',
    title: 'Final de obra',
    shortTitle: 'Obra',
    subtitle:
      'Limpieza técnica final de obra con planificación, detalle y control de calidad.',
    mediaType: 'video',
    mediaSrc: '/videos/final-obra.mp4',
    mediaPoster: '/videos/posters/final-obra.jpg',
    badge: 'Más solicitado',
    intent: 'Ideal para entregar, habitar o presentar un espacio terminado.',
    description:
      'Realizamos limpiezas técnicas finales de obra con un enfoque profesional, ordenado y controlado. El servicio está pensado para dejar el espacio en condiciones reales de entrega, uso o presentación.',
    detailTitle:
      'Dejá tu obra lista para entregar, habitar o presentar con una limpieza técnica profesional.',
    detailIntro:
      'Después de una obra, la limpieza convencional no alcanza. El polvo fino, los restos de material, las marcas en superficies y los detalles finales requieren una intervención ordenada, técnica y cuidada.',
    salesText:
      'VALMAT planifica el servicio por etapas para que cada ambiente quede limpio, prolijo y con una presentación final profesional.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Eliminación de polvo fino',
      'Limpieza de pisos y zócalos',
      'Detalles en aberturas y superficies',
      'Limpieza de sanitarios y cocina',
      'Limpieza de cristales según alcance',
      'Revisión final del espacio'
    ],
    benefits: [
      'Mejor presentación visual del inmueble',
      'Espacios listos para entrega o uso',
      'Reducción de polvo posterior a obra',
      'Terminaciones más limpias y prolijas',
      'Servicio organizado por sectores'
    ],
    painPoints: [
      'Polvo fino difícil de retirar',
      'Restos de obra en zonas visibles',
      'Vidrios, pisos y aberturas con marcas',
      'Espacios que todavía no lucen terminados'
    ],
    process: [
      'Relevamiento del espacio',
      'Definición del alcance',
      'Limpieza técnica por sectores',
      'Control final de calidad'
    ],
    useCases: [
      'Obras terminadas',
      'Departamentos nuevos',
      'Locales comerciales',
      'Refacciones particulares',
      'Espacios corporativos'
    ],
    faq: [
      {
        question: '¿Se puede cotizar antes de visitar el lugar?',
        answer:
          'Sí. Podés enviar la información inicial por el formulario y luego VALMAT puede solicitar fotos, medidas o coordinar una visita técnica si hace falta.'
      },
      {
        question: '¿El servicio sirve para entregar una obra?',
        answer:
          'Sí. Está pensado justamente para mejorar la presentación final del espacio antes de entrega, mudanza, inauguración o uso.'
      },
      {
        question: '¿Incluye vidrios?',
        answer:
          'Puede incluirlos según el alcance acordado, el tipo de vidrio, altura, acceso y condiciones del espacio.'
      }
    ],
    ctaLabel: 'Solicitar visita técnica',
    secondaryCtaLabel: 'Ver servicio completo',
    icon: HiWrenchScrewdriver
  },
  {
    id: 2,
    slug: 'hogares',
    eyebrow: 'Espacios impecables',
    title: 'Hogares',
    shortTitle: 'Hogar',
    subtitle: 'Limpieza integral para hogares con ejecución cuidada y detalle.',
    mediaType: 'video',
    mediaSrc: '/videos/hogares.mp4',
    mediaPoster: '/videos/posters/hogares.jpg',
    badge: 'Para viviendas',
    intent: 'Ideal para recuperar orden, higiene y sensación de bienestar.',
    description:
      'Servicio preparado para presentar hogares con una imagen limpia, cuidada y profesional, respetando cada ambiente y cada detalle del espacio.',
    detailTitle:
      'Un hogar limpio, ordenado y cuidado transmite bienestar desde el primer momento.',
    detailIntro:
      'Cada hogar tiene una dinámica distinta. Por eso, el servicio se adapta al tipo de espacio, nivel de uso y necesidad puntual.',
    salesText:
      'VALMAT trabaja con criterio, cuidado y atención al detalle para lograr una limpieza que se note desde el ingreso.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Limpieza general de ambientes',
      'Orden visual y terminación cuidada',
      'Superficies y sectores de uso frecuente',
      'Detalle final según alcance acordado'
    ],
    benefits: [
      'Ambientes más agradables y cuidados',
      'Mejor sensación de higiene diaria',
      'Servicio adaptable a cada hogar',
      'Terminación visual más prolija'
    ],
    painPoints: [
      'Falta de tiempo para limpieza profunda',
      'Ambientes cargados o desordenados',
      'Superficies con uso frecuente',
      'Necesidad de dejar la casa presentable'
    ],
    process: [
      'Relevamiento del hogar',
      'Definición de prioridades',
      'Limpieza por ambientes',
      'Revisión final del servicio'
    ],
    useCases: [
      'Casas familiares',
      'Departamentos',
      'Mudanzas',
      'Limpiezas profundas',
      'Mantenimiento programado'
    ],
    faq: [
      {
        question: '¿Se puede pedir limpieza por ambientes?',
        answer:
          'Sí. El servicio puede organizarse por prioridad, por ambiente o por necesidad específica del hogar.'
      },
      {
        question: '¿Sirve para mudanzas?',
        answer:
          'Sí. Es una excelente opción para dejar un espacio listo antes o después de una mudanza.'
      },
      {
        question: '¿El servicio se adapta al tamaño del hogar?',
        answer:
          'Sí. La propuesta se define según superficie, estado del espacio, frecuencia y alcance requerido.'
      }
    ],
    ctaLabel: 'Solicitar este servicio',
    secondaryCtaLabel: 'Ver servicio completo',
    icon: HiShieldCheck
  },
  {
    id: 3,
    slug: 'tapizados',
    eyebrow: 'Detalle profesional',
    title: 'Tapizados',
    shortTitle: 'Tapizados',
    subtitle: 'Limpieza de tapizados y superficies delicadas.',
    mediaType: 'video',
    mediaSrc: '/videos/tapizado.mp4',
    mediaPoster: '/videos/posters/tapizado.jpg',
    badge: 'Detalle premium',
    intent:
      'Ideal para renovar sillones, sillas y superficies de uso frecuente.',
    description:
      'Servicio orientado a superficies delicadas, tapizados y elementos que requieren una intervención más precisa, cuidada y profesional.',
    detailTitle:
      'Renová la imagen de tus tapizados con una limpieza cuidada y profesional.',
    detailIntro:
      'Los tapizados acumulan uso, polvo, manchas y desgaste visual. Una limpieza técnica ayuda a recuperar presencia, higiene y sensación de cuidado.',
    salesText:
      'VALMAT evalúa cada superficie para aplicar un proceso adecuado, evitando tratar todos los materiales de la misma forma.',
    includesTitle: '¿Qué incluye este servicio?',
    features: [
      'Evaluación inicial del material',
      'Proceso de limpieza según superficie',
      'Tratamiento visual y sanitario',
      'Terminación cuidada'
    ],
    benefits: [
      'Mejora visual del tapizado',
      'Mayor higiene en superficies de uso diario',
      'Cuidado del material',
      'Mejor presencia del mobiliario'
    ],
    painPoints: [
      'Tapizados con uso intenso',
      'Manchas visibles',
      'Acumulación de polvo',
      'Muebles que perdieron presencia'
    ],
    process: [
      'Evaluación del tapizado',
      'Definición del tratamiento',
      'Limpieza técnica',
      'Secado y revisión final'
    ],
    useCases: ['Sillones', 'Sillas', 'Respaldos', 'Butacas', 'Salas de espera'],
    faq: [
      {
        question: '¿Todos los tapizados se limpian igual?',
        answer:
          'No. Primero se evalúa el material y el estado general para definir el tipo de intervención adecuada.'
      },
      {
        question: '¿Sirve para comercios u oficinas?',
        answer:
          'Sí. Es ideal para salas de espera, oficinas, locales, estudios y espacios con mobiliario de uso frecuente.'
      },
      {
        question: '¿Se puede consultar por varios muebles?',
        answer:
          'Sí. Desde el formulario podés detallar cantidad, tipo de tapizado y ubicación.'
      }
    ],
    ctaLabel: 'Solicitar este servicio',
    secondaryCtaLabel: 'Ver servicio completo',
    icon: HiSparkles
  }
];

export const getServiceBySlug = (slug) => {
  return services.find((service) => service.slug === slug);
};
