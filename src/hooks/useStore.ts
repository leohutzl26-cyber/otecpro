import { useState, useCallback } from 'react';
import type { 
  Cliente, Curso, Relator, Ejecucion, Cotizacion, Transaccion, 
  Alerta, Participante, ArchivoAdjunto 
} from '@/types';
import { 
  clientesMock, cursosMock, relatoresMock, ejecucionesMock, 
  cotizacionesMock, transaccionesMock, alertasMock 
} from '@/data/mockData';

// ============================================
// STORE GLOBAL - ERP OTEC PRO
// ============================================

export function useStore() {
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [cursos, setCursos] = useState<Curso[]>(cursosMock);
  const [relatores, setRelatores] = useState<Relator[]>(relatoresMock);
  const [ejecuciones, setEjecuciones] = useState<Ejecucion[]>(ejecucionesMock);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(cotizacionesMock);
  const [transacciones, setTransacciones] = useState<Transaccion[]>(transaccionesMock);
  const [alertas, setAlertas] = useState<Alerta[]>(alertasMock);

  // --- CLIENTES ---
  const addCliente = useCallback((cliente: Omit<Cliente, 'id'>) => {
    const newCliente = { ...cliente, id: `c${Date.now()}` };
    setClientes(prev => [...prev, newCliente]);
    return newCliente;
  }, []);

  const updateCliente = useCallback((id: string, data: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCliente = useCallback((id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- CURSOS ---
  const addCurso = useCallback((curso: Omit<Curso, 'id'>) => {
    const newCurso = { ...curso, id: `cur${Date.now()}` };
    setCursos(prev => [...prev, newCurso]);
    return newCurso;
  }, []);

  const updateCurso = useCallback((id: string, data: Partial<Curso>) => {
    setCursos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCurso = useCallback((id: string) => {
    setCursos(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- ARCHIVOS ADJUNTOS ---
  const addArchivoAdjunto = useCallback((cursoId: string, archivo: Omit<ArchivoAdjunto, 'id' | 'fechaSubida'>) => {
    const newArchivo: ArchivoAdjunto = {
      ...archivo,
      id: `arch${Date.now()}`,
      fechaSubida: new Date().toISOString().split('T')[0]
    };
    setCursos(prev => prev.map(c => {
      if (c.id === cursoId) {
        return { ...c, archivosAdjuntos: [...c.archivosAdjuntos, newArchivo] };
      }
      return c;
    }));
    return newArchivo;
  }, []);

  const deleteArchivoAdjunto = useCallback((cursoId: string, archivoId: string) => {
    setCursos(prev => prev.map(c => {
      if (c.id === cursoId) {
        return { ...c, archivosAdjuntos: c.archivosAdjuntos.filter(a => a.id !== archivoId) };
      }
      return c;
    }));
  }, []);

  // --- RELATORES ---
  const addRelator = useCallback((relator: Omit<Relator, 'id'>) => {
    const newRelator = { ...relator, id: `r${Date.now()}` };
    setRelatores(prev => [...prev, newRelator]);
    return newRelator;
  }, []);

  const updateRelator = useCallback((id: string, data: Partial<Relator>) => {
    setRelatores(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const deleteRelator = useCallback((id: string) => {
    setRelatores(prev => prev.filter(r => r.id !== id));
  }, []);

  // --- COTIZACIONES ---
  const addCotizacion = useCallback((cotizacion: Omit<Cotizacion, 'id' | 'numero'>) => {
    const numero = `COT-2025-${String(cotizaciones.length + 1).padStart(3, '0')}`;
    const newCotizacion = { ...cotizacion, id: `cot${Date.now()}`, numero };
    setCotizaciones(prev => [...prev, newCotizacion]);
    return newCotizacion;
  }, [cotizaciones.length]);

  const updateCotizacion = useCallback((id: string, data: Partial<Cotizacion>) => {
    setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const aprobarCotizacion = useCallback((cotizacionId: string) => {
    const cotizacion = cotizaciones.find(c => c.id === cotizacionId);
    if (!cotizacion) return;

    // Actualizar cotización
    updateCotizacion(cotizacionId, { 
      estado: 'Aprobada', 
      fechaAprobacion: new Date().toISOString().split('T')[0] 
    });

    // Crear ejecución automáticamente
    const newEjecucion: Ejecucion = {
      id: `e${Date.now()}`,
      cursoId: cotizacion.items[0]?.cursoId || '',
      clienteId: cotizacion.clienteId,
      idAcciones: [],
      estado: 'Planificado',
      configuracion: {
        modalidad: 'Presencial',
        totalHoras: 0,
        sesiones: []
      },
      relatorId: '',
      participantes: [],
      fechaInicio: '',
      fechaTermino: '',
      horario: '',
      costosDirectosAsociados: [],
      cotizacionId: cotizacion.id
    };

    setEjecuciones(prev => [...prev, newEjecucion]);
    updateCotizacion(cotizacionId, { ejecucionId: newEjecucion.id });
    
    return newEjecucion;
  }, [cotizaciones, updateCotizacion]);

  // --- EJECUCIONES ---
  const addEjecucion = useCallback((ejecucion: Omit<Ejecucion, 'id'>) => {
    const newEjecucion = { ...ejecucion, id: `e${Date.now()}` };
    setEjecuciones(prev => [...prev, newEjecucion]);
    return newEjecucion;
  }, []);

  const updateEjecucion = useCallback((id: string, data: Partial<Ejecucion>) => {
    setEjecuciones(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const addParticipante = useCallback((ejecucionId: string, participante: Omit<Participante, 'id'>) => {
    setEjecuciones(prev => prev.map(e => {
      if (e.id === ejecucionId) {
        const newParticipante = { ...participante, id: `part-${Date.now()}` };
        return { ...e, participantes: [...e.participantes, newParticipante] };
      }
      return e;
    }));
  }, []);

  const updateParticipante = useCallback((ejecucionId: string, participanteId: string, data: Partial<Participante>) => {
    setEjecuciones(prev => prev.map(e => {
      if (e.id === ejecucionId) {
        return {
          ...e,
          participantes: e.participantes.map(p => p.id === participanteId ? { ...p, ...data } : p)
        };
      }
      return e;
    }));
  }, []);

  const updateDocumentoSAG = useCallback((
    ejecucionId: string, 
    participanteId: string, 
    tipoDocumento: 'colinesterasa' | 'certificadoMedico' | 'poderSimple',
    data: { url?: string; fechaExamen?: string; valido: boolean }
  ) => {
    setEjecuciones(prev => prev.map(e => {
      if (e.id === ejecucionId) {
        return {
          ...e,
          participantes: e.participantes.map(p => {
            if (p.id === participanteId) {
              return {
                ...p,
                documentosSAG: {
                  ...p.documentosSAG,
                  [tipoDocumento]: data
                }
              };
            }
            return p;
          })
        };
      }
      return e;
    }));
  }, []);

  // --- TRANSACCIONES ---
  const addTransaccion = useCallback((transaccion: Omit<Transaccion, 'id'>) => {
    const newTransaccion = { 
      ...transaccion, 
      id: `t${Date.now()}`,
      saldoPendiente: transaccion.tipo === 'NotaCredito' ? 0 : transaccion.monto.total
    };
    setTransacciones(prev => [...prev, newTransaccion]);
    return newTransaccion;
  }, []);

  const updateTransaccion = useCallback((id: string, data: Partial<Transaccion>) => {
    setTransacciones(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const registrarPago = useCallback((transaccionId: string, fechaPago: string) => {
    setTransacciones(prev => prev.map(t => {
      if (t.id === transaccionId) {
        return {
          ...t,
          tracking: {
            ...t.tracking,
            fechaPagoReal: fechaPago,
            pagado: true
          },
          saldoPendiente: 0
        };
      }
      return t;
    }));
  }, []);

  const emitirNotaCredito = useCallback((facturaId: string, montoNC: number, motivo: string) => {
    const factura = transacciones.find(t => t.id === facturaId && t.tipo === 'Ingreso');
    if (!factura) return null;

    const notaCredito: Transaccion = {
      id: `nc${Date.now()}`,
      tipo: 'NotaCredito',
      categoria: 'Honorarios',
      esDirecto: factura.esDirecto,
      idEjecucion: factura.idEjecucion,
      clienteId: factura.clienteId,
      monto: { neto: montoNC / 1.19, iva: montoNC - (montoNC / 1.19), total: montoNC },
      metadatos: { 
        nroDocumento: `NC-${Date.now()}`, 
        descripcion: `Nota de crédito por ${motivo}`,
        facturaRef: facturaId 
      },
      tracking: { 
        fechaEmision: new Date().toISOString().split('T')[0], 
        fechaVencimiento: new Date().toISOString().split('T')[0], 
        pagado: true 
      },
      saldoPendiente: 0
    };

    setTransacciones(prev => [...prev, notaCredito]);

    // Actualizar saldo de factura
    const nuevoSaldo = (factura.saldoPendiente || factura.monto.total) - montoNC;
    setTransacciones(prev => prev.map(t => {
      if (t.id === facturaId) {
        return {
          ...t,
          saldoPendiente: Math.max(0, nuevoSaldo),
          tracking: {
            ...t.tracking,
            pagado: nuevoSaldo <= 0
          }
        };
      }
      return t;
    }));

    return notaCredito;
  }, [transacciones]);

  // --- ALERTAS ---
  const dismissAlerta = useCallback((id: string) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
  }, []);

  const addAlerta = useCallback((alerta: Omit<Alerta, 'id'>) => {
    const newAlerta = { ...alerta, id: `a${Date.now()}` };
    setAlertas(prev => [...prev, newAlerta]);
    return newAlerta;
  }, []);

  // --- GETTERS CON RELACIONES ---
  const getClienteById = useCallback((id: string) => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  const getCursoById = useCallback((id: string) => {
    return cursos.find(c => c.id === id);
  }, [cursos]);

  const getRelatorById = useCallback((id: string) => {
    return relatores.find(r => r.id === id);
  }, [relatores]);

  const getEjecucionById = useCallback((id: string) => {
    const ejecucion = ejecuciones.find(e => e.id === id);
    if (ejecucion) {
      return {
        ...ejecucion,
        curso: getCursoById(ejecucion.cursoId),
        cliente: getClienteById(ejecucion.clienteId),
        relator: getRelatorById(ejecucion.relatorId)
      };
    }
    return undefined;
  }, [ejecuciones, getCursoById, getClienteById, getRelatorById]);

  const getCotizacionById = useCallback((id: string) => {
    const cotizacion = cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      return {
        ...cotizacion,
        cliente: getClienteById(cotizacion.clienteId),
        items: cotizacion.items.map(item => ({
          ...item,
          curso: getCursoById(item.cursoId)
        }))
      };
    }
    return undefined;
  }, [cotizaciones, getClienteById, getCursoById]);

  // --- CÁLCULOS FINANCIEROS ---
  const getMargenCurso = useCallback((ejecucionId: string) => {
    const ingresos = transacciones
      .filter(t => t.idEjecucion === ejecucionId && t.tipo === 'Ingreso')
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const notasCredito = transacciones
      .filter(t => t.idEjecucion === ejecucionId && t.tipo === 'NotaCredito')
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const gastosDirectos = transacciones
      .filter(t => t.idEjecucion === ejecucionId && t.tipo === 'Egreso' && t.esDirecto)
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const ingresosNetos = ingresos - notasCredito;
    const margenBruto = ingresosNetos - gastosDirectos;
    const margenPorcentaje = ingresosNetos > 0 ? (margenBruto / ingresosNetos) * 100 : 0;
    
    return { ingresosNetos, gastosDirectos, margenBruto, margenPorcentaje };
  }, [transacciones]);

  const getEstadoResultados = useCallback((periodo: string) => {
    const ingresosTotales = transacciones
      .filter(t => t.tipo === 'Ingreso')
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const notasCredito = transacciones
      .filter(t => t.tipo === 'NotaCredito')
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const ingresosNetos = ingresosTotales - notasCredito;
    
    const gastosDirectos = transacciones
      .filter(t => t.tipo === 'Egreso' && t.esDirecto)
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const margenContribucion = ingresosNetos - gastosDirectos;
    
    const gastosIndirectos = transacciones
      .filter(t => t.tipo === 'Egreso' && !t.esDirecto)
      .reduce((sum, t) => sum + t.monto.neto, 0);
    
    const utilidadNeta = margenContribucion - gastosIndirectos;
    const utilidadPorcentaje = ingresosNetos > 0 ? (utilidadNeta / ingresosNetos) * 100 : 0;
    
    return {
      periodo,
      ingresosTotales: ingresosNetos,
      gastosDirectos,
      margenContribucion,
      gastosIndirectos,
      utilidadNeta,
      utilidadPorcentaje
    };
  }, [transacciones]);

  const getFlujoCaja = useCallback((dias: number = 30) => {
    const hoy = new Date();
    const flujo = [];
    
    for (let i = 0; i < dias; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const ingresosDia = transacciones
        .filter(t => t.tipo === 'Ingreso' && t.tracking.fechaVencimiento === fechaStr && !t.tracking.pagado)
        .reduce((sum, t) => sum + t.monto.total, 0);
      
      const egresosDia = transacciones
        .filter(t => t.tipo === 'Egreso' && t.tracking.fechaVencimiento === fechaStr && !t.tracking.pagado)
        .reduce((sum, t) => sum + t.monto.total, 0);
      
      flujo.push({
        fecha: fechaStr,
        ingresosProyectados: ingresosDia,
        ingresosReales: 0,
        egresosProyectados: egresosDia,
        egresosReales: 0,
        saldoProyectado: ingresosDia - egresosDia,
        saldoReal: 0
      });
    }
    
    return flujo;
  }, [transacciones]);

  return {
    // Datos
    clientes,
    cursos,
    relatores,
    ejecuciones,
    cotizaciones,
    transacciones,
    alertas,
    
    // Acciones Clientes
    addCliente,
    updateCliente,
    deleteCliente,
    
    // Acciones Cursos
    addCurso,
    updateCurso,
    deleteCurso,
    
    // Acciones Archivos Adjuntos
    addArchivoAdjunto,
    deleteArchivoAdjunto,
    
    // Acciones Relatores
    addRelator,
    updateRelator,
    deleteRelator,
    
    // Acciones Cotizaciones
    addCotizacion,
    updateCotizacion,
    aprobarCotizacion,
    
    // Acciones Ejecuciones
    addEjecucion,
    updateEjecucion,
    addParticipante,
    updateParticipante,
    updateDocumentoSAG,
    
    // Acciones Transacciones
    addTransaccion,
    updateTransaccion,
    registrarPago,
    emitirNotaCredito,
    
    // Acciones Alertas
    dismissAlerta,
    addAlerta,
    
    // Getters
    getClienteById,
    getCursoById,
    getRelatorById,
    getEjecucionById,
    getCotizacionById,
    
    // Cálculos
    getMargenCurso,
    getEstadoResultados,
    getFlujoCaja
  };
}

export type Store = ReturnType<typeof useStore>;
