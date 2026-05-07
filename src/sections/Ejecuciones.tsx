import { useState } from 'react';
import { 
  Search, Calendar, Users, X,
  Edit, MoreHorizontal, FileText, CheckCircle, AlertTriangle,
  Clock, Upload, Download, GraduationCap, DollarSign, Paperclip, Plus, Sparkles, Loader2, Save, MapPin
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
  const [archivoPreview, setArchivoPreview] = useState<{ nombre: string; url: string; tipo: string } | null>(null);

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
        apellidoPaterno: '',
        apellidoMaterno: '',
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
    setArchivoPreview(null);
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
                        className="cursor-pointer hover:shadow-md transition-all active:scale-95 group"
                        onClick={() => verDetalle(ejecucion)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-slate-500">
                              {ejecucion.codigoUnico || ejecucion.id}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <Card key={ejecucion.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => verDetalle(ejecucion)}>
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
                        <Button size="sm" variant="outline" className="group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
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
        <DialogContent className="max-w-none sm:max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden">
          {ejecucionSeleccionada && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Lado Izquierdo: Información y Tabs */}
              <div className="w-full md:w-3/5 flex flex-col border-r overflow-hidden">
                <div className="p-6 border-b bg-white shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1E3A5F] rounded-lg flex items-center justify-center text-white">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">
                          {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.nombre || 
                           cotizaciones.find(c => c.id === ejecucionSeleccionada.cotizacionId)?.nombre || 
                           'Servicio Personalizado'}
                        </DialogTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{clientes.find(c => c.id === ejecucionSeleccionada.clienteId)?.razonSocial}</span>
                          <span className="text-slate-300">•</span>
                          <code className="bg-slate-100 px-1 rounded">{ejecucionSeleccionada.codigoUnico || ejecucionSeleccionada.id}</code>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEstadoBadge(ejecucionSeleccionada.estado)}
                      {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                        <Badge className="bg-amber-500 text-white">SAG</Badge>
                      )}
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-lg">
                      <TabsTrigger value="general" className="rounded-md">General</TabsTrigger>
                      <TabsTrigger value="participantes" className="rounded-md">Participantes ({ejecucionSeleccionada.participantes?.length || 0})</TabsTrigger>
                      <TabsTrigger value="documentos" className="rounded-md">Archivos</TabsTrigger>
                      <TabsTrigger value="finanzas" className="rounded-md">Finanzas</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                  {/* Tab General */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border rounded-xl shadow-sm">
                          <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">Logística y Horarios</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded text-blue-600"><Clock className="w-4 h-4" /></div>
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Horario</p>
                                <p className="text-sm font-medium">{ejecucionSeleccionada.horario || 'No definido'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-50 rounded text-green-600"><MapPin className="w-4 h-4" /></div>
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Ubicación / Plataforma</p>
                                <p className="text-sm font-medium">
                                  {ejecucionSeleccionada.lugaresEjecucion || ejecucionSeleccionada.configuracion?.lugar || ejecucionSeleccionada.configuracion?.urlPlataforma || 'No definido'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white border rounded-xl shadow-sm">
                          <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">Relator Asignado</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">
                                {relatores.find(r => r.id === ejecucionSeleccionada.relatorId)?.nombre || 'No asignado'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {relatores.find(r => r.id === ejecucionSeleccionada.relatorId)?.especialidad || 'Sin especialidad'}
                              </p>
                            </div>
                          </div>
                          {ejecucionSeleccionada.relatorId && (
                            <Button variant="outline" size="sm" className="w-full text-xs">Ver currículum</Button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-white border rounded-xl shadow-sm">
                        <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">Sesiones Programadas</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {ejecucionSeleccionada.configuracion?.sesiones?.map((sesion, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="w-8 h-8 bg-white border rounded flex items-center justify-center font-bold text-xs text-[#1E3A5F]">
                                {idx + 1}
                              </div>
                              <div className="text-xs">
                                <p className="font-bold">{sesion.fecha}</p>
                                <p className="text-slate-500">{sesion.horaInicio} - {sesion.horaFin}</p>
                              </div>
                            </div>
                          ))}
                          {(!ejecucionSeleccionada.configuracion?.sesiones || ejecucionSeleccionada.configuracion.sesiones.length === 0) && (
                            <p className="col-span-2 text-slate-400 text-sm italic py-4 text-center">No hay sesiones registradas.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Participantes */}
                  {activeTab === 'participantes' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-slate-400" />
                          <span className="font-bold text-slate-700">{ejecucionSeleccionada.participantes?.length || 0} alumnos inscritos</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => setIsImportModalOpen(true)}
                          >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Importar IA
                          </Button>
                          <Button size="sm">Cargar Excel</Button>
                        </div>
                      </div>

                      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Alumno</th>
                              <th className="text-center p-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Asistencia</th>
                              {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                                <th className="text-center p-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Documentos SAG</th>
                              )}
                              <th className="text-center p-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(ejecucionSeleccionada.participantes || []).map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-slate-800">{p.nombre} {p.apellidoPaterno}</p>
                                  <p className="text-xs text-slate-500 font-mono">{p.rut}</p>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col items-center gap-1">
                                    <Progress value={p.asistenciaProgreso} className="w-16 h-1.5" />
                                    <span className="text-[10px] font-bold">{p.asistenciaProgreso}%</span>
                                  </div>
                                </td>
                                {cursos.find(c => c.id === ejecucionSeleccionada.cursoId)?.esSAG && (
                                  <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* Colinesterasa */}
                                      <button 
                                        onClick={() => p.documentosSAG?.colinesterasa?.url && setArchivoPreview({ 
                                          nombre: `Colinesterasa - ${p.nombre}`, 
                                          url: p.documentosSAG.colinesterasa.url,
                                          tipo: 'documento'
                                        })}
                                        title="Examen Colinesterasa"
                                      >
                                        <StatusBadge 
                                          status={p.documentosSAG?.colinesterasa?.valido ? 'valido' : 
                                                 p.documentosSAG?.colinesterasa?.url ? 'pendiente' : 'faltante'}
                                        />
                                      </button>
                                      {/* Certificado Médico */}
                                      <button 
                                        onClick={() => p.documentosSAG?.certificadoMedico?.url && setArchivoPreview({ 
                                          nombre: `Cert. Médico - ${p.nombre}`, 
                                          url: p.documentosSAG.certificadoMedico.url,
                                          tipo: 'documento'
                                        })}
                                        title="Certificado Médico"
                                      >
                                        <StatusBadge 
                                          status={p.documentosSAG?.certificadoMedico?.valido ? 'valido' : 
                                                 p.documentosSAG?.certificadoMedico?.url ? 'pendiente' : 'faltante'}
                                        />
                                      </button>
                                    </div>
                                  </td>
                                )}
                                <td className="p-4 text-center">
                                  <Badge className={
                                    p.estadoSAG === 'Completo' ? 'bg-green-500' :
                                    p.estadoSAG === 'Incompleto' ? 'bg-amber-500' : 'bg-slate-500'
                                  }>
                                    {p.estadoSAG || 'N/A'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Tab Documentos */}
                  {activeTab === 'documentos' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700">Archivos de la Ejecución</h4>
                        <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Añadir</Button>
                      </div>

                      {!ejecucionSeleccionada.archivosAdjuntos || ejecucionSeleccionada.archivosAdjuntos.length === 0 ? (
                        <div className="text-center py-12 bg-white border-2 border-dashed rounded-xl">
                          <Paperclip className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 text-sm">No hay archivos adjuntos específicos para esta ejecución.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {ejecucionSeleccionada.archivosAdjuntos.map(archivo => (
                            <button 
                              key={archivo.id} 
                              onClick={() => setArchivoPreview({ nombre: archivo.nombre, url: archivo.url, tipo: 'documento' })}
                              className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-[#1E3A5F] transition-all text-left shadow-sm group"
                            >
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <h4 className="font-bold text-sm truncate">{archivo.nombre}</h4>
                                <p className="text-[10px] text-slate-400 uppercase">Documento</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Finanzas */}
                  {activeTab === 'finanzas' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white border rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Valor de Ejecución</p>
                            <p className="text-3xl font-black text-emerald-700">${(ejecucionSeleccionada.financiero?.valor || 0).toLocaleString('es-CL')}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Forma de Pago:</span>
                            <span className="font-bold text-slate-700">{ejecucionSeleccionada.financiero?.formaPago || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Orden de Compra:</span>
                            <span className="font-bold text-slate-700">{ejecucionSeleccionada.financiero?.ordenCompra || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 bg-[#1E3A5F] text-white rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                          <h4 className="text-xs uppercase font-bold opacity-70 mb-6">Estado de Pago Estimado</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-3xl font-bold">{ejecucionSeleccionada.financiero?.fechaPago || 'Fecha no definida'}</p>
                              <p className="text-xs opacity-60">Basado en condiciones de cliente</p>
                            </div>
                            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-0 text-white">Registrar Hito de Cobro</Button>
                          </div>
                        </div>
                        <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lado Derecho: Vista Previa */}
              <div className="flex-1 flex flex-col bg-slate-100/30">
                {archivoPreview ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white border-b p-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold truncate max-w-md">{archivoPreview.nombre}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Descargar
                        </a>
                      </Button>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      {archivoPreview.url.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${archivoPreview.url}#toolbar=0`} 
                          className="w-full h-full border-0 rounded-xl shadow-2xl bg-white"
                          title="Preview PDF"
                        />
                      ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(archivoPreview.url) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={archivoPreview.url} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                          />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-12 text-center">
                          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                          <h4 className="text-xl font-bold mb-2">Vista previa no soportada</h4>
                          <p className="text-slate-500 mb-8">El formato de este archivo no permite previsualización directa. Por favor descárgalo.</p>
                          <Button asChild><a href={archivoPreview.url} target="_blank" rel="noreferrer">Descargar Archivo</a></Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <div className="w-24 h-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">Monitor de Documentación</h3>
                    <p className="max-w-xs text-sm">Selecciona un archivo de ejecución o un documento SAG de un alumno para previsualizarlo aquí.</p>
                  </div>
                )}
              </div>
            </div>
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
        <DialogContent className="sm:max-w-[90vw] w-[90vw] h-[92vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Importar Nómina con IA
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            <div className="bg-purple-50 text-purple-800 p-4 rounded-lg text-sm border border-purple-100 shadow-sm">
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
                        <th className="p-2 text-left">Ap. Paterno</th>
                        <th className="p-2 text-left">Ap. Materno</th>
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
                              value={s.apellidoPaterno} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].apellidoPaterno = e.target.value;
                                setExtractedStudents(newS);
                              }}
                            />
                          </td>
                          <td className="p-1">
                            <Input 
                              className="h-8 text-xs" 
                              value={s.apellidoMaterno} 
                              onChange={(e) => {
                                const newS = [...extractedStudents];
                                newS[i].apellidoMaterno = e.target.value;
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
  return <Badge className={`${className} text-[10px] h-5 cursor-pointer`}>{label}</Badge>;
}
