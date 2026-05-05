import type { 
  Cliente, Curso, Relator, Ejecucion, Cotizacion, Transaccion, 
  Alerta, EventoCalendario, Participante
} from '@/types';

// ============================================
// DATOS MOCK - ERP OTEC PRO (VACÍO)
// ============================================

export const clientesMock: Cliente[] = [];
export const cursosMock: Curso[] = [];
export const relatoresMock: Relator[] = [];
export const ejecucionesMock: Ejecucion[] = [];
export const cotizacionesMock: Cotizacion[] = [];
export const transaccionesMock: Transaccion[] = [];
export const alertasMock: Alerta[] = [];
export const eventosCalendarioMock: EventoCalendario[] = [];

// @ts-ignore
const generateParticipantes = (cantidad: number, esSAG: boolean): Participante[] => [];
