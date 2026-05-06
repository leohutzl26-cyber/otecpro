import { useState } from 'react';
import { 
  Search, Plus, GraduationCap, DollarSign, 
  Edit, Trash2, MoreHorizontal, FileText, Star, 
  Calendar, Download, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Store } from '@/hooks/useStore';
import type { Relator } from '@/types';

// ============================================
// MÓDULO RELATORES - ERP OTEC PRO
// ============================================

interface RelatoresProps {
  store: Store;
}

export default function Relatores({ store }: RelatoresProps) {
  const { relatores, ejecuciones, transacciones, cursos, clientes, addRelator, updateRelator, deleteRelator } = store;
  const [busqueda, setBusqueda] = useState('');
  const [relatorSeleccionado, setRelatorSeleccionado] = useState<Relator | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [archivoPreview, setArchivoPreview] = useState<any | null>(null);

  // Formulario
  const [formData, setFormData] = useState<Partial<Relator>>({
    rut: '',
    nombre: '',
    profesion: '',
    especialidad: '',
    valorHora: 0,
    email: '',
    telefono: '',
    activo: true,
    documentos: [] // Asegurarnos de que exista este campo
  });

  const relatoresFiltrados = relatores.filter(r => 
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.rut.includes(busqueda) ||
    r.especialidad.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = () => {
    if (relatorSeleccionado) {
      updateRelator(relatorSeleccionado.id, formData);
    } else {
      addRelator(formData as Omit<Relator, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      rut: '',
      nombre: '',
      profesion: '',
      especialidad: '',
      valorHora: 0,
      email: '',
      telefono: '',
      activo: true,
      documentos: []
    });
    setRelatorSeleccionado(null);
  };

  const editarRelator = (relator: Relator) => {
    setRelatorSeleccionado(relator);
    setFormData(relator);
    setIsDialogOpen(true);
  };

  const verDetalle = (relator: Relator) => {
    setRelatorSeleccionado(relator);
    setIsDetailOpen(true);
    
    // Seleccionar primer archivo PDF o Imagen para vista previa por defecto si existen documentos
    const docs = (relator as any).documentos || [];
    const firstPreview = docs.find((a: any) => 
      a.url.toLowerCase().endsWith('.pdf') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url)
    );
    setArchivoPreview(firstPreview || null);
  };

  // Calcular estadísticas del relator
  const getStatsRelator = (relatorId: string) => {
    const cursosDictados = ejecuciones.filter(e => e.relatorId === relatorId);
    const horasDictadas = cursosDictados.reduce((sum, e) => sum + e.configuracion.totalHoras, 0);
    
    const boletasPendientes = transacciones.filter(t => 
      t.tipo === 'Egreso' && 
      t.categoria === 'Honorarios' && 
      t.idEjecucion && 
      ejecuciones.find(e => e.id === t.idEjecucion)?.relatorId === relatorId &&
      !t.tracking.pagado
    );

    const totalPendiente = boletasPendientes.reduce((sum, t) => sum + t.monto.total, 0);

    return { cursosDictados: cursosDictados.length, horasDictadas, totalPendiente };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Base de Datos de Relatores</h2>
          <p className="text-slate-500">Gestiona el staff docente y sus pagos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Relator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{relatorSeleccionado ? 'Editar Relator' : 'Nuevo Relator'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>RUT *</Label>
                <Input 
                  value={formData.rut} 
                  onChange={e => setFormData({...formData, rut: e.target.value})}
                  placeholder="12.345.678-9"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre Completo *</Label>
                <Input 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Nombre del relator"
                />
              </div>
              <div className="space-y-2">
                <Label>Profesión *</Label>
                <Input 
                  value={formData.profesion} 
                  onChange={e => setFormData({...formData, profesion: e.target.value})}
                  placeholder="Ej: Ingeniero Civil"
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidad *</Label>
                <Input 
                  value={formData.especialidad} 
                  onChange={e => setFormData({...formData, especialidad: e.target.value})}
                  placeholder="Área de especialización"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Hora ($) *</Label>
                <Input 
                  type="number"
                  value={formData.valorHora} 
                  onChange={e => setFormData({...formData, valorHora: parseInt(e.target.value)})}
                  placeholder="35000"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@ejemplo.cl"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input 
                  value={formData.telefono} 
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {relatorSeleccionado ? 'Guardar Cambios' : 'Crear Relator'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          className="pl-10"
          placeholder="Buscar por nombre, RUT o especialidad..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Relatores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatoresFiltrados.map((relator) => {
          const stats = getStatsRelator(relator.id);
          
          return (
            <Card key={relator.id} className={`hover:shadow-md transition-shadow ${!relator.activo && 'opacity-60'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{relator.nombre}</h3>
                        <p className="text-sm text-slate-500">{relator.profesion}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {relator.especialidad}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${relator.valorHora.toLocaleString('es-CL')}/hr
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{stats.cursosDictados}</p>
                        <p className="text-xs text-slate-500">Cursos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{stats.horasDictadas}</p>
                        <p className="text-xs text-slate-500">Horas</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${stats.totalPendiente > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          ${(stats.totalPendiente / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-slate-500">Pendiente</p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => verDetalle(relator)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => editarRelator(relator)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteRelator(relator.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo de Detalle Expandido */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-none sm:max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span>Ficha de Relator: {relatorSeleccionado?.nombre}</span>
                  <p className="text-sm text-slate-500 font-normal">{relatorSeleccionado?.profesion}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {relatorSeleccionado && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Panel Izquierdo: Resumen y Datos */}
              <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r bg-slate-50/50 space-y-6">
                <div className="space-y-4">
                  <div className="p-5 bg-white border rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estado</p>
                      <Badge className={relatorSeleccionado.activo ? 'bg-green-500' : 'bg-slate-500'}>
                        {relatorSeleccionado.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">RUT</p>
                        <p className="font-semibold text-slate-800">{relatorSeleccionado.rut}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Especialidad</p>
                        <p className="font-semibold text-blue-700">{relatorSeleccionado.especialidad}</p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Contacto</p>
                        <p className="text-sm flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {relatorSeleccionado.email}
                        </p>
                        <p className="text-sm flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {relatorSeleccionado.telefono}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  {(() => {
                    const stats = getStatsRelator(relatorSeleccionado.id);
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Cursos</p>
                          <p className="font-bold text-lg text-slate-800">{stats.cursosDictados}</p>
                        </div>
                        <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Horas</p>
                          <p className="font-bold text-lg text-slate-800">{stats.horasDictadas}</p>
                        </div>
                        <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Por Pagar</p>
                          <p className={`font-bold text-lg ${stats.totalPendiente > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            ${(stats.totalPendiente / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Documentos y Certificaciones</h4>
                  {(!(relatorSeleccionado as any).documentos || (relatorSeleccionado as any).documentos.length === 0) ? (
                    <div className="text-center py-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Sin documentos adjuntos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {(relatorSeleccionado as any).documentos.map((a: any) => (
                        <button 
                          key={a.id} 
                          onClick={() => setArchivoPreview(a)}
                          className={`flex items-center gap-3 p-3 bg-white border rounded-lg text-left transition-all hover:border-blue-600 ${archivoPreview?.id === a.id ? 'border-blue-600 ring-1 ring-blue-600/20' : 'border-slate-200'}`}
                        >
                          <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0">
                            {a.url.toLowerCase().endsWith('.pdf') ? <FileText className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate">{a.nombre}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    <Plus className="w-3 h-3 mr-2" />
                    Subir Documento
                  </Button>
                </div>
              </div>

              {/* Panel Derecho: Contenido Detallado y Preview */}
              <div className="flex-1 flex flex-col bg-slate-100/30">
                <Tabs defaultValue="ejecuciones" className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-white border-b px-6">
                    <TabsList className="bg-transparent border-b-0 h-14 gap-6">
                      <TabsTrigger value="ejecuciones" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14">
                        Ejecuciones Asociadas
                      </TabsTrigger>
                      <TabsTrigger value="pagos" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14">
                        Historial de Pagos
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14">
                        Vista Previa Documento
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent value="ejecuciones" className="mt-0 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {ejecuciones
                          .filter(e => e.relatorId === relatorSeleccionado.id)
                          .map((ejecucion) => {
                            const curso = cursos.find(c => c.id === ejecucion.cursoId);
                            const cliente = clientes.find(c => c.id === ejecucion.clienteId);
                            
                            return (
                              <Card key={ejecucion.id} className="shadow-sm">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <h4 className="font-bold text-slate-800">{curso?.nombre}</h4>
                                      <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> {cliente?.razonSocial}
                                      </p>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {ejecucion.fechaInicio} al {ejecucion.fechaTermino}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {ejecucion.configuracion.totalHoras} hrs
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                      <Badge className={
                                        ejecucion.estado === 'Terminado' ? 'bg-green-500' :
                                        ejecucion.estado === 'En Curso' ? 'bg-blue-500' :
                                        'bg-slate-500'
                                      }>
                                        {ejecucion.estado}
                                      </Badge>
                                      <p className="text-xs font-bold text-blue-600">${(ejecucion.configuracion.valorHoraRelator || 0).toLocaleString('es-CL')}/hr</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        
                        {ejecuciones.filter(e => e.relatorId === relatorSeleccionado.id).length === 0 && (
                          <div className="text-center py-12 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No se registran ejecuciones asociadas a este relator.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pagos" className="mt-0 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {transacciones
                          .filter(t => 
                            t.tipo === 'Egreso' && 
                            t.categoria === 'Honorarios' && 
                            t.idEjecucion && 
                            ejecuciones.find(e => e.id === t.idEjecucion)?.relatorId === relatorSeleccionado.id
                          )
                          .map((t) => {
                            const ejecucion = ejecuciones.find(e => e.id === t.idEjecucion);
                            const curso = cursos.find(c => c.id === ejecucion?.cursoId);
                            
                            return (
                              <div key={t.id} className="p-4 bg-white border rounded-lg flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">{t.metadatos.nroDocumento || 'Boleta s/n'}</span>
                                    {t.tracking.pagado ? 
                                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Pagado</Badge> : 
                                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pendiente</Badge>
                                    }
                                  </div>
                                  <p className="text-sm text-slate-600">{curso?.nombre}</p>
                                  <p className="text-xs text-slate-400">Emisión: {t.tracking.fechaEmision}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-slate-800">${t.monto.total.toLocaleString('es-CL')}</p>
                                  <p className="text-xs text-slate-500">{t.monto.metodoPago || 'Por definir'}</p>
                                </div>
                              </div>
                            );
                          })}
                        
                        {transacciones.filter(t => 
                          t.tipo === 'Egreso' && 
                          t.categoria === 'Honorarios' && 
                          t.idEjecucion && 
                          ejecuciones.find(e => e.id === t.idEjecucion)?.relatorId === relatorSeleccionado.id
                        ).length === 0 && (
                          <div className="text-center py-12 text-slate-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No se registran transacciones de honorarios para este relator.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0 h-full">
                      {archivoPreview ? (
                        <div className="h-full flex flex-col bg-white rounded-xl border overflow-hidden shadow-lg">
                          <div className="p-3 border-b flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-bold truncate">{archivoPreview.nombre}</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3 mr-2" /> Descargar
                              </a>
                            </Button>
                          </div>
                          <div className="flex-1 bg-slate-200/30 flex items-center justify-center">
                            {archivoPreview.url.toLowerCase().endsWith('.pdf') ? (
                              <iframe 
                                src={`${archivoPreview.url}#toolbar=0`} 
                                className="w-full h-full border-0"
                                title="Preview PDF"
                              />
                            ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(archivoPreview.url) ? (
                              <img 
                                src={archivoPreview.url} 
                                alt={archivoPreview.nombre}
                                className="max-w-full max-h-full object-contain p-4"
                              />
                            ) : (
                              <div className="text-center space-y-4">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto" />
                                <p className="text-slate-500">Vista previa no disponible para este formato.</p>
                                <Button asChild>
                                  <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">Descargar</a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                          <FileText className="w-16 h-16 mb-4 opacity-20" />
                          <h3 className="font-bold">Sin documento seleccionado</h3>
                          <p className="text-sm max-w-xs text-center">Selecciona un archivo del panel izquierdo para previsualizarlo aquí.</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
