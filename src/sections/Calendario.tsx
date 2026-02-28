import { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Filter, BookOpen, DollarSign, AlertTriangle,
  Clock, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Store } from '@/hooks/useStore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// MÓDULO CALENDARIO - ERP OTEC PRO
// ============================================

interface CalendarioProps {
  store: Store;
}

interface CapaCalendario {
  id: string;
  label: string;
  color: string;
  activa: boolean;
}

export default function Calendario({ store }: CalendarioProps) {
  const { ejecuciones, transacciones, cursos, clientes, alertas } = store;
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  
  const [capas, setCapas] = useState<CapaCalendario[]>([
    { id: 'academica', label: 'Capa Académica', color: '#3b82f6', activa: true },
    { id: 'financiera', label: 'Capa Financiera', color: '#10b981', activa: true },
    { id: 'alertas', label: 'Alertas SAG/SENCE', color: '#ef4444', activa: true },
  ]);

  const toggleCapa = (id: string) => {
    setCapas(capas.map(c => c.id === id ? { ...c, activa: !c.activa } : c));
  };

  // Navegación
  const mesAnterior = () => setFechaActual(subMonths(fechaActual, 1));
  const mesSiguiente = () => setFechaActual(addMonths(fechaActual, 1));
  const mesActual = () => setFechaActual(new Date());

  // Días del mes
  const diasMes = eachDayOfInterval({
    start: startOfMonth(fechaActual),
    end: endOfMonth(fechaActual)
  });

  // Eventos para un día específico
  const getEventosDia = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    const eventos: any[] = [];

    // Cursos (Capa Académica)
    if (capas.find(c => c.id === 'academica')?.activa) {
      ejecuciones.forEach(e => {
        e.configuracion.sesiones.forEach(sesion => {
          if (sesion.fecha === fechaStr) {
            const curso = cursos.find(c => c.id === e.cursoId);
            const cliente = clientes.find(c => c.id === e.clienteId);
            eventos.push({
              tipo: 'curso',
              titulo: curso?.nombre,
              subtitulo: cliente?.razonSocial,
              hora: `${sesion.horaInicio} - ${sesion.horaFin}`,
              color: e.estado === 'En Ejecución' ? '#10b981' : '#3b82f6',
              icon: BookOpen,
              ejecucion: e
            });
          }
        });
      });
    }

    // Pagos/Cobros (Capa Financiera)
    if (capas.find(c => c.id === 'financiera')?.activa) {
      transacciones
        .filter(t => !t.tracking.pagado && t.tracking.fechaVencimiento === fechaStr)
        .forEach(t => {
          eventos.push({
            tipo: 'financiero',
            titulo: t.tipo === 'Ingreso' ? 'Cobro pendiente' : 'Pago pendiente',
            subtitulo: t.metadatos.descripcion,
            monto: t.monto.total,
            color: t.tipo === 'Ingreso' ? '#22c55e' : '#ef4444',
            icon: DollarSign,
            transaccion: t
          });
        });
    }

    // Alertas (Capa Alertas)
    if (capas.find(c => c.id === 'alertas')?.activa) {
      alertas
        .filter(a => a.fecha === fechaStr)
        .forEach(a => {
          eventos.push({
            tipo: 'alerta',
            titulo: a.tipo,
            subtitulo: a.mensaje,
            color: a.prioridad === 'Alta' ? '#ef4444' : '#f59e0b',
            icon: AlertTriangle,
            alerta: a
          });
        });
    }

    return eventos;
  };

  // Indicadores para un día (mini dots)
  const getIndicadoresDia = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    const indicadores: string[] = [];

    if (capas.find(c => c.id === 'academica')?.activa) {
      const tieneCurso = ejecuciones.some(e => 
        e.configuracion.sesiones.some(s => s.fecha === fechaStr)
      );
      if (tieneCurso) indicadores.push('#3b82f6');
    }

    if (capas.find(c => c.id === 'financiera')?.activa) {
      const tienePago = transacciones.some(t => 
        !t.tracking.pagado && t.tracking.fechaVencimiento === fechaStr
      );
      if (tienePago) indicadores.push('#10b981');
    }

    if (capas.find(c => c.id === 'alertas')?.activa) {
      const tieneAlerta = alertas.some(a => a.fecha === fechaStr);
      if (tieneAlerta) indicadores.push('#ef4444');
    }

    return indicadores;
  };

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario Maestro</h2>
          <p className="text-slate-500">Vista centralizada de operaciones y finanzas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={mesAnterior}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={mesActual}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={mesSiguiente}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filtros de Capas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Capas:
            </span>
            {capas.map(capa => (
              <label key={capa.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={capa.activa} 
                  onCheckedChange={() => toggleCapa(capa.id)}
                />
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: capa.color }}
                />
                <span className="text-sm">{capa.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-center text-xl capitalize">
              {format(fechaActual, 'MMMM yyyy', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {diasSemana.map(dia => (
                <div key={dia} className="text-center text-sm font-medium text-slate-500 py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getDay(startOfMonth(fechaActual)) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {diasMes.map(dia => {
                const indicadores = getIndicadoresDia(dia);
                const esHoy = isToday(dia);
                const esMesActual = isSameMonth(dia, fechaActual);
                
                return (
                  <button
                    key={dia.toISOString()}
                    onClick={() => setDiaSeleccionado(dia)}
                    className={`
                      aspect-square p-2 border rounded-lg text-left transition-all
                      ${!esMesActual && 'opacity-30'}
                      ${esHoy && 'bg-blue-50 border-blue-300'}
                      ${diaSeleccionado && format(diaSeleccionado, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd') && 'ring-2 ring-blue-500'}
                      hover:bg-slate-50
                    `}
                  >
                    <span className={`text-sm font-medium ${esHoy ? 'text-blue-600' : 'text-slate-700'}`}>
                      {format(dia, 'd')}
                    </span>
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {indicadores.slice(0, 3).map((color, i) => (
                        <span 
                          key={i} 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel de Eventos del Día */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {diaSeleccionado 
                ? format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un día'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diaSeleccionado ? (
              <div className="space-y-3">
                {getEventosDia(diaSeleccionado).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay eventos para este día</p>
                  </div>
                ) : (
                  getEventosDia(diaSeleccionado).map((evento, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg border-l-4"
                      style={{ borderLeftColor: evento.color, backgroundColor: `${evento.color}10` }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: evento.color }}
                        >
                          <evento.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{evento.titulo}</p>
                          <p className="text-sm text-slate-500">{evento.subtitulo}</p>
                          {evento.hora && (
                            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {evento.hora}
                            </p>
                          )}
                          {evento.monto && (
                            <p className="text-sm font-medium mt-1" style={{ color: evento.color }}>
                              ${evento.monto.toLocaleString('es-CL')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Haz clic en un día del calendario para ver sus eventos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Mes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Cursos este mes</p>
                <p className="text-xl font-bold">
                  {ejecuciones.filter(e => 
                    isSameMonth(new Date(e.fechaInicio || ''), fechaActual)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Cobros pendientes</p>
                <p className="text-xl font-bold">
                  {transacciones.filter(t => 
                    t.tipo === 'Ingreso' && 
                    !t.tracking.pagado &&
                    isSameMonth(new Date(t.tracking.fechaVencimiento || ''), fechaActual)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Alertas este mes</p>
                <p className="text-xl font-bold">
                  {alertas.filter(a => 
                    isSameMonth(new Date(a.fecha), fechaActual)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Participantes</p>
                <p className="text-xl font-bold">
                  {ejecuciones
                    .filter(e => isSameMonth(new Date(e.fechaInicio || ''), fechaActual))
                    .reduce((sum, e) => sum + e.participantes.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
