import { 
  TrendingUp, Users, BookOpen, DollarSign, 
  AlertTriangle, Calendar, CheckCircle, FileText,
  ArrowRight, GraduationCap, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Store } from '@/hooks/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ============================================
// DASHBOARD - ERP OTEC PRO
// ============================================

interface DashboardProps {
  store: Store;
  onNavigate?: (modulo: any) => void;
}

export default function Dashboard({ store, onNavigate }: DashboardProps) {
  const { 
    ejecuciones, cotizaciones, transacciones, alertas, clientes, 
    getEstadoResultados, getFlujoCaja 
  } = store;

  // KPIs
  const cursosActivos = ejecuciones.filter(e => e.estado === 'En Ejecución').length;
  const cursosPlanificados = ejecuciones.filter(e => e.estado === 'Planificado').length;
  
  const ingresosMes = transacciones
    .filter(t => t.tipo === 'Ingreso' && t.tracking.pagado)
    .reduce((sum, t) => sum + t.monto.total, 0);
  
  const egresosMes = transacciones
    .filter(t => t.tipo === 'Egreso' && t.tracking.pagado)
    .reduce((sum, t) => sum + t.monto.total, 0);

  const facturasPendientes = transacciones.filter(t => 
    t.tipo === 'Ingreso' && !t.tracking.pagado
  ).reduce((sum, t) => sum + (t.saldoPendiente || t.monto.total), 0);

  const estadoResultados = getEstadoResultados('Febrero 2025');
  const flujoCaja = getFlujoCaja(14);

  const flujoData = flujoCaja.slice(0, 7).map(f => ({
    fecha: f.fecha.slice(5),
    ingresos: f.ingresosProyectados,
    egresos: f.egresosProyectados
  }));

  // Alertas recientes
  const alertasRecientes = alertas.slice(0, 5);

  // Ejecuciones próximas
  const ejecucionesProximas = ejecuciones
    .filter(e => e.estado === 'Planificado' || e.estado === 'En Ejecución')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cursos Activos</p>
                <p className="text-3xl font-bold text-slate-800">{cursosActivos}</p>
                <p className="text-xs text-slate-400 mt-1">{cursosPlanificados} planificados</p>
              </div>
              <div className="w-12 h-12 bg-[#84CC16]/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#84CC16]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-[#84CC16]">
                  ${ingresosMes.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {egresosMes > 0 ? `${((ingresosMes / egresosMes - 1) * 100).toFixed(1)}% vs egresos` : 'Sin egresos'}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#84CC16]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#84CC16]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Por Cobrar</p>
                <p className="text-3xl font-bold text-amber-600">
                  ${facturasPendientes.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {transacciones.filter(t => t.tipo === 'Ingreso' && !t.tracking.pagado).length} facturas pendientes
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Alertas</p>
                <p className="text-3xl font-bold text-red-600">{alertas.length}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {alertas.filter(a => a.prioridad === 'Alta').length} de alta prioridad
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Estado Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flujo de Caja */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Flujo de Caja Proyectado (Próximos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={flujoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado de Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Estado de Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Ingresos Netos</span>
              <span className="font-semibold text-green-600">
                ${estadoResultados.ingresosTotales.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Gastos Directos</span>
              <span className="font-semibold text-red-500">
                -${estadoResultados.gastosDirectos.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b bg-slate-50 px-2 -mx-2">
              <span className="font-medium">Margen de Contribución</span>
              <span className={`font-bold ${estadoResultados.margenContribucion >= 0 ? 'text-[#84CC16]' : 'text-red-600'}`}>
                ${estadoResultados.margenContribucion.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Gastos Indirectos</span>
              <span className="font-semibold text-red-500">
                -${estadoResultados.gastosIndirectos.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-slate-100 px-2 -mx-2 rounded">
              <span className="font-bold">Utilidad Neta</span>
              <span className={`font-bold text-lg ${estadoResultados.utilidadNeta >= 0 ? 'text-[#84CC16]' : 'text-red-600'}`}>
                ${estadoResultados.utilidadNeta.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="text-center">
              <Badge variant={estadoResultados.utilidadPorcentaje >= 0 ? 'default' : 'destructive'}>
                {estadoResultados.utilidadPorcentaje.toFixed(1)}% margen
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Próximos Cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Operativas
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('ejecuciones')}>
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasRecientes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-slate-500">No hay alertas pendientes</p>
                </div>
              ) : (
                alertasRecientes.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      alerta.prioridad === 'Alta' ? 'bg-red-50 border-red-500' :
                      alerta.prioridad === 'Media' ? 'bg-amber-50 border-amber-500' :
                      'bg-[#1E3A5F]/10 border-[#1E3A5F]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alerta.prioridad === 'Alta' ? 'bg-red-500' :
                        alerta.prioridad === 'Media' ? 'bg-amber-500' :
                        'bg-[#1E3A5F]'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {alerta.tipo}
                          </Badge>
                          <span className="text-xs text-slate-400">{alerta.fecha}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{alerta.mensaje}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Cursos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1E3A5F]" />
              Próximos Cursos
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('ejecuciones')}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ejecucionesProximas.map((ejecucion) => (
                <div key={ejecucion.id} className="p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          ejecucion.estado === 'En Ejecución' ? 'bg-[#84CC16]' :
                          ejecucion.estado === 'Planificado' ? 'bg-[#1E3A5F]' :
                          'bg-slate-500'
                        }`}>
                          {ejecucion.estado}
                        </Badge>
                        {ejecucion.curso?.esSAG && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            SAG
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-slate-800 mt-1">
                        {ejecucion.curso?.nombre || 'Curso sin nombre'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {ejecucion.cliente?.razonSocial}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {ejecucion.fechaInicio || 'Sin fecha'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {ejecucion.participantes.length} participantes
                      </p>
                    </div>
                  </div>
                  {ejecucion.curso?.esSAG && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Documentación SAG:</span>
                        <Progress 
                          value={
                            (ejecucion.participantes.filter(p => p.estadoSAG === 'Completo').length / 
                            ejecucion.participantes.length) * 100
                          } 
                          className="w-24 h-2"
                        />
                        <span className="text-slate-600">
                          {ejecucion.participantes.filter(p => p.estadoSAG === 'Completo').length}/
                          {ejecucion.participantes.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Borradores</span>
                <span className="font-medium">{cotizaciones.filter(c => c.estado === 'Borrador').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Enviadas</span>
                <span className="font-medium">{cotizaciones.filter(c => c.estado === 'Enviada').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Aprobadas</span>
                <span className="font-medium text-green-600">
                  {cotizaciones.filter(c => c.estado === 'Aprobada').length}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              size="sm"
              onClick={() => onNavigate?.('cotizaciones')}
            >
              Ver cotizaciones
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Cursos por Modalidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Presencial</span>
                <span className="font-medium">
                  {ejecuciones.filter(e => e.configuracion.modalidad === 'Presencial').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">E-learning</span>
                <span className="font-medium">
                  {ejecuciones.filter(e => e.configuracion.modalidad.includes('E-learning')).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Auto-instrucción</span>
                <span className="font-medium">
                  {ejecuciones.filter(e => e.configuracion.modalidad === 'Auto-instrucción').length}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              size="sm"
              onClick={() => onNavigate?.('cursos')}
            >
              Ver catálogo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Clientes</span>
                <span className="font-medium">{clientes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Relatores</span>
                <span className="font-medium">{store.relatores.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Cursos en catálogo</span>
                <span className="font-medium">{store.cursos.length}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              size="sm"
              onClick={() => onNavigate?.('clientes')}
            >
              Ver clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
