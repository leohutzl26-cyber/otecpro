// ============================================
// ERP OTEC PRO - TIPOS COMPLETOS
// ============================================

// --- ENUMS Y TIPOS BASE ---

export type ModalidadCurso = 'Presencial' | 'E-learning Sincrónico' | 'E-learning Asincrónico' | 'Auto-instrucción';

export type EstadoCotizacion = 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada';

export type EstadoEjecucion = 'Planificado' | 'En Ejecución' | 'Completado' | 'Cancelado';

export type EstadoDocumentoSAG = 'Pendiente' | 'Vencido' | 'Valido' | 'No Aplica';

export type TipoTransaccion = 'Ingreso' | 'Egreso' | 'NotaCredito';

export type CategoriaGasto = 'Honorarios' | 'Materiales' | 'Viaticos' | 'Colaciones' | 'Traslados' | 'Arriendo Sala' | 'Combustible' | 'Sueldos' | 'Arriendo Oficina' | 'Insumos' | 'Otros';

export type RegionChile = 'Arica y Parinacota' | 'Tarapacá' | 'Antofagasta' | 'Atacama' | 'Coquimbo' | 'Valparaíso' | 'Metropolitana' | "O'Higgins" | 'Maule' | 'Ñuble' | 'Biobío' | 'Araucanía' | 'Los Ríos' | 'Los Lagos' | 'Aysén' | 'Magallanes';

export type TipoArchivo = 'temario' | 'manual' | 'presentacion' | 'video' | 'documento' | 'imagen' | 'otro';

// --- ENTIDADES PRINCIPALES ---

export interface Contacto {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  esDecisor: boolean;
  esCoordinador: boolean;
}

export interface Cliente {
  id: string;
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
  region: RegionChile;
  holding?: string;
  contactos: Contacto[];
  fechaRegistro: string;
  observaciones?: string;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: TipoArchivo;
  url: string;
  tamaño?: number;
  fechaSubida: string;
  descripcion?: string;
}

export interface Curso {
  id: string;
  codigoInterno: string;
  codigoSence?: string;
  nombre: string;
  descripcion: string;
  horasTotales: number;
  modalidad: ModalidadCurso;
  esSAG: boolean;
  temarioUrl?: string;
  activo: boolean;
  archivosAdjuntos: ArchivoAdjunto[];
}

export interface Relator {
  id: string;
  rut: string;
  nombre: string;
  profesion: string;
  especialidad: string;
  valorHora: number;
  curriculumUrl?: string;
  titulosUrl?: string;
  email: string;
  telefono: string;
  activo: boolean;
}

// --- ESTRUCTURAS ANIDADAS ---

export interface Sesion {
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface DocumentoSAG {
  url?: string;
  fechaExamen?: string;
  fechaVencimiento?: string;
  valido: boolean;
}

export interface Participante {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  nivelEducacional?: string;
  asistenciaProgreso: number;
  notaFinal?: number;
  documentosSAG: {
    colinesterasa: DocumentoSAG;
    certificadoMedico: DocumentoSAG;
    poderSimple: DocumentoSAG;
  };
  estadoSAG: 'Completo' | 'Incompleto' | 'Pendiente' | 'No Aplica';
}

// --- EJECUCIÓN DE CURSO ---

export interface Ejecucion {
  id: string;
  cursoId: string;
  curso?: Curso;
  clienteId: string;
  cliente?: Cliente;
  codigoSence?: string;
  idAcciones: string[];
  estado: EstadoEjecucion;
  configuracion: {
    modalidad: ModalidadCurso;
    totalHoras: number;
    sesiones: Sesion[];
    lugar?: string;
    urlPlataforma?: string;
  };
  relatorId: string;
  relator?: Relator;
  participantes: Participante[];
  fechaInicio: string;
  fechaTermino: string;
  horario: string;
  costosDirectosAsociados: string[];
  cotizacionId?: string;
  observaciones?: string;
}

// --- COMERCIAL ---

export interface ItemCotizacion {
  cursoId: string;
  curso?: Curso;
  valorPorParticipante: number;
  cantidadParticipantes: number;
  descuento: number;
  subtotal: number;
}

export interface Cotizacion {
  id: string;
  numero: string;
  clienteId: string;
  cliente?: Cliente;
  contactoId?: string;
  fecha: string;
  vigenciaDias: number;
  items: ItemCotizacion[];
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoCotizacion;
  ejecutivoId?: string;
  observaciones?: string;
  fechaAprobacion?: string;
  ejecucionId?: string;
}

// --- FINANZAS ---

export interface Monto {
  neto: number;
  iva: number;
  total: number;
}

export interface TrackingFinanciero {
  fechaEmision?: string;
  fechaVencimiento?: string;
  fechaPagoReal?: string;
  pagado?: boolean;
}

export interface Transaccion {
  id: string;
  tipo: TipoTransaccion;
  categoria: CategoriaGasto;
  subCategoria?: string;
  esDirecto: boolean;
  idEjecucion?: string;
  ejecucion?: Ejecucion;
  clienteId?: string;
  cliente?: Cliente;
  monto: Monto;
  metadatos: {
    nroDocumento?: string;
    pdfUrl?: string;
    patenteVehiculo?: string;
    kilometraje?: number;
    facturaRef?: string; // Para Notas de Crédito
    descripcion?: string;
  };
  tracking: TrackingFinanciero;
  saldoPendiente?: number;
}

// --- DASHBOARD Y REPORTES ---

export interface KPI {
  titulo: string;
  valor: string | number;
  tendencia?: number;
  icono: string;
  color: string;
}

export interface Alerta {
  id: string;
  tipo: 'SAG' | 'SENCE' | 'Financiera' | 'Operativa';
  mensaje: string;
  fecha: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  entidadId?: string;
  entidadTipo?: string;
}

export interface MargenCurso {
  ejecucionId: string;
  cursoNombre: string;
  clienteNombre: string;
  ingresosNetos: number;
  gastosDirectos: number;
  margenBruto: number;
  margenPorcentaje: number;
}

export interface EstadoResultados {
  periodo: string;
  ingresosTotales: number;
  gastosDirectos: number;
  margenContribucion: number;
  gastosIndirectos: number;
  utilidadNeta: number;
  utilidadPorcentaje: number;
}

export interface FlujoCaja {
  fecha: string;
  ingresosProyectados: number;
  ingresosReales: number;
  egresosProyectados: number;
  egresosReales: number;
  saldoProyectado: number;
  saldoReal: number;
}

// --- CALENDARIO ---

export interface EventoCalendario {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: 'curso' | 'pago' | 'cobro' | 'hito_sence' | 'alerta_sag';
  color: string;
  entidadId?: string;
  descripcion?: string;
  monto?: number;
}

// --- USUARIOS Y CONFIGURACIÓN ---

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Comercial' | 'Operaciones' | 'Finanzas' | 'Relator';
  permisos: string[];
  activo: boolean;
}

export interface ConfiguracionOTEC {
  nombre: string;
  rut: string;
  direccion: string;
  logoUrl?: string;
  email: string;
  telefono: string;
  configuracionSENCE: {
    codigoOtec: string;
    vigenciaColinesterasaDias: number;
  };
}
