import { useState } from 'react';
import { 
  Search, Calendar, Users, X,
  Edit, MoreHorizontal, FileText, CheckCircle, AlertTriangle,
  Clock, Upload, Download, GraduationCap, DollarSign, Paperclip, Plus, Sparkles, Loader2, Save
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
import { toast } from 'sonner';
import type { Store } from '@/hooks/useStore';
import type { Ejecucion, Participante, EstadoEjecucion } from '@/types';
import { extractParticipantesFromFile, type ExtractedParticipante } from '@/lib/gemini';

// ============================================
// MÓDULO EJECUCIONES - ERP OTEC PRO
// ============================================

interface EjecucionesProps {
  store: Store;
}

export default function Ejecuciones({ store }: EjecucionesProps) {
  const { 
    ejecuciones, cursos, clientes, relatores, cotizaciones, updateEjecucion
  } = store;
  
  const [busqueda, setBusqueda] = useState('');
  const [ejecucionSeleccionada, setEjecucionSeleccionada] = useState<Ejecucion | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nuevaE, setNuevaE] = useState<Partial<Ejecucion>>({
    estado: 'Programado',
    participantes: [],
    archivosAdjuntos: [],
    financiero: { valor: 0 }
  });

  // IA Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedStudents, setExtractedStudents] = useState<ExtractedParticipante[]>([]);
  const [isSavingStudents, setIsSavingStudents] = useState(false);

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error('Por favor selecciona un archivo (PDF o Imagen).');
      return;
    }
    try {
      setIsExtracting(true);
      const data = await extractParticipantesFromFile(importFile);
      setExtractedStudents(data);
      if (data.length === 0) {
        toast.warning('La IA no encontró alumnos en este documento.');
      } else {
        toast.success(`Se encontraron ${data.length} alumnos. Por favor revisa la información.`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al analizar el documento');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveImportedStudents = async () => {
    if (!ejecucionSeleccionada || extractedStudents.length === 0) return;
    try {
      setIsSavingStudents(true);
      await store.addParticipantesMasivo(ejecucionSeleccionada.id, extractedStudents);
      setIsImportModalOpen(false);
      setExtractedStudents([]);
      setImportFile(null);
      
      // Update UI with newly fetched ejecucion (so it shows in the modal)
      const updatedE = store.getEjecucionById(ejecucionSeleccionada.id);
      if (updatedE) setEjecucionSeleccionada(updatedE);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsSavingStudents(false);
    }
  };

  const handleCrear = async () => {
    try {
      // Mock de participantes según la cantidad
      const cantidad = parseInt((document.getElementById('cantPart') as HTMLInputElement)?.value || '0');
      const participantesArr = Array.from({ length: cantidad }).map((_, i) => ({
        id: `p${Date.now()}-${i}`,
        rut: '',
        nombre: `Alumno ${i+1}`,
        apellido: '',
        asistenciaProgreso: 0,
        estadoSAG: 'No Aplica',
        documentosSAG: {
          colinesterasa: { valido: false },
          certificadoMedico: { valido: false },
          poderSimple: { valido: false }
        }
      }));

      await store.addEjecucion({
        ...nuevaE,
        participantes: participantesArr,
        configuracion: { modalidad: 'Presencial', totalHoras: 0, sesiones: [] }
      } as Ejecucion);
      setIsCreateOpen(false);
    } catch (e) {
      console.error(e);
    }
  };


  const ejecucionesFiltradas = ejecuciones.filter(e => {
    const curso = cursos.find(c => c.id === e.cursoId);
    const cliente = clientes.find(c => c.id === e.clienteId);
    const cotizacion = cotizaciones.find(c => c.id === e.cotizacionId);
    const nombreServicio = curso?.nombre || cotizacion?.nombre || 'Servicio Personalizado';
    return (
      e.codigoUnico?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreServicio.toLowerCase().includes(busqueda.toLowerCase()) ||
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
      'Programado': { class: 'bg-blue-500', icon: Calendar },
      'En Curso': { class: 'bg-green-500', icon: Clock },
      'Terminado': { class: 'bg-slate-500', icon: CheckCircle },
      'Anulado': { class: 'bg-red-500', icon: X },
      'Facturado': { class: 'bg-amber-500', icon: FileText },
      'Pagado': { class: 'bg-emerald-600', icon: DollarSign }
    };
    const { class: className, icon: Icon } = config[estado] || { class: 'bg-gray-500', icon: FileText };
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {estado}
      </Badge>
    );
  };

  const calcularProgresoSAG = (participantes: Participante[]) => {
    if (!participantes || participantes.length === 0) return 0;
    const completos = participantes.filter(p => p.estadoSAG === 'Completo').length;
    return Math.round((completos / participantes.length) * 100);
  };

  const estadosKanban: EstadoEjecucion[] = ['Programado', 'En Curso', 'Terminado', 'Anulado', 'Facturado', 'Pagado'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ejecuciones de Cursos</h2>
          <p className="text-slate-500">Gestiona cursos, logística y participantes</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ejecución
        </Button>

      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              className="pl-10"
              placeholder="Buscar por código, curso, cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <TabsList>
            <TabsTrigger value="kanban">Tablero Kanban</TabsTrigger>
            <TabsTrigger value="lista">Vista Lista</TabsTrigger>
          </TabsList>
        </div>

        {/* VISTA KANBAN */}
        <TabsContent value="kanban" className="mt-0">
          <div className="flex overflow-x-auto gap-4 pb-4 items-start snap-x">
            {estadosKanban.map(estado => (
              <div 
                key={estado} 
                className="bg-slate-100 rounded-lg p-3 min-w-[300px] min-h-[500px] snap-center shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("ejecucionId");
                  if (id) updateEjecucion(id, { estado });
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    {getEstadoBadge(estado)}
                  </h3>
                  <Badge variant="secondary">
                    {ejecucionesFiltradas.filter(e => e.estado === estado).length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {ejecucionesFiltradas.filter(e => e.estado === estado).map(ejecucion => {
                    const curso = cursos.find(c => c.id === ejecucion.cursoId);
                    const cliente = clientes.find(c => c.id === ejecucion.clienteId);
                    const cotizacion = cotizaciones.find(c => c.id === ejecucion.cotizacionId);
                    const nombreServicio = curso?.nombre || cotizacion?.nombre || 'Servicio Personalizado';

                    return (
                      <Card 
                        key={ejecucion.id} 
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("ejecucionId", ejecucion.id)}
                        className="cursor-move hover:shadow-md transition-all active:scale-95"
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-slate-500">
                              {ejecucion.codigoUnico || ejecucion.id}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => verDetalle(ejecucion)}>
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                          <h4 className="text-sm font-bold leading-tight mb-1">{nombreServicio}</h4>
                          <p className="text-xs text-slate-500 mb-3">{cliente?.razonSocial}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ejecucion.fechaInicio?.slice(5) || 'TBD'}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ejecucion.participantes?.length || 0}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* VISTA LISTA ORIGINAL */}
        <TabsContent value="lista" className="mt-0">
          <div className="space-y-4">
            {ejecucionesFiltradas.map((ejecucion) => {
              const curso = cursos.find(c => c.id === ejecucion.cursoId);
              const cliente = clientes.find(c => c.id === ejecucion.clienteId);
              const relator = relatores.find(r => r.id === ejecucion.relatorId);
              const cotizacion = cotizaciones.find(c => c.id === ejecucion.cotizacionId);
              const progresoSAG = calcularProgresoSAG(ejecucion.participantes || []);
              const nombreServicio = curso?.nombre || cotizacion?.nombre || 'Servicio Personalizado';

              return (
                <Card key={ejecucion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-slate-800">{ejecucion.codigoUnico || ejecucion.id}</span>
                          {getEstadoBadge(ejecucion.estado)}
                          {curso?.esSAG && <Badge className="bg-amber-500">SAG</Badge>}
                          {(ejecucion.idAccionSence || curso?.codigoSence) && (
                            <Badge variant="outline">SENCE {ejecucion.idAccionSence || curso?.codigoSence}</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-slate-800 mt-2">{nombreServicio}</h3>
                        <p className="text-sm text-slate-500">{cliente?.razonSocial}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {ejecucion.fechaInicio || 'Sin fecha'} - {ejecucion.fechaTermino || 'Sin fecha'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {ejecucion.participantes?.length || 0} participantes
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
                            <DropdownMenuItem onClick={() => updateEjecucion(ejecucion.id, { estado: 'En Curso' })}>
                              <Clock className="w-4 h-4 mr-2" />
                              Iniciar Curso
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateEjecucion(ejecucion.id, { estado: 'Terminado' })}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Terminar
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
        </TabsContent>
      </Tabs>

      {/* Diálogo de Detalle Completo */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {ejecucionSeleccionada && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">
                      {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.nombre || 
                       cotizaciones.find(c => c.id === ejecucionSeleccionada.cotizacionId)?.nombre || 
                       'Servicio Personalizado'}
                    </DialogTitle>
                    <p className="text-slate-500 mt-1">
                      {clientes.find(c => c.id === ejecucionSeleccionada.clienteId)?.razonSocial}
                      <span className="mx-2">•</span>
                      Código: {ejecucionSeleccionada.codigoUnico || ejecucionSeleccionada.id}
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
                    Participantes ({ejecucionSeleccionada.participantes?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="documentos">Archivos</TabsTrigger>
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
                            <span>{ejecucionSeleccionada.configuracion?.modalidad || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Horas:</span>
                            <span>{ejecucionSeleccionada.configuracion?.totalHoras || 0} hrs</span>
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
                          {ejecucionSeleccionada.lugaresEjecucion || 
                           ejecucionSeleccionada.configuracion?.lugar || 
                           ejecucionSeleccionada.configuracion?.urlPlataforma || 
                           'No definido'}
                        </p>
                      </div>

                      {(ejecucionSeleccionada.idAcciones?.length > 0 || ejecucionSeleccionada.idAccionSence) && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-3">SENCE</h4>
                          <div className="flex flex-wrap gap-2">
                            {ejecucionSeleccionada.idAccionSence && <Badge variant="outline">{ejecucionSeleccionada.idAccionSence}</Badge>}
                            {ejecucionSeleccionada.idAcciones?.map((id, idx) => (
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
                      {ejecucionSeleccionada.configuracion?.sesiones?.map((sesion, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="font-medium">Sesión {idx + 1}</span>
                          <span className="text-sm text-slate-600">
                            {sesion.fecha} | {sesion.horaInicio} - {sesion.horaFin}
                          </span>
                        </div>
                      ))}
                      {(!ejecucionSeleccionada.configuracion?.sesiones || ejecucionSeleccionada.configuracion.sesiones.length === 0) && (
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
                        Total: {ejecucionSeleccionada.participantes?.length || 0} participantes
                      </h4>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => {
                            setIsImportModalOpen(true);
                            setExtractedStudents([]);
                            setImportFile(null);
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Importar Nómina IA
                        </Button>
                        <Button size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Cargar Excel
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-x-auto">
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
                          {(ejecucionSeleccionada.participantes || []).map((participante) => (
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
                                      status={participante.documentosSAG?.colinesterasa?.valido ? 'valido' : 
                                             participante.documentosSAG?.colinesterasa?.url ? 'pendiente' : 'faltante'}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <StatusBadge 
                                      status={participante.documentosSAG?.certificadoMedico?.valido ? 'valido' : 
                                             participante.documentosSAG?.certificadoMedico?.url ? 'pendiente' : 'faltante'}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <StatusBadge 
                                      status={participante.documentosSAG?.poderSimple?.valido ? 'valido' : 
                                             participante.documentosSAG?.poderSimple?.url ? 'pendiente' : 'faltante'}
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
                                  {participante.estadoSAG || 'N/A'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Documentos (Archivos Adjuntos) */}
                <TabsContent value="documentos">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-slate-700">Archivos Adjuntos de la Ejecución</h4>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Añadir Archivo
                      </Button>
                    </div>

                    {!ejecucionSeleccionada.archivosAdjuntos || ejecucionSeleccionada.archivosAdjuntos.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p>No hay archivos adjuntos para esta ejecución.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {ejecucionSeleccionada.archivosAdjuntos.map(archivo => (
                          <Card key={archivo.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-sm">{archivo.nombre}</h4>
                                  <p className="text-xs text-slate-500">Categoría ID: {archivo.categoriaId}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={archivo.url} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab Finanzas */}
                <TabsContent value="finanzas">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Orden de Compra</h4>
                        <p className="text-lg">{ejecucionSeleccionada.financiero?.ordenCompra || 'No registrada'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Valor Acordado</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          ${(ejecucionSeleccionada.financiero?.valor || 0).toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Forma de Pago</h4>
                        <p>{ejecucionSeleccionada.financiero?.formaPago || 'No definida'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Fecha de Pago</h4>
                        <p>{ejecucionSeleccionada.financiero?.fechaPago || 'No definida'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogo Crear Ejecución */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Ejecución</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Único</label>
              <Input placeholder="Ejem: EJEC-2025-001" value={nuevaE.codigoUnico || ''} onChange={e => setNuevaE({...nuevaE, codigoUnico: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.estado} onChange={e => setNuevaE({...nuevaE, estado: e.target.value as EstadoEjecucion})}>
                {estadosKanban.map(es => <option key={es} value={es}>{es}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Cliente</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.clienteId || ''} onChange={e => setNuevaE({...nuevaE, clienteId: e.target.value})}>
                <option value="">Seleccionar Cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Cotización</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.cotizacionId || ''} onChange={e => setNuevaE({...nuevaE, cotizacionId: e.target.value})}>
                <option value="">Seleccionar Cotización...</option>
                {cotizaciones.map(c => <option key={c.id} value={c.id}>{c.nombre || c.codigoUnico}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Relator</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.relatorId || ''} onChange={e => setNuevaE({...nuevaE, relatorId: e.target.value})}>
                <option value="">Seleccionar Relator...</option>
                {relatores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Curso (Catálogo)</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.cursoId || ''} onChange={e => setNuevaE({...nuevaE, cursoId: e.target.value})}>
                <option value="">Seleccionar Curso...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad de Participantes</label>
              <Input id="cantPart" type="number" placeholder="0" min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lugares de Ejecución</label>
              <Input placeholder="Lugar o URL" value={nuevaE.lugaresEjecucion || ''} onChange={e => setNuevaE({...nuevaE, lugaresEjecucion: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Input type="date" value={nuevaE.fechaInicio || ''} onChange={e => setNuevaE({...nuevaE, fechaInicio: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Término</label>
              <Input type="date" value={nuevaE.fechaTermino || ''} onChange={e => setNuevaE({...nuevaE, fechaTermino: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID Acción Sence</label>
              <Input placeholder="ID Acción Sence" value={nuevaE.idAccionSence || ''} onChange={e => setNuevaE({...nuevaE, idAccionSence: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Sence (Manual)</label>
              <Input placeholder="Código Sence" value={nuevaE.codigoSence || ''} onChange={e => setNuevaE({...nuevaE, codigoSence: e.target.value})} />
            </div>

            <div className="col-span-2 pt-4 border-t mt-2">
              <h4 className="font-semibold mb-3">Datos Financieros</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orden de Compra</label>
                  <Input placeholder="N° OC" value={nuevaE.financiero?.ordenCompra || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, ordenCompra: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Total</label>
                  <Input type="number" placeholder="0" value={nuevaE.financiero?.valor || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, valor: parseInt(e.target.value) || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pago</label>
                  <Input placeholder="Ejem: Transferencia a 30 días" value={nuevaE.financiero?.formaPago || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, formaPago: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Pago Estimada</label>
                  <Input type="date" value={nuevaE.financiero?.fechaPago || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, fechaPago: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCrear}>Crear Ejecución</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo Importar IA */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Importar Nómina con IA
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-purple-50 text-purple-800 p-4 rounded-lg text-sm">
              Sube la <b>Orden de Compra</b> o el documento PDF/Imagen que contenga la lista de alumnos. 
              La inteligencia artificial de Gemini extraerá automáticamente los RUT, nombres y correos.
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Documento (PDF, PNG, JPG)</label>
                <Input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700" 
                onClick={handleImportSubmit}
                disabled={!importFile || isExtracting}
              >
                {isExtracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {isExtracting ? 'Analizando...' : 'Extraer Datos'}
              </Button>
            </div>

            {extractedStudents.length > 0 && (
              <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                  <h4 className="font-medium text-sm">Vista Previa ({extractedStudents.length} alumnos)</h4>
                  <p className="text-xs text-slate-500">Puedes editar estos datos antes de guardar</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">RUT</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Apellido</th>
                        <th className="p-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {extractedStudents.map((s, i) => (
                        <tr key={i}>
                          <td className="p-1">
                            <Input 
                              className="h-8 text-xs" 
                              value={s.rut} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].rut = e.target.value;
                                setExtractedStudents(newS);
                              }}
                            />
                          </td>
                          <td className="p-1">
                            <Input 
                              className="h-8 text-xs" 
                              value={s.nombre} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].nombre = e.target.value;
                                setExtractedStudents(newS);
                              }}
                            />
                          </td>
                          <td className="p-1">
                            <Input 
                              className="h-8 text-xs" 
                              value={s.apellido} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].apellido = e.target.value;
                                setExtractedStudents(newS);
                              }}
                            />
                          </td>
                          <td className="p-1">
                            <Input 
                              className="h-8 text-xs" 
                              value={s.email} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].email = e.target.value;
                                setExtractedStudents(newS);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-white border-t flex justify-end">
                  <Button 
                    onClick={handleSaveImportedStudents} 
                    disabled={isSavingStudents}
                  >
                    {isSavingStudents ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar y Añadir al Curso
                  </Button>
                </div>
              </div>
            )}
          </div>
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
