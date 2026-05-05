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
  categoriasArchivos: import('@/types').CategoriaArchivo[];
  addCategoriaArchivo: (nombre: string) => Promise<void>;
  deleteCategoriaArchivo: (id: string) => Promise<void>;
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
  addCotizacion: (cotizacion: Omit<Cotizacion, 'id' | 'codigoUnico'>) => Promise<Cotizacion>;
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
  getCotizacionById: (id: string) => (Cotizacion & { cliente?: Cliente; items?: (ItemCotizacion & { curso?: Curso })[] }) | undefined;

  getMargenCurso: (ejecucionId: string) => { ingresosNetos: number; gastosDirectos: number; margenBruto: number; margenPorcentaje: number };
  getEstadoResultados: (periodo: string) => { periodo: string; ingresosTotales: number; gastosDirectos: number; margenContribucion: number; gastosIndirectos: number; utilidadNeta: number; utilidadPorcentaje: number };
  getFlujoCaja: (dias?: number) => { fecha: string; ingresosProyectados: number; ingresosReales: number; egresosProyectados: number; egresosReales: number; saldoProyectado: number; saldoReal: number }[];
  
  // Alumnos
  getTodosLosAlumnos: () => Participante[];
  addParticipantesMasivo: (ejecucionId: string, participantes: Partial<Participante>[]) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  clientes: clientesMock,
  cursos: cursosMock,
  relatores: relatoresMock,
  ejecuciones: ejecucionesMock,
  cotizaciones: cotizacionesMock,
  transacciones: transaccionesMock,
  alertas: alertasMock,
  categoriasArchivos: [],
  isLoading: false,

  initData: async () => {
    set({ isLoading: true });
    try {
      const [
        { data: cData }, { data: curData }, { data: rData }, 
        { data: eData }, { data: cotData }, { data: tData }, { data: aData }, { data: catData }
      ] = await Promise.all([
        supabase.from('clientes').select('*, contactos(*)'),
        supabase.from('cursos').select('*'),
        supabase.from('relatores').select('*'),
        supabase.from('ejecuciones').select('*'),
        supabase.from('cotizaciones').select('*'),
        supabase.from('transacciones').select('*'),
        supabase.from('alertas').select('*'),
        supabase.from('categorias_archivos').select('*'),
        supabase.from('participantes').select('*'),
      ]);

      // Mapear participantes
      const mappedParticipantes = pData && pData.length > 0 ? pData.map((p: any) => ({
        id: p.id,
        rut: p.rut,
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        telefono: p.telefono,
        nivelEducacional: p.nivel_educacional,
        asistenciaProgreso: p.asistencia_progreso || 0,
        notaFinal: p.nota_final,
        estadoSAG: p.estado_sag || 'No Aplica',
        documentosSAG: {
          colinesterasa: { url: p.doc_col_url, fechaExamen: p.doc_col_fecha_examen, fechaVencimiento: p.doc_col_fecha_vencimiento, valido: p.doc_col_valido || false },
          certificadoMedico: { url: p.doc_med_url, valido: p.doc_med_valido || false },
          poderSimple: { url: p.doc_pod_url, valido: p.doc_pod_valido || false }
        },
        ejecucionId: p.ejecucion_id // Added custom field for joining
      })) : [];

      set(state => ({
        clientes: cData && cData.length > 0 ? cData.map((c: any) => ({
          id: c.id,
          rut: c.rut,
          razonSocial: c.razon_social,
          giro: c.giro,
          direccion: c.direccion,
          comuna: c.comuna,
          region: c.region,
          holding: c.holding,
          contactos: c.contactos ? c.contactos.map((con: any) => ({
            id: con.id,
            nombre: con.nombre,
            cargo: con.cargo,
            email: con.email,
            telefono: con.telefono,
            esDecisor: con.es_decisor,
            esCoordinador: con.es_coordinador
          })) : [],
          fechaRegistro: c.fecha_registro,
          observaciones: c.observaciones
        })) : state.clientes,
        cursos: curData && curData.length > 0 ? curData as Curso[] : state.cursos,
        relatores: rData && rData.length > 0 ? rData as Relator[] : state.relatores,
        ejecuciones: eData && eData.length > 0 ? eData.map((e: any) => ({
          ...e,
          id: e.id,
          participantes: mappedParticipantes.filter((p: any) => p.ejecucionId === e.id)
        })) as Ejecucion[] : state.ejecuciones,
        cotizaciones: cotData && cotData.length > 0 ? cotData.map((cot: any) => {
          let extra = {} as any;
          try {
            if (cot.observaciones && cot.observaciones.startsWith('{')) {
              extra = JSON.parse(cot.observaciones);
            } else {
              extra = { descripcion: cot.observaciones };
            }
          } catch (e) {
            extra = { descripcion: cot.observaciones };
          }
          return {
            id: cot.id,
            codigoUnico: cot.numero,
            numero: cot.numero,
            estado: cot.estado,
            fechaPropuesta: cot.fecha,
            nombre: extra.nombre || 'Cotización Legado',
            clienteId: cot.cliente_id,
            validezPropuesta: extra.validezPropuesta || `${cot.vigencia_dias} días`,
            perteneceCatalogo: extra.perteneceCatalogo || false,
            cursoId: extra.cursoId || null,
            descripcion: extra.descripcion || '',
            fechaTentativa: extra.fechaTentativa || '',
            precio: cot.total,
            archivosAdjuntos: extra.archivosAdjuntos || [],
            subtotal: cot.subtotal,
            iva: cot.iva,
            total: cot.total
          };
        }) : state.cotizaciones,
        transacciones: tData && tData.length > 0 ? tData as Transaccion[] : state.transacciones,
        alertas: aData && aData.length > 0 ? aData as Alerta[] : state.alertas,
        categoriasArchivos: catData && catData.length > 0 ? catData.map((cat: any) => ({
          id: cat.id,
          nombre: cat.nombre,
          esPorDefecto: cat.es_por_defecto
        })) : state.categoriasArchivos,
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
    // Preparar objeto para BD
    const dbCliente = {
      rut: cliente.rut,
      razon_social: cliente.razonSocial,
      giro: cliente.giro,
      direccion: cliente.direccion,
      comuna: cliente.comuna,
      region: cliente.region,
      holding: cliente.holding || null,
      observaciones: cliente.observaciones || null
    };

    try {
      // 1. Insertar cliente y obtener el UUID generado
      const { data, error } = await supabase.from('clientes').insert(dbCliente).select().single();
      if (error) throw error;
      
      // 2. Insertar contactos si los hay
      if (cliente.contactos && cliente.contactos.length > 0) {
        const dbContactos = cliente.contactos.map(c => ({
          cliente_id: data.id,
          nombre: c.nombre,
          cargo: c.cargo,
          email: c.email,
          telefono: c.telefono,
          es_decisor: c.esDecisor,
          es_coordinador: c.esCoordinador
        }));
        const { error: errorContactos } = await supabase.from('contactos').insert(dbContactos);
        if (errorContactos) console.error("Error guardando contactos", errorContactos);
      }

      // 3. Crear objeto para el estado frontend
      const newCliente = {
        ...cliente,
        id: data.id,
        fechaRegistro: data.fecha_registro
      } as Cliente;

      set(state => ({ clientes: [...state.clientes, newCliente] }));
      return newCliente;
    } catch (error) {
      toast.error('Error al guardar el cliente'); 
      throw error;
    }
  },

  updateCliente: async (id, data) => {
    const oldCliente = get().clientes.find(c => c.id === id);
    if (!oldCliente) return;
    
    set(state => ({ clientes: state.clientes.map(c => c.id === id ? { ...c, ...data } : c) }));
    
    const dbUpdate: any = {};
    if (data.rut !== undefined) dbUpdate.rut = data.rut;
    if (data.razonSocial !== undefined) dbUpdate.razon_social = data.razonSocial;
    if (data.giro !== undefined) dbUpdate.giro = data.giro;
    if (data.direccion !== undefined) dbUpdate.direccion = data.direccion;
    if (data.comuna !== undefined) dbUpdate.comuna = data.comuna;
    if (data.region !== undefined) dbUpdate.region = data.region;
    if (data.holding !== undefined) dbUpdate.holding = data.holding;
    if (data.observaciones !== undefined) dbUpdate.observaciones = data.observaciones;

    try {
      if (Object.keys(dbUpdate).length > 0) {
        const { error } = await supabase.from('clientes').update(dbUpdate).eq('id', id);
        if (error) throw error;
      }

      if (data.contactos) {
        await supabase.from('contactos').delete().eq('cliente_id', id);
        if (data.contactos.length > 0) {
          const dbContactos = data.contactos.map(c => ({
            cliente_id: id,
            nombre: c.nombre,
            cargo: c.cargo,
            email: c.email,
            telefono: c.telefono,
            es_decisor: c.esDecisor,
            es_coordinador: c.esCoordinador
          }));
          await supabase.from('contactos').insert(dbContactos);
        }
      }
    } catch (error) {
      set(state => ({ clientes: state.clientes.map(c => c.id === id ? oldCliente : c) }));
      toast.error('Error al actualizar el cliente'); 
      throw error;
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
    const codigoUnico = `COT-2025-${String(cotizaciones.length + 1).padStart(3, '0')}`;
    
    // Serializar campos nuevos en observaciones para no requerir alterar la tabla en BD
    const observacionesMeta = JSON.stringify({
      nombre: cotizacion.nombre,
      descripcion: cotizacion.descripcion,
      validezPropuesta: cotizacion.validezPropuesta,
      perteneceCatalogo: cotizacion.perteneceCatalogo,
      cursoId: cotizacion.cursoId,
      fechaTentativa: cotizacion.fechaTentativa,
      archivosAdjuntos: cotizacion.archivosAdjuntos || []
    });

    // Preparar para la BD usando solo columnas originales seguras
    const dbCotizacion = {
      numero: codigoUnico,
      cliente_id: cotizacion.clienteId,
      estado: cotizacion.estado || 'En Preparación',
      fecha: cotizacion.fechaPropuesta || new Date().toISOString().split('T')[0],
      total: cotizacion.precio || 0,
      subtotal: cotizacion.precio || 0,
      iva: 0,
      vigencia_dias: 30, // Default
      observaciones: observacionesMeta
    };

    try {
      const { data, error } = await supabase.from('cotizaciones').insert(dbCotizacion).select().single();
      if (error) throw error;

      const newCotizacion = { 
        ...cotizacion, 
        id: data.id, 
        codigoUnico, 
        numero: codigoUnico 
      } as Cotizacion;

      set(state => ({ cotizaciones: [...state.cotizaciones, newCotizacion] }));
      return newCotizacion;
    } catch (error: any) {
      toast.error(`Error al crear cotización: ${error.message || 'Desconocido'}`);
      throw error;
    }
  },

  updateCotizacion: async (id, data) => {
    const old = get().cotizaciones.find(c => c.id === id);
    if (!old) return;
    set(state => ({ cotizaciones: state.cotizaciones.map(c => c.id === id ? { ...c, ...data } : c) }));
    
    const dbUpdate: any = {};
    if (data.estado !== undefined) dbUpdate.estado = data.estado;
    if (data.fechaPropuesta !== undefined) dbUpdate.fecha = data.fechaPropuesta;
    if (data.precio !== undefined) {
      dbUpdate.total = data.precio;
      dbUpdate.subtotal = data.precio;
    }

    // Actualizar metadata si alguno de los campos virtuales cambia
    const needsMetaUpdate = ['nombre', 'descripcion', 'validezPropuesta', 'perteneceCatalogo', 'cursoId', 'fechaTentativa', 'archivosAdjuntos']
      .some(k => Object.prototype.hasOwnProperty.call(data, k));
      
    if (needsMetaUpdate) {
      const merged = { ...old, ...data };
      dbUpdate.observaciones = JSON.stringify({
        nombre: merged.nombre,
        descripcion: merged.descripcion,
        validezPropuesta: merged.validezPropuesta,
        perteneceCatalogo: merged.perteneceCatalogo,
        cursoId: merged.cursoId,
        fechaTentativa: merged.fechaTentativa,
        archivosAdjuntos: merged.archivosAdjuntos || []
      });
    }

    try {
      if (Object.keys(dbUpdate).length > 0) {
        const { error } = await supabase.from('cotizaciones').update(dbUpdate).eq('id', id);
        if (error) throw error;
      }
    } catch (error: any) {
      set(state => ({ cotizaciones: state.cotizaciones.map(c => c.id === id ? old : c) }));
      toast.error(`Error al actualizar cotización: ${error.message || 'Desconocido'}`);
      throw error;
    }
  },

  aprobarCotizacion: async (cotizacionId) => {
    const { cotizaciones, updateCotizacion } = get();
    const cotizacion = cotizaciones.find(c => c.id === cotizacionId);
    if (!cotizacion) return;

    await updateCotizacion(cotizacionId, { estado: 'Aceptada' });

    const newEjecucion: Ejecucion = {
      id: `e${Date.now()}`,
      codigoUnico: `EJE-2025-${Date.now().toString().slice(-4)}`,
      cursoId: cotizacion.cursoId || '',
      clienteId: cotizacion.clienteId,
      idAcciones: [],
      estado: 'Programado',
      configuracion: { modalidad: 'Presencial', totalHoras: 0, sesiones: [] },
      relatorId: '',
      participantes: [],
      fechaInicio: cotizacion.fechaTentativa || '',
      fechaTermino: '',
      horario: '',
      costosDirectosAsociados: [],
      cotizacionId: cotizacion.id,
      archivosAdjuntos: [],
      financiero: { valor: cotizacion.precio }
    };

    set(state => ({ ejecuciones: [...state.ejecuciones, newEjecucion] }));
    try {
      const { error } = await supabase.from('ejecuciones').insert(newEjecucion);
      if (error) throw error;
    } catch (error: any) {
      set(state => ({ ejecuciones: state.ejecuciones.filter(e => e.id !== newEjecucion.id) }));
      toast.error(`Error al generar ejecución: ${error.message || 'Desconocido'}`);
      throw error;
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
    } catch (error: any) {
      set(state => ({ ejecuciones: state.ejecuciones.filter(e => e.id !== newE.id) }));
      toast.error(`Error al guardar ejecución: ${error.message || 'Desconocido'}`);
      throw error;
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
    const dbParticipante = {
      ejecucion_id: ejecucionId,
      rut: participante.rut,
      nombre: participante.nombre,
      apellido: participante.apellido,
      email: participante.email,
      telefono: participante.telefono,
      nivel_educacional: participante.nivelEducacional
    };
    try {
      const { data, error } = await supabase.from('participantes').insert(dbParticipante).select().single();
      if (error) throw error;
      
      const newPart = { ...participante, id: data.id } as Participante;
      set(state => ({
        ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: [...(e.participantes || []), newPart] } : e)
      }));
    } catch (error) {
      toast.error('Error al agregar participante en BD'); throw error;
    }
  },

  addParticipantesMasivo: async (ejecucionId, participantes) => {
    const dbParticipantes = participantes.map(p => ({
      ejecucion_id: ejecucionId,
      rut: p.rut || '',
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      email: p.email || null,
      telefono: p.telefono || null
    }));

    try {
      const { data, error } = await supabase.from('participantes').insert(dbParticipantes).select();
      if (error) throw error;

      const newParts = data.map((d: any) => ({
        id: d.id,
        rut: d.rut,
        nombre: d.nombre,
        apellido: d.apellido,
        email: d.email,
        telefono: d.telefono,
        asistenciaProgreso: d.asistencia_progreso,
        documentosSAG: { colinesterasa: {}, certificadoMedico: {}, poderSimple: {} }
      })) as Participante[];

      set(state => ({
        ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: [...(e.participantes || []), ...newParts] } : e)
      }));
      toast.success(`${newParts.length} alumnos importados con éxito`);
    } catch (error) {
      toast.error('Error al importar nómina de participantes'); throw error;
    }
  },

  updateParticipante: async (ejecucionId, participanteId, data) => {
    const ejecucion = get().ejecuciones.find(e => e.id === ejecucionId);
    if (!ejecucion) return;
    const oldArray = ejecucion.participantes || [];
    const newArray = oldArray.map(p => p.id === participanteId ? { ...p, ...data } : p);

    set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: newArray } : e) }));
    
    const dbUpdate: any = {};
    if (data.rut !== undefined) dbUpdate.rut = data.rut;
    if (data.nombre !== undefined) dbUpdate.nombre = data.nombre;
    if (data.apellido !== undefined) dbUpdate.apellido = data.apellido;
    if (data.email !== undefined) dbUpdate.email = data.email;
    if (data.telefono !== undefined) dbUpdate.telefono = data.telefono;

    if (Object.keys(dbUpdate).length > 0) {
      try {
        const { error } = await supabase.from('participantes').update(dbUpdate).eq('id', participanteId);
        if (error) throw error;
      } catch (error) {
        set(state => ({ ejecuciones: state.ejecuciones.map(e => e.id === ejecucionId ? { ...e, participantes: oldArray } : e) }));
        toast.error('Error al actualizar participante'); throw error;
      }
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

  addCategoriaArchivo: async (nombre) => {
    const nueva = { id: `cat_${Date.now()}`, nombre, esPorDefecto: false };
    const dbCat = { id: nueva.id, nombre: nueva.nombre, es_por_defecto: nueva.esPorDefecto };
    set(s => ({ categoriasArchivos: [...s.categoriasArchivos, nueva] }));
    try {
      const { error } = await supabase.from('categorias_archivos').insert(dbCat);
      if (error) throw error;
    } catch (e) {
      set(s => ({ categoriasArchivos: s.categoriasArchivos.filter(c => c.id !== nueva.id) }));
      toast.error('Error al guardar categoría en BD');
    }
  },
  deleteCategoriaArchivo: async (id) => {
    const old = get().categoriasArchivos;
    set(s => ({ categoriasArchivos: s.categoriasArchivos.filter(c => c.id !== id) }));
    try {
      const { error } = await supabase.from('categorias_archivos').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      set({ categoriasArchivos: old });
      toast.error('Error al eliminar categoría en BD');
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
      return { 
        ...ejecucion, 
        curso: ejecucion.cursoId ? getCursoById(ejecucion.cursoId) : undefined, 
        cliente: ejecucion.clienteId ? getClienteById(ejecucion.clienteId) : undefined, 
        relator: ejecucion.relatorId ? getRelatorById(ejecucion.relatorId) : undefined 
      };
    }
    return undefined;
  },
  getCotizacionById: (id) => {
    const { cotizaciones, getClienteById, getCursoById } = get();
    const cotizacion = cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      return { 
        ...cotizacion, 
        cliente: getClienteById(cotizacion.clienteId), 
        items: cotizacion.items?.map(item => ({ ...item, curso: getCursoById(item.cursoId) })) 
      };
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

  getTodosLosAlumnos: () => {
    const todos: (Participante & { cursoNombre?: string, ejecucionCodigo?: string, ejecucionId?: string })[] = [];
    get().ejecuciones.forEach(e => {
      if (e.participantes) {
        e.participantes.forEach(p => {
          todos.push({
            ...p,
            ejecucionId: e.id,
            ejecucionCodigo: e.codigoUnico,
            cursoNombre: e.curso?.nombre || 'Curso Desconocido'
          });
        });
      }
    });
    return todos;
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

export type Store = StoreState;
