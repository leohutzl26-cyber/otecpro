import { useState } from 'react';
import { 
  Search, Calendar, Users, X,
  Edit, MoreHorizontal, FileText, CheckCircle, AlertTriangle,
  Clock, Upload, Download, GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { Store } from '@/hooks/useStore';
import type { Ejecucion, Participante, EstadoEjecucion } from '@/types';

// ============================================
// MÓDULO EJECUCIONES - ERP OTEC PRO
// ============================================

interface EjecucionesProps {
  store: Store;
}

export default function Ejecuciones({ store }: EjecucionesProps) {
  const { 
    ejecuciones, cursos, clientes, relatores, updateEjecucion, 
    getMargenCurso 
  } = store;
  
  const [busqueda, setBusqueda] = useState('');
  const [ejecucionSeleccionada, setEjecucionSeleccionada] = useState<Ejecucion | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const ejecucionesFiltradas = ejecuciones.filter(e => {
    const curso = cursos.find(c => c.id === e.cursoId);
    const cliente = clientes.find(c => c.id === e.clienteId);
    return (
      curso?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente?.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.estado.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const verDetalle = (ejecucion: Ejecucion) => {
    setEjecucionSeleccionada(ejecucion);
    setIsDetailOpen(true);
    setActiveTab('general');
  };

  const getEstadoBadge = (estado: EstadoEjecucion) => {
    const config = {
      'Planificado': { class: 'bg-blue-500', icon: Calendar },
      'En Ejecución': { class: 'bg-green-500', icon: Clock },
      'Completado': { class: 'bg-slate-500', icon: CheckCircle },
      'Cancelado': { class: 'bg-red-500', icon: X }
    };
    const { class: className, icon: Icon } = config[estado];
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {estado}
      </Badge>
    );
  };

  const calcularProgresoSAG = (participantes: Participante[]) => {
    if (participantes.length === 0) return 0;
    const completos = participantes.filter(p => p.estadoSAG === 'Completo').length;
    return Math.round((completos / participantes.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ejecuciones de Cursos</h2>
          <p className="text-slate-500">Gestiona cursos en ejecución y operación diaria</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          className="pl-10"
          placeholder="Buscar por curso, cliente o estado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Ejecuciones */}
      <div className="space-y-4">
        {ejecucionesFiltradas.map((ejecucion) => {
          const curso = cursos.find(c => c.id === ejecucion.cursoId);
          const cliente = clientes.find(c => c.id === ejecucion.clienteId);
          const relator = relatores.find(r => r.id === ejecucion.relatorId);
          const progresoSAG = calcularProgresoSAG(ejecucion.participantes);

          return (
            <Card key={ejecucion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getEstadoBadge(ejecucion.estado)}
                      {curso?.esSAG && (
                        <Badge className="bg-amber-500">SAG</Badge>
                      )}
                      {curso?.codigoSence && (
                        <Badge variant="outline">SENCE {curso.codigoSence}</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mt-2">{curso?.nombre}</h3>
                    <p className="text-sm text-slate-500">{cliente?.razonSocial}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ejecucion.fechaInicio || 'Sin fecha'} - {ejecucion.fechaTermino || 'Sin fecha'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {ejecucion.participantes.length} participantes
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {relator?.nombre || 'Sin relator'}
                      </span>
                    </div>

                    {/* Progreso SAG */}
                    {curso?.esSAG && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className={`w-4 h-4 ${progresoSAG < 100 ? 'text-amber-500' : 'text-green-500'}`} />
                          <span className="text-slate-600">Documentación SAG:</span>
                          <Progress value={progresoSAG} className="w-32 h-2" />
                          <span className={`text-sm font-medium ${progresoSAG < 100 ? 'text-amber-600' : 'text-green-600'}`}>
                            {progresoSAG}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => verDetalle(ejecucion)}>
                      <FileText className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => verDetalle(ejecucion)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateEjecucion(ejecucion.id, { estado: 'En Ejecución' })}>
                          <Clock className="w-4 h-4 mr-2" />
                          Iniciar Curso
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateEjecucion(ejecucion.id, { estado: 'Completado' })}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo de Detalle Completo */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {ejecucionSeleccionada && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">
                      {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.nombre}
                    </DialogTitle>
                    <p className="text-slate-500 mt-1">
                      {clientes.find(c => c.id === ejecucionSeleccionada.clienteId)?.razonSocial}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEstadoBadge(ejecucionSeleccionada.estado)}
                    {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                      <Badge className="bg-amber-500">SAG</Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="participantes">
                    Participantes ({ejecucionSeleccionada.participantes.length})
                  </TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
                </TabsList>

                {/* Tab General */}
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-3">Información del Curso</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Modalidad:</span>
                            <span>{ejecucionSeleccionada.configuracion.modalidad}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Horas:</span>
                            <span>{ejecucionSeleccionada.configuracion.totalHoras} hrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Horario:</span>
                            <span>{ejecucionSeleccionada.horario || 'No definido'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-3">Relator</h4>
                        <p className="font-medium">
                          {relatores.find(r => r.id === ejecucionSeleccionada.relatorId)?.nombre || 'No asignado'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {relatores.find(r => r.id === ejecucionSeleccionada.relatorId)?.especialidad}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-3">Fechas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Inicio:</span>
                            <span>{ejecucionSeleccionada.fechaInicio || 'No definido'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Término:</span>
                            <span>{ejecucionSeleccionada.fechaTermino || 'No definido'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-3">Ubicación</h4>
                        <p className="text-sm">
                          {ejecucionSeleccionada.configuracion.lugar || 
                           ejecucionSeleccionada.configuracion.urlPlataforma || 
                           'No definido'}
                        </p>
                      </div>

                      {ejecucionSeleccionada.idAcciones.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-3">ID Acción SENCE</h4>
                          <div className="flex flex-wrap gap-2">
                            {ejecucionSeleccionada.idAcciones.map((id, idx) => (
                              <Badge key={idx} variant="outline">{id}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sesiones */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-700 mb-3">Sesiones Programadas</h4>
                    <div className="space-y-2">
                      {ejecucionSeleccionada.configuracion.sesiones.map((sesion, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="font-medium">Sesión {idx + 1}</span>
                          <span className="text-sm text-slate-600">
                            {sesion.fecha} | {sesion.horaInicio} - {sesion.horaFin}
                          </span>
                        </div>
                      ))}
                      {ejecucionSeleccionada.configuracion.sesiones.length === 0 && (
                        <p className="text-slate-500 text-sm">No hay sesiones programadas</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Participantes */}
                <TabsContent value="participantes">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-700">
                        Total: {ejecucionSeleccionada.participantes.length} participantes
                      </h4>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Cargar Excel
                      </Button>
                    </div>

                    <div className="border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3">RUT</th>
                            <th className="text-left p-3">Nombre</th>
                            <th className="text-center p-3">Asistencia</th>
                            {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                              <>
                                <th className="text-center p-3">Colinesterasa</th>
                                <th className="text-center p-3">Cert. Médico</th>
                                <th className="text-center p-3">Poder</th>
                              </>
                            )}
                            <th className="text-center p-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {ejecucionSeleccionada.participantes.map((participante) => (
                            <tr key={participante.id} className="hover:bg-slate-50">
                              <td className="p-3">{participante.rut}</td>
                              <td className="p-3">
                                {participante.nombre} {participante.apellido}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Progress value={participante.asistenciaProgreso} className="w-16 h-2" />
                                  <span className="text-xs">{participante.asistenciaProgreso}%</span>
                                </div>
                              </td>
                              {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                                <>
                                  <td className="p-3 text-center">
                                    <StatusBadge 
                                      status={participante.documentosSAG.colinesterasa.valido ? 'valido' : 
                                             participante.documentosSAG.colinesterasa.url ? 'pendiente' : 'faltante'}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <StatusBadge 
                                      status={participante.documentosSAG.certificadoMedico.valido ? 'valido' : 
                                             participante.documentosSAG.certificadoMedico.url ? 'pendiente' : 'faltante'}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <StatusBadge 
                                      status={participante.documentosSAG.poderSimple.valido ? 'valido' : 
                                             participante.documentosSAG.poderSimple.url ? 'pendiente' : 'faltante'}
                                    />
                                  </td>
                                </>
                              )}
                              <td className="p-3 text-center">
                                <Badge className={
                                  participante.estadoSAG === 'Completo' ? 'bg-green-500' :
                                  participante.estadoSAG === 'Incompleto' ? 'bg-amber-500' :
                                  'bg-slate-500'
                                }>
                                  {participante.estadoSAG}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Documentos */}
                <TabsContent value="documentos">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Libro de Clases</h4>
                            <p className="text-sm text-slate-500">Lista de asistencia con firmas</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Acta de Materiales</h4>
                            <p className="text-sm text-slate-500">Entrega de manuales y materiales</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Diplomas</h4>
                            <p className="text-sm text-slate-500">Generación masiva de diplomas</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Encuesta Satisfacción</h4>
                            <p className="text-sm text-slate-500">Formato SENCE estándar</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab Finanzas */}
                <TabsContent value="finanzas">
                  {(() => {
                    const margen = getMargenCurso(ejecucionSeleccionada.id);
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Ingresos Netos</p>
                            <p className="text-2xl font-bold text-green-700">
                              ${margen.ingresosNetos.toLocaleString('es-CL')}
                            </p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600">Gastos Directos</p>
                            <p className="text-2xl font-bold text-red-700">
                              ${margen.gastosDirectos.toLocaleString('es-CL')}
                            </p>
                          </div>
                          <div className={`p-4 rounded-lg ${margen.margenBruto >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
                            <p className={`text-sm ${margen.margenBruto >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                              Margen Bruto
                            </p>
                            <p className={`text-2xl font-bold ${margen.margenBruto >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                              ${margen.margenBruto.toLocaleString('es-CL')}
                            </p>
                            <p className={`text-sm ${margen.margenBruto >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                              {margen.margenPorcentaje.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="border rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left p-3">Documento</th>
                                <th className="text-left p-3">Categoría</th>
                                <th className="text-right p-3">Monto</th>
                                <th className="text-center p-3">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {store.transacciones
                                .filter(t => t.idEjecucion === ejecucionSeleccionada.id)
                                .map((t) => (
                                  <tr key={t.id}>
                                    <td className="p-3">{t.metadatos.nroDocumento}</td>
                                    <td className="p-3">{t.categoria}</td>
                                    <td className="p-3 text-right">
                                      <span className={t.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}>
                                        {t.tipo === 'Ingreso' ? '+' : '-'}${t.monto.total.toLocaleString('es-CL')}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge className={t.tracking.pagado ? 'bg-green-500' : 'bg-amber-500'}>
                                        {t.tracking.pagado ? 'Pagado' : 'Pendiente'}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente auxiliar para estados de documentos
function StatusBadge({ status }: { status: 'valido' | 'pendiente' | 'faltante' }) {
  const config = {
    valido: { class: 'bg-green-500', label: 'Válido' },
    pendiente: { class: 'bg-amber-500', label: 'Pendiente' },
    faltante: { class: 'bg-slate-300', label: 'Faltante' }
  };
  const { class: className, label } = config[status];
  return <Badge className={`${className} text-xs`}>{label}</Badge>;
}
