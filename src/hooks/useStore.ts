import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { 
  Cliente, Curso, Relator, Ejecucion, Cotizacion, Transaccion, 
  Alerta, Participante, ArchivoAdjunto, ItemCotizacion
} from '@/types';
import { 
  clientesMock, cursosMock, relatoresMock, ejecucionesMock, 
  cotizacionesMock, transaccionesMock, alertasMock 
} from '@/data/mockData';
import { toast } from 'sonner';

export interface StoreState {
  clientes: Cliente[];
  cursos: Curso[];
  relatores: Relator[];
  ejecuciones: Ejecucion[];
  cotizaciones: Cotizacion[];
  transacciones: Transaccion[];
  alertas: Alerta[];
  isLoading: boolean;

  initData: () => Promise<void>;
  resetData: () => void;

  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<Cliente>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  // Cursos
  addCurso: (curso: Omit<Curso, 'id'>) => Promise<Curso>;
  updateCurso: (id: string, data: Partial<Curso>) => Promise<void>;
  deleteCurso: (id: string) => Promise<void>;
  addArchivoAdjunto: (cursoId: string, archivo: Omit<ArchivoAdjunto, 'id' | 'fechaSubida'>) => Promise<ArchivoAdjunto>;
  deleteArchivoAdjunto: (cursoId: string, archivoId: string) => Promise<void>;

  // Relatores
  addRelator: (relator: Omit<Relator, 'id'>) => Promise<Relator>;
  updateRelator: (id: string, data: Partial<Relator>) => Promise<void>;
  deleteRelator: (id: string) => Promise<void>;

  // Cotizaciones
  addCotizacion: (cotizacion: Omit<Cotizacion, 'id' | 'numero'>) => Promise<Cotizacion>;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => Promise<void>;
  aprobarCotizacion: (cotizacionId: string) => Promise<Ejecucion | undefined>;

  // Ejecuciones
  addEjecucion: (ejecucion: Omit<Ejecucion, 'id'>) => Promise<Ejecucion>;
  updateEjecucion: (id: string, data: Partial<Ejecucion>) => Promise<void>;
  addParticipante: (ejecucionId: string, participante: Omit<Participante, 'id'>) => Promise<void>;
  updateParticipante: (ejecucionId: string, participanteId: string, data: Partial<Participante>) => Promise<void>;
  updateDocumentoSAG: (ejecucionId: string, participanteId: string, tipoDocumento: 'colinesterasa' | 'certificadoMedico' | 'poderSimple', data: { url?: string; fechaExamen?: string; valido: boolean }) => Promise<void>;

  // Transacciones
  addTransaccion: (transaccion: Omit<Transaccion, 'id'>) => Promise<Transaccion>;
  updateTransaccion: (id: string, data: Partial<Transaccion>) => Promise<void>;
  registrarPago: (transaccionId: string, fechaPago: string) => Promise<void>;
  emitirNotaCredito: (facturaId: string, montoNC: number, motivo: string) => Promise<Transaccion | null>;

  // Alertas
  dismissAlerta: (id: string) => Promise<void>;
  addAlerta: (alerta: Omit<Alerta, 'id'>) => Promise<Alerta>;

  // Getters & Cálculos
  getClienteById: (id: string) => Cliente | undefined;
  getCursoById: (id: string) => Curso | undefined;
  getRelatorById: (id: string) => Relator | undefined;
  getEjecucionById: (id: string) => (Ejecucion & { curso?: Curso; cliente?: Cliente; relator?: Relator }) | undefined;
  getCotizacionById: (id: string) => (Cotizacion & { cliente?: Cliente; items: (ItemCotizacion & { curso?: Curso })[] }) | undefined;

  getMargenCurso: (ejecucionId: string) => { ingresosNetos: number; gastosDirectos: number; margenBruto: number; margenPorcentaje: number };
  getEstadoResultados: (periodo: string) => { periodo: string; ingresosTotales: number; gastosDirectos: number; margenContribucion: number; gastosIndirectos: number; utilidadNeta: number; utilidadPorcentaje: number };
  getFlujoCaja: (dias?: number) => { fecha: string; ingresosProyectados: number; ingresosReales: number; egresosProyectados: number; egresosReales: number; saldoProyectado: number; saldoReal: number }[];
}

export const useStore = create<StoreState>((set, get) => ({
  clientes: clientesMock,
  cursos: cursosMock,
  relatores: relatoresMock,
  ejecuciones: ejecucionesMock,
  cotizaciones: cotizacionesMock,
  transacciones: transaccionesMock,
  alertas: alertasMock,
  isLoading: false,

  initData: async () => {
    set({ isLoading: true });
    try {
      const [
        { data: cData }, { data: curData }, { data: rData }, 
        { data: eData }, { data: cotData }, { data: tData }, { data: aData }
      ] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('cursos').select('*'),
        supabase.from('relatores').select('*'),
        supabase.from('ejecuciones').select('*'),
        supabase.from('cotizaciones').select('*'),
        supabase.from('transacciones').select('*'),
        supabase.from('alertas').select('*'),
      ]);

      set(state => ({
        clientes: cData && cData.length > 0 ? cData as Cliente[] : state.clientes,
        cursos: curData && curData.length > 0 ? curData as Curso[] : state.cursos,
        relatores: rData && rData.length > 0 ? rData as Relator[] : state.relatores,
        ejecuciones: eData && eData.length > 0 ? eData as Ejecucion[] : state.ejecuciones,
        cotizaciones: cotData && cotData.length > 0 ? cotData as Cotizacion[] : state.cotizaciones,
        transacciones: tData && tData.length > 0 ? tData as Transaccion[] : state.transacciones,
        alertas: aData && aData.length > 0 ? aData as Alerta[] : state.alertas,
      }));
    } catch (error) {
      console.error('Error cargando datos de Supabase:', error);
      toast.error('No se pudo conectar a la base de datos correctamente. Usando datos locales temporales.');
    } finally {
      set({ isLoading: false });
    }
  },

  resetData: () => set({
    clientes: clientesMock, cursos: cursosMock, relatores: relatoresMock,
    ejecuciones: ejecucionesMock, cotizaciones: cotizacionesMock, 
    transacciones: transaccionesMock, alertas: alertasMock
  }),

  // --- CLIENTES ---
  addCliente: async (cliente) => {
    const newCliente = { ...cliente, id: `c${Date.now()}` } as Cliente;
    set(state => ({ clientes: [...state.clientes, newCliente] }));
    try {
      const { error } = await supabase.from('clientes').insert(newCliente);
      if (error) throw error;
    } catch (error) {
      set(state => ({ clientes: state.clientes.filter(c => c.id !== newCliente.id) }));
      toast.error('Error al guardar el cliente'); throw error;
    }
    return newCliente;
  },

  updateCliente: async (id, data) => {
    const oldCliente = get().clientes.find(c => c.id === id);
    if (!oldCliente) return;
    set(state => ({ clientes: state.clientes.map(c => c.id === id ? { ...c, ...data } : c) }));
    try {
      const { error } = await supabase.from('clientes').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ clientes: state.clientes.map(c => c.id === id ? oldCliente : c) }));
      toast.error('Error al actualizar el cliente'); throw error;
    }
  },

  deleteCliente: async (id) => {
    const oldCliente = get().clientes.find(c => c.id === id);
    if (!oldCliente) return;
    set(state => ({ clientes: state.clientes.filter(c => c.id !== id) }));
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ clientes: [...state.clientes, oldCliente] }));
      toast.error('Error al eliminar el cliente'); throw error;
    }
  },

  // --- CURSOS ---
  addCurso: async (curso) => {
    const newCurso = { ...curso, id: `cur${Date.now()}` } as Curso;
    set(state => ({ cursos: [...state.cursos, newCurso] }));
    try {
      const { error } = await supabase.from('cursos').insert(newCurso);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cursos: state.cursos.filter(c => c.id !== newCurso.id) }));
      toast.error('Error al guardar el curso'); throw error;
    }
    return newCurso;
  },

  updateCurso: async (id, data) => {
    const oldCurso = get().cursos.find(c => c.id === id);
    if (!oldCurso) return;
    set(state => ({ cursos: state.cursos.map(c => c.id === id ? { ...c, ...data } : c) }));
    try {
      const { error } = await supabase.from('cursos').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cursos: state.cursos.map(c => c.id === id ? oldCurso : c) }));
      toast.error('Error al actualizar el curso'); throw error;
    }
  },

  deleteCurso: async (id) => {
    const oldCurso = get().cursos.find(c => c.id === id);
    if (!oldCurso) return;
    set(state => ({ cursos: state.cursos.filter(c => c.id !== id) }));
    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cursos: [...state.cursos, oldCurso] }));
      toast.error('Error al eliminar el curso'); throw error;
    }
  },

  addArchivoAdjunto: async (cursoId, archivo) => {
    const newArchivo: ArchivoAdjunto = { ...archivo, id: `arch${Date.now()}`, fechaSubida: new Date().toISOString().split('T')[0] };
    const curso = get().cursos.find(c => c.id === cursoId);
    if (!curso) throw new Error('Curso no encontrado');
    
    const newArchivos = [...curso.archivosAdjuntos, newArchivo];
    set(state => ({ cursos: state.cursos.map(c => c.id === cursoId ? { ...c, archivosAdjuntos: newArchivos } : c) }));
    try {
      const { error } = await supabase.from('cursos').update({ archivosAdjuntos: newArchivos }).eq('id', cursoId);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cursos: state.cursos.map(c => c.id === cursoId ? curso : c) }));
      toast.error('Error al adjuntar el archivo'); throw error;
    }
    return newArchivo;
  },

  deleteArchivoAdjunto: async (cursoId, archivoId) => {
    const curso = get().cursos.find(c => c.id === cursoId);
    if (!curso) return;
    const newArchivos = curso.archivosAdjuntos.filter(a => a.id !== archivoId);
    
    set(state => ({ cursos: state.cursos.map(c => c.id === cursoId ? { ...c, archivosAdjuntos: newArchivos } : c) }));
    try {
      const { error } = await supabase.from('cursos').update({ archivosAdjuntos: newArchivos }).eq('id', cursoId);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cursos: state.cursos.map(c => c.id === cursoId ? curso : c) }));
      toast.error('Error al eliminar el archivo adjunto'); throw error;
    }
  },

  // --- RELATORES ---
  addRelator: async (relator) => {
    const newRelator = { ...relator, id: `r${Date.now()}` } as Relator;
    set(state => ({ relatores: [...state.relatores, newRelator] }));
    try {
      const { error } = await supabase.from('relatores').insert(newRelator);
      if (error) throw error;
    } catch (error) {
      set(state => ({ relatores: state.relatores.filter(r => r.id !== newRelator.id) }));
      toast.error('Error al guardar el relator'); throw error;
    }
    return newRelator;
  },

  updateRelator: async (id, data) => {
    const oldRelator = get().relatores.find(r => r.id === id);
    if (!oldRelator) return;
    set(state => ({ relatores: state.relatores.map(r => r.id === id ? { ...r, ...data } : r) }));
    try {
      const { error } = await supabase.from('relatores').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ relatores: state.relatores.map(r => r.id === id ? oldRelator : r) }));
      toast.error('Error al actualizar el relator'); throw error;
    }
  },

  deleteRelator: async (id) => {
    const oldRelator = get().relatores.find(r => r.id === id);
    if (!oldRelator) return;
    set(state => ({ relatores: state.relatores.filter(r => r.id !== id) }));
    try {
      const { error } = await supabase.from('relatores').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ relatores: [...state.relatores, oldRelator] }));
      toast.error('Error al eliminar el relator'); throw error;
    }
  },

  // --- COTIZACIONES ---
  addCotizacion: async (cotizacion) => {
    const { cotizaciones } = get();
    const numero = `COT-2025-${String(cotizaciones.length + 1).padStart(3, '0')}`;
    const newCotizacion = { ...cotizacion, id: `cot${Date.now()}`, numero } as Cotizacion;
    set(state => ({ cotizaciones: [...state.cotizaciones, newCotizacion] }));
    try {
      const { error } = await supabase.from('cotizaciones').insert(newCotizacion);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cotizaciones: state.cotizaciones.filter(c => c.id !== newCotizacion.id) }));
      toast.error('Error al guardar cotización'); throw error;
    }
    return newCotizacion;
  },

  updateCotizacion: async (id, data) => {
    const old = get().cotizaciones.find(c => c.id === id);
    if (!old) return;
    set(state => ({ cotizaciones: state.cotizaciones.map(c => c.id === id ? { ...c, ...data } : c) }));
    try {
      const { error } = await supabase.from('cotizaciones').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ cotizaciones: state.cotizaciones.map(c => c.id === id ? old : c) }));
      toast.error('Error al actualizar cotización'); throw error;
    }
  },

  aprobarCotizacion: async (cotizacionId) => {
    const { cotizaciones, updateCotizacion } = get();
    const cotizacion = cotizaciones.find(c => c.id === cotizacionId);
    if (!cotizacion) return;

    await updateCotizacion(cotizacionId, { estado: 'Aprobada', fechaAprobacion: new Date().toISOString().split('T')[0] });

    const newEjecucion: Ejecucion = {
      id: `e${Date.now()}`, cursoId: cotizacion.items[0]?.cursoId || '',
      clienteId: cotizacion.clienteId, idAcciones: [], estado: 'Planificado',
      configuracion: { modalidad: 'Presencial', totalHoras: 0, sesiones: [] },
      relatorId: '', participantes: [], fechaInicio: '', fechaTermino: '', horario: '', costosDirectosAsociados: [], cotizacionId: cotizacion.id
    };

    set(state => ({ ejecuciones: [...state.ejecuciones, newEjecucion] }));
    try {
      await supabase.from('ejecuciones').insert(newEjecucion);
      await updateCotizacion(cotizacionId, { ejecucionId: newEjecucion.id });
    } catch (error) {
      // Simplificado rollback
      toast.error('Error al generar la ejecución en el servidor');
    }
    return newEjecucion;
  },

  // --- EJECUCIONES ---
  addEjecucion: async (ejecucion) => {
    const newE = { ...ejecucion, id: `e${Date.now()}` } as Ejecucion;
    set(state => ({ ejecuciones: [...state.ejecuciones, newE] }));
    try {
      const { error } = await supabase.from('ejecuciones').insert(newE);
      if (error) throw error;
    } catch (error) {
      set(state => ({ ejecuciones: state.ejecuciones.filter(e => e.id !== newE.id) }));
      toast.error('Error al guardar ejecución'); throw error;
    }
    return newE;
  },

  updateEjecucion: async (id, data) => {
    const old = get().ejecuciones.find(e => e.id === id);
    if (!old) return;
    set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === id ? { ...e, ...data } : e) }));
    try {
      const { error } = await supabase.from('ejecuciones').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === id ? old : e) }));
      toast.error('Error al actualizar ejecución'); throw error;
    }
  },

  addParticipante: async (ejecucionId, participante) => {
    const ejecucion = get().ejecuciones.find(e => e.id === ejecucionId);
    if (!ejecucion) return;
    const newPart = { ...participante, id: `part-${Date.now()}` } as Participante;
    const newArray = [...ejecucion.participantes, newPart];

    set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: newArray } : e) }));
    try {
      const { error } = await supabase.from('ejecuciones').update({ participantes: newArray }).eq('id', ejecucionId);
      if (error) throw error;
    } catch (error) {
      set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? ejecucion : e) }));
      toast.error('Error al agregar participante'); throw error;
    }
  },

  updateParticipante: async (ejecucionId, participanteId, data) => {
    const ejecucion = get().ejecuciones.find(e => e.id === ejecucionId);
    if (!ejecucion) return;
    const newArray = ejecucion.participantes.map(p => p.id === participanteId ? { ...p, ...data } : p);

    set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: newArray } : e) }));
    try {
      const { error } = await supabase.from('ejecuciones').update({ participantes: newArray }).eq('id', ejecucionId);
      if (error) throw error;
    } catch (error) {
      set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? ejecucion : e) }));
      toast.error('Error al actualizar participante'); throw error;
    }
  },

  updateDocumentoSAG: async (ejecucionId, participanteId, tipoDocumento, data) => {
    const ejecucion = get().ejecuciones.find(e => e.id === ejecucionId);
    if (!ejecucion) return;
    const newArray = ejecucion.participantes.map(p => {
      if (p.id === participanteId) {
        return { ...p, documentosSAG: { ...p.documentosSAG, [tipoDocumento]: data } };
      }
      return p;
    });

    set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: newArray } : e) }));
    try {
      const { error } = await supabase.from('ejecuciones').update({ participantes: newArray }).eq('id', ejecucionId);
      if (error) throw error;
    } catch (error) {
      set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? ejecucion : e) }));
      toast.error('Error al actualizar documentos'); throw error;
    }
  },

  // --- TRANSACCIONES ---
  addTransaccion: async (transaccion) => {
    const newT = { ...transaccion, id: `t${Date.now()}`, saldoPendiente: transaccion.tipo === 'NotaCredito' ? 0 : transaccion.monto.total } as Transaccion;
    set(state => ({ transacciones: [...state.transacciones, newT] }));
    try {
      const { error } = await supabase.from('transacciones').insert(newT);
      if (error) throw error;
    } catch (error) {
      set(state => ({ transacciones: state.transacciones.filter(t => t.id !== newT.id) }));
      toast.error('Error al registrar transacción'); throw error;
    }
    return newT;
  },

  updateTransaccion: async (id, data) => {
    const old = get().transacciones.find(t => t.id === id);
    if (!old) return;
    set(state => ({ transacciones: state.transacciones.map(t => t.id === id ? { ...t, ...data } : t) }));
    try {
      const { error } = await supabase.from('transacciones').update(data).eq('id', id);
      if (error) throw error;
    } catch (error) {
      set(state => ({ transacciones: state.transacciones.map(t => t.id === id ? old : t) }));
      toast.error('Error al actualizar transacción'); throw error;
    }
  },

  registrarPago: async (transaccionId, fechaPago) => {
    const { transacciones, updateTransaccion } = get();
    const old = transacciones.find(t => t.id === transaccionId);
    if (old) {
      await updateTransaccion(transaccionId, { tracking: { ...old.tracking, fechaPagoReal: fechaPago, pagado: true }, saldoPendiente: 0 });
    }
  },

  emitirNotaCredito: async (facturaId, montoNC, motivo) => {
    const { transacciones, updateTransaccion } = get();
    const factura = transacciones.find(t => t.id === facturaId && t.tipo === 'Ingreso');
    if (!factura) return null;

    const notaCredito: Transaccion = {
      id: `nc${Date.now()}`, tipo: 'NotaCredito', categoria: 'Honorarios', esDirecto: factura.esDirecto, idEjecucion: factura.idEjecucion, clienteId: factura.clienteId,
      monto: { neto: montoNC / 1.19, iva: montoNC - (montoNC / 1.19), total: montoNC }, metadatos: { nroDocumento: `NC-${Date.now()}`, descripcion: `Nota de crédito por ${motivo}`, facturaRef: facturaId }, tracking: { fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento: new Date().toISOString().split('T')[0], pagado: true }, saldoPendiente: 0
    };

    set(state => ({ transacciones: [...state.transacciones, notaCredito] }));
    try {
      await supabase.from('transacciones').insert(notaCredito);
      const nuevoSaldo = (factura.saldoPendiente || factura.monto.total) - montoNC;
      await updateTransaccion(facturaId, { saldoPendiente: Math.max(0, nuevoSaldo), tracking: { ...factura.tracking, pagado: nuevoSaldo <= 0 } });
      return notaCredito;
    } catch (error) {
      set(state => ({ transacciones: state.transacciones.filter(t => t.id !== notaCredito.id) }));
      toast.error('Error emitiendo Nota de Crédito'); throw error;
    }
  },

  // --- ALERTAS ---
  dismissAlerta: async (id) => {
    const old = get().alertas.find(a => a.id === id);
    if (!old) return;
    set(state => ({ alertas: state.alertas.filter(a => a.id !== id) }));
    try {
      await supabase.from('alertas').delete().eq('id', id);
    } catch (error) {
      set(state => ({ alertas: [...state.alertas, old] }));
    }
  },

  addAlerta: async (alerta) => {
    const newA = { ...alerta, id: `a${Date.now()}` } as Alerta;
    set(state => ({ alertas: [...state.alertas, newA] }));
    try {
      await supabase.from('alertas').insert(newA);
    } catch (error) {
      set(state => ({ alertas: state.alertas.filter(a => a.id !== newA.id) }));
    }
    return newA;
  },

  // --- GETTERS ---
  getClienteById: (id) => get().clientes.find(c => c.id === id),
  getCursoById: (id) => get().cursos.find(c => c.id === id),
  getRelatorById: (id) => get().relatores.find(r => r.id === id),
  getEjecucionById: (id) => {
    const { ejecuciones, getCursoById, getClienteById, getRelatorById } = get();
    const ejecucion = ejecuciones.find(e => e.id === id);
    if (ejecucion) {
      return { ...ejecucion, curso: getCursoById(ejecucion.cursoId), cliente: getClienteById(ejecucion.clienteId), relator: getRelatorById(ejecucion.relatorId) };
    }
    return undefined;
  },
  getCotizacionById: (id) => {
    const { cotizaciones, getClienteById, getCursoById } = get();
    const cotizacion = cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      return { ...cotizacion, cliente: getClienteById(cotizacion.clienteId), items: cotizacion.items.map(item => ({ ...item, curso: getCursoById(item.cursoId) })) };
    }
    return undefined;
  },

  // --- CÁLCULOS ---
  getMargenCurso: (ejecucionId) => {
    const { transacciones } = get();
    const ingresos = transacciones.filter(t => t.idEjecucion === ejecucionId && t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto.neto, 0);
    const notasCredito = transacciones.filter(t => t.idEjecucion === ejecucionId && t.tipo === 'NotaCredito').reduce((sum, t) => sum + t.monto.neto, 0);
    const gastosDirectos = transacciones.filter(t => t.idEjecucion === ejecucionId && t.tipo === 'Egreso' && t.esDirecto).reduce((sum, t) => sum + t.monto.neto, 0);
    
    const ingresosNetos = ingresos - notasCredito;
    const margenBruto = ingresosNetos - gastosDirectos;
    const margenPorcentaje = ingresosNetos > 0 ? (margenBruto / ingresosNetos) * 100 : 0;
    
    return { ingresosNetos, gastosDirectos, margenBruto, margenPorcentaje };
  },

  getEstadoResultados: (periodo) => {
    const { transacciones } = get();
    const ingresosTotales = transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto.neto, 0);
    const notasCredito = transacciones.filter(t => t.tipo === 'NotaCredito').reduce((sum, t) => sum + t.monto.neto, 0);
    const ingresosNetos = ingresosTotales - notasCredito;
    const gastosDirectos = transacciones.filter(t => t.tipo === 'Egreso' && t.esDirecto).reduce((sum, t) => sum + t.monto.neto, 0);
    const margenContribucion = ingresosNetos - gastosDirectos;
    const gastosIndirectos = transacciones.filter(t => t.tipo === 'Egreso' && !t.esDirecto).reduce((sum, t) => sum + t.monto.neto, 0);
    const utilidadNeta = margenContribucion - gastosIndirectos;
    const utilidadPorcentaje = ingresosNetos > 0 ? (utilidadNeta / ingresosNetos) * 100 : 0;
    
    return { periodo, ingresosTotales: ingresosNetos, gastosDirectos, margenContribucion, gastosIndirectos, utilidadNeta, utilidadPorcentaje };
  },

  getFlujoCaja: (dias = 30) => {
    const { transacciones } = get();
    const hoy = new Date();
    const flujo = [];
    for (let i = 0; i < dias; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      const ingresosDia = transacciones.filter(t => t.tipo === 'Ingreso' && t.tracking.fechaVencimiento === fechaStr && !t.tracking.pagado).reduce((sum, t) => sum + t.monto.total, 0);
      const egresosDia = transacciones.filter(t => t.tipo === 'Egreso' && t.tracking.fechaVencimiento === fechaStr && !t.tracking.pagado).reduce((sum, t) => sum + t.monto.total, 0);
      flujo.push({ fecha: fechaStr, ingresosProyectados: ingresosDia, ingresosReales: 0, egresosProyectados: egresosDia, egresosReales: 0, saldoProyectado: ingresosDia - egresosDia, saldoReal: 0 });
    }
    return flujo;
  }
}));

export type Store = ReturnType<typeof useStore>;
