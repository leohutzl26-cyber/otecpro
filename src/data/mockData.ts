import type { 
  Cliente, Curso, Relator, Ejecucion, Cotizacion, Transaccion, 
  Alerta, EventoCalendario, MargenCurso, EstadoResultados, 
  Participante
} from '@/types';

// ============================================
// DATOS MOCK - ERP OTEC PRO
// ============================================

// --- CLIENTES ---
export const clientesMock: Cliente[] = [
  {
    id: 'c1',
    rut: '76.123.456-7',
    razonSocial: 'Agrosuper S.A.',
    giro: 'Producción Avícola y Porcina',
    direccion: 'Av. Santa Rosa 4010',
    comuna: 'La Pintana',
    region: 'Metropolitana',
    contactos: [
      { id: 'con1', nombre: 'María González', cargo: 'Jefa de RRHH', email: 'm.gonzalez@agrosuper.cl', telefono: '+56 2 2345 6789', esDecisor: true, esCoordinador: false },
      { id: 'con2', nombre: 'Pedro Soto', cargo: 'Coordinador de Capacitación', email: 'p.soto@agrosuper.cl', telefono: '+56 2 2345 6790', esDecisor: false, esCoordinador: true }
    ],
    fechaRegistro: '2023-01-15',
    observaciones: 'Cliente estratégico, gran volumen de capacitaciones'
  },
  {
    id: 'c2',
    rut: '78.987.654-3',
    razonSocial: 'Codelco División El Teniente',
    giro: 'Minería del Cobre',
    direccion: 'Ruta C-25 Km 15',
    comuna: 'Rancagua',
    region: "O'Higgins",
    contactos: [
      { id: 'con3', nombre: 'Carlos Rojas', cargo: 'Gerente de Operaciones', email: 'c.rojas@codelco.cl', telefono: '+56 72 2345 678', esDecisor: true, esCoordinador: false },
      { id: 'con4', nombre: 'Ana Martínez', cargo: 'Supervisora de Capacitación', email: 'a.martinez@codelco.cl', telefono: '+56 72 2345 679', esDecisor: false, esCoordinador: true }
    ],
    fechaRegistro: '2023-03-20'
  },
  {
    id: 'c3',
    rut: '96.543.210-1',
    razonSocial: 'Soprole S.A.',
    giro: 'Productos Lácteos',
    direccion: 'Av. Presidente Kennedy 5300',
    comuna: 'Las Condes',
    region: 'Metropolitana',
    contactos: [
      { id: 'con5', nombre: 'Luis Herrera', cargo: 'Director de Personas', email: 'l.herrera@soprole.cl', telefono: '+56 2 2445 6000', esDecisor: true, esCoordinador: false }
    ],
    fechaRegistro: '2023-06-10'
  },
  {
    id: 'c4',
    rut: '77.111.222-3',
    razonSocial: 'Empresas CMPC S.A.',
    giro: 'Forestal y Celulosa',
    direccion: 'Av. El Golf 150',
    comuna: 'Las Condes',
    region: 'Metropolitana',
    contactos: [
      { id: 'con6', nombre: 'Diana Fuentes', cargo: 'Gerenta RRHH', email: 'd.fuentes@cmpc.cl', telefono: '+56 2 2465 7000', esDecisor: true, esCoordinador: false },
      { id: 'con7', nombre: 'Roberto Álvarez', cargo: 'Analista de Capacitación', email: 'r.alvarez@cmpc.cl', telefono: '+56 2 2465 7001', esDecisor: false, esCoordinador: true }
    ],
    fechaRegistro: '2023-08-05'
  },
  {
    id: 'c5',
    rut: '79.444.555-6',
    razonSocial: 'Masisa Chile S.A.',
    giro: 'Maderera',
    direccion: 'Av. Kennedy 9351',
    comuna: 'Las Condes',
    region: 'Metropolitana',
    contactos: [
      { id: 'con8', nombre: 'Patricia López', cargo: 'Jefa de Desarrollo', email: 'p.lopez@masisa.com', telefono: '+56 2 2578 9000', esDecisor: true, esCoordinador: true }
    ],
    fechaRegistro: '2024-01-20'
  }
];

// --- CURSOS ---
export const cursosMock: Curso[] = [
  {
    id: 'cur1',
    codigoInterno: 'OTEC-001',
    codigoSence: '12345678',
    nombre: 'Aplicación de Plaguicidas Nivel Básico',
    descripcion: 'Curso teórico-práctico para operarios que manipulan plaguicidas en faenas agrícolas. Incluye normativa SAG y seguridad.',
    horasTotales: 40,
    modalidad: 'Presencial',
    esSAG: true,
    activo: true,
    archivosAdjuntos: [
      { id: 'a1', nombre: 'Temario Curso Plaguicidas.pdf', tipo: 'temario', url: '/docs/temario-plaguicidas.pdf', tamaño: 2450000, fechaSubida: '2025-01-15', descripcion: 'Temario completo del curso' },
      { id: 'a2', nombre: 'Manual del Participante.pdf', tipo: 'manual', url: '/docs/manual-plaguicidas.pdf', tamaño: 8900000, fechaSubida: '2025-01-15', descripcion: 'Manual con toda la información del curso' },
      { id: 'a3', nombre: 'Presentación Módulo 1.pptx', tipo: 'presentacion', url: '/docs/presentacion-mod1.pptx', tamaño: 15200000, fechaSubida: '2025-01-20', descripcion: 'Presentación del primer módulo' }
    ]
  },
  {
    id: 'cur2',
    codigoInterno: 'OTEC-002',
    codigoSence: '23456789',
    nombre: 'Trabajo en Altura',
    descripcion: 'Capacitación en técnicas de trabajo seguro en altura, uso de arnés y líneas de vida.',
    horasTotales: 16,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true,
    archivosAdjuntos: [
      { id: 'a4', nombre: 'Guía de Seguridad Altura.pdf', tipo: 'manual', url: '/docs/guia-altura.pdf', tamaño: 3200000, fechaSubida: '2025-01-10', descripcion: 'Guía completa de seguridad' }
    ]
  },
  {
    id: 'cur3',
    codigoInterno: 'OTEC-003',
    codigoSence: '34567890',
    nombre: 'Prevención de Riesgos Eléctricos',
    descripcion: 'Identificación de riesgos eléctricos, procedimientos de bloqueo y etiquetado (LOTO).',
    horasTotales: 8,
    modalidad: 'E-learning Sincrónico',
    esSAG: false,
    activo: true,
    archivosAdjuntos: []
  },
  {
    id: 'cur4',
    codigoInterno: 'OTEC-004',
    nombre: 'Liderazgo y Gestión de Equipos',
    descripcion: 'Desarrollo de habilidades blandas para supervisores y jefes de equipo.',
    horasTotales: 24,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true,
    archivosAdjuntos: [
      { id: 'a5', nombre: 'Material de Liderazgo.pdf', tipo: 'documento', url: '/docs/liderazgo.pdf', tamaño: 4500000, fechaSubida: '2025-02-01', descripcion: 'Material complementario' }
    ]
  },
  {
    id: 'cur5',
    codigoInterno: 'OTEC-005',
    codigoSence: '45678901',
    nombre: 'Operación Segura de Montacargas',
    descripcion: 'Capacitación certificada SENCE para operadores de montacargas.',
    horasTotales: 20,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true,
    archivosAdjuntos: []
  },
  {
    id: 'cur6',
    codigoInterno: 'OTEC-006',
    codigoSence: '56789012',
    nombre: 'Primeros Auxilios y RCP',
    descripcion: 'Técnicas de reanimación cardiopulmonar y primeros auxilios básicos.',
    horasTotales: 12,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true,
    archivosAdjuntos: [
      { id: 'a6', nombre: 'Video RCP.mp4', tipo: 'video', url: '/docs/video-rcp.mp4', tamaño: 125000000, fechaSubida: '2025-01-25', descripcion: 'Video demostrativo de RCP' }
    ]
  },
  {
    id: 'cur7',
    codigoInterno: 'OTEC-007',
    nombre: 'Excel Avanzado para Análisis de Datos',
    descripcion: 'Tablas dinámicas, macros, Power Query y análisis de datos con Excel.',
    horasTotales: 16,
    modalidad: 'E-learning Sincrónico',
    esSAG: false,
    activo: true,
    archivosAdjuntos: []
  },
  {
    id: 'cur8',
    codigoInterno: 'OTEC-008',
    codigoSence: '67890123',
    nombre: 'Manejo Defensivo de Vehículos',
    descripcion: 'Técnicas de conducción preventiva y manejo defensivo en carreteras.',
    horasTotales: 8,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true,
    archivosAdjuntos: []
  }
];

// --- RELATORES ---
export const relatoresMock: Relator[] = [
  {
    id: 'r1',
    rut: '12.345.678-9',
    nombre: 'Juan Carlos Fernández',
    profesion: 'Ingeniero Agrónomo',
    especialidad: 'Plaguicidas y Sanidad Ambiental',
    valorHora: 45000,
    email: 'jc.fernandez@email.cl',
    telefono: '+56 9 8765 4321',
    activo: true
  },
  {
    id: 'r2',
    rut: '13.456.789-0',
    nombre: 'María Elena Díaz',
    profesion: 'Técnico en Seguridad Industrial',
    especialidad: 'Trabajo en Altura y Espacios Confinados',
    valorHora: 38000,
    email: 'me.diaz@email.cl',
    telefono: '+56 9 7654 3210',
    activo: true
  },
  {
    id: 'r3',
    rut: '14.567.890-1',
    nombre: 'Roberto Andrés Silva',
    profesion: 'Ingeniero Eléctrico',
    especialidad: 'Seguridad Eléctrica y Normativa',
    valorHora: 42000,
    email: 'ra.silva@email.cl',
    telefono: '+56 9 6543 2109',
    activo: true
  },
  {
    id: 'r4',
    rut: '15.678.901-2',
    nombre: 'Carmen Gloria Rojas',
    profesion: 'Psicóloga Organizacional',
    especialidad: 'Desarrollo de Personas y Liderazgo',
    valorHora: 50000,
    email: 'cg.rojas@email.cl',
    telefono: '+56 9 5432 1098',
    activo: true
  },
  {
    id: 'r5',
    rut: '16.789.012-3',
    nombre: 'Pedro Antonio Muñoz',
    profesion: 'Técnico Mecánico',
    especialidad: 'Operación de Maquinaria Pesada',
    valorHora: 35000,
    email: 'pa.munoz@email.cl',
    telefono: '+56 9 4321 0987',
    activo: true
  },
  {
    id: 'r6',
    rut: '17.890.123-4',
    nombre: 'Laura Beatriz Torres',
    profesion: 'Enfermera',
    especialidad: 'Primeros Auxilios y Emergencias',
    valorHora: 32000,
    email: 'lb.torres@email.cl',
    telefono: '+56 9 3210 9876',
    activo: true
  }
];

// --- PARTICIPANTES MOCK ---
const generateParticipantes = (cantidad: number, esSAG: boolean): Participante[] => {
  const nombres = ['Carlos', 'Juan', 'Pedro', 'Diego', 'Andrés', 'María', 'Ana', 'Laura', 'Carmen', 'Patricia', 'Fernanda', 'Daniela'];
  const apellidos = ['Gómez', 'López', 'Martínez', 'González', 'Rodríguez', 'Sánchez', 'Pérez', 'Fernández', 'Torres', 'Ramírez'];
  
  return Array.from({ length: cantidad }, (_, i) => {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const rut = `${Math.floor(10000000 + Math.random() * 9000000)}-${Math.floor(Math.random() * 9)}`;
    
    const hoy = new Date();
    const fechaExamen = new Date(hoy.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
    const vencido = (hoy.getTime() - fechaExamen.getTime()) > 90 * 24 * 60 * 60 * 1000;
    
    return {
      id: `part-${i}`,
      rut,
      nombre,
      apellido,
      email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.cl`,
      asistenciaProgreso: Math.floor(60 + Math.random() * 40),
      notaFinal: Math.random() > 0.3 ? Math.floor(40 + Math.random() * 60) / 10 : undefined,
      documentosSAG: esSAG ? {
        colinesterasa: {
          url: Math.random() > 0.3 ? '/docs/colinesterasa.pdf' : undefined,
          fechaExamen: fechaExamen.toISOString().split('T')[0],
          fechaVencimiento: new Date(fechaExamen.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          valido: !vencido && Math.random() > 0.3
        },
        certificadoMedico: {
          url: Math.random() > 0.4 ? '/docs/certificado.pdf' : undefined,
          valido: Math.random() > 0.4
        },
        poderSimple: {
          url: Math.random() > 0.5 ? '/docs/poder.pdf' : undefined,
          valido: Math.random() > 0.5
        }
      } : {
        colinesterasa: { valido: false },
        certificadoMedico: { valido: false },
        poderSimple: { valido: false }
      },
      estadoSAG: esSAG ? (Math.random() > 0.6 ? 'Completo' : 'Incompleto') : 'No Aplica'
    };
  });
};

// --- EJECUCIONES ---
export const ejecucionesMock: Ejecucion[] = [
  {
    id: 'e1',
    cursoId: 'cur1',
    clienteId: 'c1',
    codigoSence: '12345678',
    idAcciones: ['ACC-2024-001', 'ACC-2024-002'],
    estado: 'En Ejecución',
    configuracion: {
      modalidad: 'Presencial',
      totalHoras: 40,
      sesiones: [
        { fecha: '2025-03-01', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-03-02', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-03-08', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-03-09', horaInicio: '08:00', horaFin: '13:00' }
      ],
      lugar: 'Sede Agrosuper, La Pintana'
    },
    relatorId: 'r1',
    participantes: generateParticipantes(15, true),
    fechaInicio: '2025-03-01',
    fechaTermino: '2025-03-09',
    horario: 'Sábados y Domingos 08:00-13:00',
    costosDirectosAsociados: ['g1', 'g2', 'g3'],
    observaciones: 'Curso SAG con examen de colinesterasa obligatorio'
  },
  {
    id: 'e2',
    cursoId: 'cur2',
    clienteId: 'c2',
    codigoSence: '23456789',
    idAcciones: ['ACC-2024-003'],
    estado: 'Planificado',
    configuracion: {
      modalidad: 'Presencial',
      totalHoras: 16,
      sesiones: [
        { fecha: '2025-03-15', horaInicio: '09:00', horaFin: '18:00' },
        { fecha: '2025-03-16', horaInicio: '09:00', horaFin: '18:00' }
      ],
      lugar: 'Centro de Entrenamiento Codelco, Rancagua'
    },
    relatorId: 'r2',
    participantes: generateParticipantes(12, false),
    fechaInicio: '2025-03-15',
    fechaTermino: '2025-03-16',
    horario: 'Sábado y Domingo 09:00-18:00',
    costosDirectosAsociados: []
  },
  {
    id: 'e3',
    cursoId: 'cur3',
    clienteId: 'c3',
    codigoSence: '34567890',
    idAcciones: ['ACC-2024-004'],
    estado: 'En Ejecución',
    configuracion: {
      modalidad: 'E-learning Sincrónico',
      totalHoras: 8,
      sesiones: [
        { fecha: '2025-02-25', horaInicio: '09:00', horaFin: '13:00' },
        { fecha: '2025-02-26', horaInicio: '09:00', horaFin: '13:00' }
      ],
      urlPlataforma: 'https://zoom.us/j/123456789'
    },
    relatorId: 'r3',
    participantes: generateParticipantes(20, false),
    fechaInicio: '2025-02-25',
    fechaTermino: '2025-02-26',
    horario: 'Martes y Miércoles 09:00-13:00',
    costosDirectosAsociados: ['g4']
  },
  {
    id: 'e4',
    cursoId: 'cur4',
    clienteId: 'c4',
    idAcciones: [],
    estado: 'Completado',
    configuracion: {
      modalidad: 'Presencial',
      totalHoras: 24,
      sesiones: [
        { fecha: '2025-01-15', horaInicio: '09:00', horaFin: '18:00' },
        { fecha: '2025-01-16', horaInicio: '09:00', horaFin: '18:00' },
        { fecha: '2025-01-17', horaInicio: '09:00', horaFin: '18:00' }
      ],
      lugar: 'Sede CMPC, Las Condes'
    },
    relatorId: 'r4',
    participantes: generateParticipantes(18, false),
    fechaInicio: '2025-01-15',
    fechaTermino: '2025-01-17',
    horario: 'Miércoles a Viernes 09:00-18:00',
    costosDirectosAsociados: ['g5', 'g6']
  },
  {
    id: 'e5',
    cursoId: 'cur5',
    clienteId: 'c1',
    codigoSence: '45678901',
    idAcciones: ['ACC-2024-005'],
    estado: 'Planificado',
    configuracion: {
      modalidad: 'Presencial',
      totalHoras: 20,
      sesiones: [
        { fecha: '2025-04-05', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-04-06', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-04-12', horaInicio: '08:00', horaFin: '13:00' },
        { fecha: '2025-04-13', horaInicio: '08:00', horaFin: '13:00' }
      ],
      lugar: 'Bodega Agrosuper, San Bernardo'
    },
    relatorId: 'r5',
    participantes: generateParticipantes(8, false),
    fechaInicio: '2025-04-05',
    fechaTermino: '2025-04-13',
    horario: 'Sábados y Domingos 08:00-13:00',
    costosDirectosAsociados: []
  },
  {
    id: 'e6',
    cursoId: 'cur6',
    clienteId: 'c5',
    codigoSence: '56789012',
    idAcciones: ['ACC-2024-006'],
    estado: 'En Ejecución',
    configuracion: {
      modalidad: 'Presencial',
      totalHoras: 12,
      sesiones: [
        { fecha: '2025-02-28', horaInicio: '09:00', horaFin: '18:00' }
      ],
      lugar: 'Sede Masisa, Santiago'
    },
    relatorId: 'r6',
    participantes: generateParticipantes(25, false),
    fechaInicio: '2025-02-28',
    fechaTermino: '2025-02-28',
    horario: 'Viernes 09:00-18:00',
    costosDirectosAsociados: ['g7']
  }
];

// --- COTIZACIONES ---
export const cotizacionesMock: Cotizacion[] = [
  {
    id: 'cot1',
    numero: 'COT-2025-001',
    clienteId: 'c1',
    fecha: '2025-01-10',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur1',
        valorPorParticipante: 85000,
        cantidadParticipantes: 15,
        descuento: 10,
        subtotal: 1147500
      }
    ],
    subtotal: 1147500,
    iva: 218025,
    total: 1365525,
    estado: 'Aprobada',
    fechaAprobacion: '2025-01-15',
    ejecucionId: 'e1',
    observaciones: 'Curso SAG para operarios de campo'
  },
  {
    id: 'cot2',
    numero: 'COT-2025-002',
    clienteId: 'c2',
    fecha: '2025-02-01',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur2',
        valorPorParticipante: 65000,
        cantidadParticipantes: 12,
        descuento: 5,
        subtotal: 741000
      }
    ],
    subtotal: 741000,
    iva: 140790,
    total: 881790,
    estado: 'Aprobada',
    fechaAprobacion: '2025-02-10',
    ejecucionId: 'e2'
  },
  {
    id: 'cot3',
    numero: 'COT-2025-003',
    clienteId: 'c3',
    fecha: '2025-02-15',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur3',
        valorPorParticipante: 35000,
        cantidadParticipantes: 20,
        descuento: 0,
        subtotal: 700000
      }
    ],
    subtotal: 700000,
    iva: 133000,
    total: 833000,
    estado: 'Aprobada',
    fechaAprobacion: '2025-02-18',
    ejecucionId: 'e3'
  },
  {
    id: 'cot4',
    numero: 'COT-2025-004',
    clienteId: 'c4',
    fecha: '2025-01-05',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur4',
        valorPorParticipante: 95000,
        cantidadParticipantes: 18,
        descuento: 15,
        subtotal: 1453500
      }
    ],
    subtotal: 1453500,
    iva: 276165,
    total: 1729665,
    estado: 'Aprobada',
    fechaAprobacion: '2025-01-08',
    ejecucionId: 'e4'
  },
  {
    id: 'cot5',
    numero: 'COT-2025-005',
    clienteId: 'c5',
    fecha: '2025-02-20',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur6',
        valorPorParticipante: 28000,
        cantidadParticipantes: 25,
        descuento: 0,
        subtotal: 700000
      }
    ],
    subtotal: 700000,
    iva: 133000,
    total: 833000,
    estado: 'Aprobada',
    fechaAprobacion: '2025-02-22',
    ejecucionId: 'e6'
  },
  {
    id: 'cot6',
    numero: 'COT-2025-006',
    clienteId: 'c1',
    fecha: '2025-03-01',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur5',
        valorPorParticipante: 55000,
        cantidadParticipantes: 8,
        descuento: 0,
        subtotal: 440000
      }
    ],
    subtotal: 440000,
    iva: 83600,
    total: 523600,
    estado: 'Borrador'
  },
  {
    id: 'cot7',
    numero: 'COT-2025-007',
    clienteId: 'c3',
    fecha: '2025-03-05',
    vigenciaDias: 30,
    items: [
      {
        cursoId: 'cur7',
        valorPorParticipante: 42000,
        cantidadParticipantes: 30,
        descuento: 20,
        subtotal: 1008000
      }
    ],
    subtotal: 1008000,
    iva: 191520,
    total: 1199520,
    estado: 'Enviada'
  }
];

// --- TRANSACCIONES FINANCIERAS ---
export const transaccionesMock: Transaccion[] = [
  // INGRESOS
  {
    id: 't1',
    tipo: 'Ingreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e1',
    clienteId: 'c1',
    monto: { neto: 1147500, iva: 218025, total: 1365525 },
    metadatos: { nroDocumento: 'F-001-12345', descripcion: 'Factura curso Plaguicidas' },
    tracking: { fechaEmision: '2025-01-20', fechaVencimiento: '2025-02-20', fechaPagoReal: '2025-02-18', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 't2',
    tipo: 'Ingreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e4',
    clienteId: 'c4',
    monto: { neto: 1453500, iva: 276165, total: 1729665 },
    metadatos: { nroDocumento: 'F-001-12346', descripcion: 'Factura curso Liderazgo' },
    tracking: { fechaEmision: '2025-01-10', fechaVencimiento: '2025-02-10', fechaPagoReal: '2025-02-05', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 't3',
    tipo: 'Ingreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e3',
    clienteId: 'c3',
    monto: { neto: 700000, iva: 133000, total: 833000 },
    metadatos: { nroDocumento: 'F-001-12347', descripcion: 'Factura curso Riesgos Eléctricos' },
    tracking: { fechaEmision: '2025-02-20', fechaVencimiento: '2025-03-22', pagado: false },
    saldoPendiente: 833000
  },
  {
    id: 't4',
    tipo: 'Ingreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e6',
    clienteId: 'c5',
    monto: { neto: 700000, iva: 133000, total: 833000 },
    metadatos: { nroDocumento: 'F-001-12348', descripcion: 'Factura curso Primeros Auxilios' },
    tracking: { fechaEmision: '2025-02-25', fechaVencimiento: '2025-03-27', pagado: false },
    saldoPendiente: 833000
  },
  // EGRESOS DIRECTOS
  {
    id: 'g1',
    tipo: 'Egreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e1',
    monto: { neto: 720000, iva: 136800, total: 856800 },
    metadatos: { nroDocumento: 'BH-001-456', descripcion: 'Boleta honorarios Juan Fernández (40 hrs)' },
    tracking: { fechaEmision: '2025-03-10', fechaVencimiento: '2025-03-10', pagado: false },
    saldoPendiente: 856800
  },
  {
    id: 'g2',
    tipo: 'Egreso',
    categoria: 'Materiales',
    esDirecto: true,
    idEjecucion: 'e1',
    monto: { neto: 85000, iva: 16150, total: 101150 },
    metadatos: { nroDocumento: 'F-998-221', descripcion: 'Manuales y material didáctico' },
    tracking: { fechaEmision: '2025-02-28', fechaVencimiento: '2025-03-15', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'g3',
    tipo: 'Egreso',
    categoria: 'Colaciones',
    esDirecto: true,
    idEjecucion: 'e1',
    monto: { neto: 120000, iva: 22800, total: 142800 },
    metadatos: { nroDocumento: 'B-777-445', descripcion: 'Coffee break 4 días' },
    tracking: { fechaEmision: '2025-03-09', fechaVencimiento: '2025-03-09', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'g4',
    tipo: 'Egreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e3',
    monto: { neto: 336000, iva: 63840, total: 399840 },
    metadatos: { nroDocumento: 'BH-001-457', descripcion: 'Boleta honorarios Roberto Silva (8 hrs)' },
    tracking: { fechaEmision: '2025-02-28', fechaVencimiento: '2025-02-28', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'g5',
    tipo: 'Egreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e4',
    monto: { neto: 1200000, iva: 228000, total: 1428000 },
    metadatos: { nroDocumento: 'BH-001-458', descripcion: 'Boleta honorarios Carmen Rojas (24 hrs)' },
    tracking: { fechaEmision: '2025-01-20', fechaVencimiento: '2025-01-20', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'g6',
    tipo: 'Egreso',
    categoria: 'Colaciones',
    esDirecto: true,
    idEjecucion: 'e4',
    monto: { neto: 180000, iva: 34200, total: 214200 },
    metadatos: { nroDocumento: 'B-777-446', descripcion: 'Almuerzos 3 días' },
    tracking: { fechaEmision: '2025-01-18', fechaVencimiento: '2025-02-01', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'g7',
    tipo: 'Egreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: 'e6',
    monto: { neto: 384000, iva: 72960, total: 456960 },
    metadatos: { nroDocumento: 'BH-001-459', descripcion: 'Boleta honorarios Laura Torres (12 hrs)' },
    tracking: { fechaEmision: '2025-03-01', fechaVencimiento: '2025-03-01', pagado: false },
    saldoPendiente: 456960
  },
  // GASTOS INDIRECTOS
  {
    id: 'gi1',
    tipo: 'Egreso',
    categoria: 'Sueldos',
    esDirecto: false,
    monto: { neto: 2500000, iva: 0, total: 2500000 },
    metadatos: { nroDocumento: 'LIQ-001', descripcion: 'Sueldos staff administrativo' },
    tracking: { fechaEmision: '2025-02-28', fechaVencimiento: '2025-02-28', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'gi2',
    tipo: 'Egreso',
    categoria: 'Arriendo Oficina',
    esDirecto: false,
    monto: { neto: 800000, iva: 152000, total: 952000 },
    metadatos: { nroDocumento: 'F-555-889', descripcion: 'Arriendo oficina central' },
    tracking: { fechaEmision: '2025-02-01', fechaVencimiento: '2025-02-05', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'gi3',
    tipo: 'Egreso',
    categoria: 'Combustible',
    esDirecto: false,
    monto: { neto: 180000, iva: 34200, total: 214200 },
    metadatos: { nroDocumento: 'B-333-112', descripcion: 'Combustible vehículo empresa', patenteVehiculo: 'ABCD-12', kilometraje: 2500 },
    tracking: { fechaEmision: '2025-02-15', fechaVencimiento: '2025-02-15', pagado: true },
    saldoPendiente: 0
  },
  {
    id: 'gi4',
    tipo: 'Egreso',
    categoria: 'Insumos',
    esDirecto: false,
    monto: { neto: 95000, iva: 18050, total: 113050 },
    metadatos: { nroDocumento: 'B-444-223', descripcion: 'Útiles de oficina y papelería' },
    tracking: { fechaEmision: '2025-02-20', fechaVencimiento: '2025-03-05', pagado: false },
    saldoPendiente: 113050
  }
];

// --- ALERTAS ---
export const alertasMock: Alerta[] = [
  {
    id: 'a1',
    tipo: 'SAG',
    mensaje: '3 alumnos del curso Plaguicidas tienen examen de colinesterasa vencido',
    fecha: '2025-03-01',
    prioridad: 'Alta',
    entidadId: 'e1',
    entidadTipo: 'ejecucion'
  },
  {
    id: 'a2',
    tipo: 'Financiera',
    mensaje: 'Factura F-001-12347 por $833.000 vence en 5 días (Soprole)',
    fecha: '2025-03-17',
    prioridad: 'Media',
    entidadId: 't3',
    entidadTipo: 'transaccion'
  },
  {
    id: 'a3',
    tipo: 'SENCE',
    mensaje: 'Curso Trabajo en Altura inicia en 48h - Aviso de inicio pendiente',
    fecha: '2025-03-13',
    prioridad: 'Alta',
    entidadId: 'e2',
    entidadTipo: 'ejecucion'
  },
  {
    id: 'a4',
    tipo: 'Financiera',
    mensaje: 'Boleta BH-001-456 por $856.800 vence hoy (Juan Fernández)',
    fecha: '2025-03-10',
    prioridad: 'Alta',
    entidadId: 'g1',
    entidadTipo: 'transaccion'
  },
  {
    id: 'a5',
    tipo: 'Operativa',
    mensaje: 'Curso Operación de Montacargas no tiene relator asignado',
    fecha: '2025-03-01',
    prioridad: 'Media',
    entidadId: 'e5',
    entidadTipo: 'ejecucion'
  },
  {
    id: 'a6',
    tipo: 'SAG',
    mensaje: '2 alumnos pendientes de certificado médico - Curso Plaguicidas',
    fecha: '2025-03-02',
    prioridad: 'Media',
    entidadId: 'e1',
    entidadTipo: 'ejecucion'
  }
];

// --- EVENTOS CALENDARIO ---
export const eventosCalendarioMock: EventoCalendario[] = (() => {
  const eventos: EventoCalendario[] = [];
  
  // Cursos
  ejecucionesMock.forEach(e => {
    e.configuracion.sesiones.forEach((sesion, idx) => {
      eventos.push({
        id: `ev-cur-${e.id}-${idx}`,
        titulo: `${e.curso?.nombre || 'Curso'} - Sesión ${idx + 1}`,
        fechaInicio: `${sesion.fecha}T${sesion.horaInicio}`,
        fechaFin: `${sesion.fecha}T${sesion.horaFin}`,
        tipo: 'curso',
        color: e.estado === 'En Ejecución' ? '#10b981' : e.estado === 'Planificado' ? '#3b82f6' : '#6b7280',
        entidadId: e.id,
        descripcion: `Cliente: ${e.cliente?.razonSocial || 'N/A'}`
      });
    });
  });
  
  // Pagos y cobros
  transaccionesMock.filter(t => !t.tracking.pagado).forEach(t => {
    eventos.push({
      id: `ev-fin-${t.id}`,
      titulo: `${t.tipo === 'Ingreso' ? 'Cobro' : 'Pago'}: ${t.metadatos.descripcion}`,
      fechaInicio: `${t.tracking.fechaVencimiento}T09:00`,
      fechaFin: `${t.tracking.fechaVencimiento}T10:00`,
      tipo: t.tipo === 'Ingreso' ? 'cobro' : 'pago',
      color: t.tipo === 'Ingreso' ? '#22c55e' : '#ef4444',
      entidadId: t.id,
      monto: t.monto.total
    });
  });
  
  return eventos;
})();

// --- MÁRGENES POR CURSO ---
export const margenesMock: MargenCurso[] = [
  {
    ejecucionId: 'e1',
    cursoNombre: 'Aplicación de Plaguicidas Nivel Básico',
    clienteNombre: 'Agrosuper S.A.',
    ingresosNetos: 1147500,
    gastosDirectos: 925000,
    margenBruto: 222500,
    margenPorcentaje: 19.4
  },
  {
    ejecucionId: 'e4',
    cursoNombre: 'Liderazgo y Gestión de Equipos',
    clienteNombre: 'Empresas CMPC S.A.',
    ingresosNetos: 1453500,
    gastosDirectos: 1428000,
    margenBruto: 25500,
    margenPorcentaje: 1.8
  },
  {
    ejecucionId: 'e3',
    cursoNombre: 'Prevención de Riesgos Eléctricos',
    clienteNombre: 'Soprole S.A.',
    ingresosNetos: 700000,
    gastosDirectos: 399840,
    margenBruto: 300160,
    margenPorcentaje: 42.9
  },
  {
    ejecucionId: 'e6',
    cursoNombre: 'Primeros Auxilios y RCP',
    clienteNombre: 'Masisa Chile S.A.',
    ingresosNetos: 700000,
    gastosDirectos: 456960,
    margenBruto: 243040,
    margenPorcentaje: 34.7
  }
];

// --- ESTADO DE RESULTADOS ---
export const estadoResultadosMock: EstadoResultados = {
  periodo: 'Febrero 2025',
  ingresosTotales: 4001000,
  gastosDirectos: 3213800,
  margenContribucion: 787200,
  gastosIndirectos: 3584250,
  utilidadNeta: -2797050,
  utilidadPorcentaje: -69.9
};

// --- CONFIGURACIÓN OTEC ---
export const configuracionOTEC = {
  nombre: 'OTEC Capacitación Profesional SpA',
  rut: '76.123.456-K',
  direccion: 'Av. Providencia 1234, Oficina 501',
  email: 'contacto@otecpro.cl',
  telefono: '+56 2 2345 6789',
  configuracionSENCE: {
    codigoOtec: 'OTEC-12345',
    vigenciaColinesterasaDias: 90
  }
};
