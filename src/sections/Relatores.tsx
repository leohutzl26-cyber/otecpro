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

  // Formulario
  const [formData, setFormData] = useState<Partial<Relator>>({
    rut: '',
    nombre: '',
    profesion: '',
    especialidad: '',
    valorHora: 0,
    email: '',
    telefono: '',
    activo: true
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
      activo: true
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

      {/* Diálogo de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {relatorSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p>{relatorSeleccionado.nombre}</p>
                    <p className="text-sm text-slate-500 font-normal">{relatorSeleccionado.profesion}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="cursos">Cursos Dictados</TabsTrigger>
                  <TabsTrigger value="pagos">Pagos</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Datos Personales</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">RUT:</span>
                          <span>{relatorSeleccionado.rut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span>{relatorSeleccionado.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Teléfono:</span>
                          <span>{relatorSeleccionado.telefono}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Información Profesional</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Especialidad:</span>
                          <span>{relatorSeleccionado.especialidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valor Hora:</span>
                          <span className="font-medium">
                            ${relatorSeleccionado.valorHora.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado:</span>
                          <Badge className={relatorSeleccionado.activo ? 'bg-green-500' : 'bg-slate-500'}>
                            {relatorSeleccionado.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar CV
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Títulos
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="cursos">
                  <div className="space-y-3">
                    {ejecuciones
                      .filter(e => e.relatorId === relatorSeleccionado.id)
                      .map((ejecucion) => {
                        const curso = cursos.find(c => c.id === ejecucion.cursoId);
                        const cliente = clientes.find(c => c.id === ejecucion.clienteId);
                        
                        return (
                          <div key={ejecucion.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{curso?.nombre}</h4>
                                <p className="text-sm text-slate-500">{cliente?.razonSocial}</p>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {ejecucion.fechaInicio}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {ejecucion.configuracion.totalHoras} hrs
                                  </span>
                                </div>
                              </div>
                              <Badge className={
                                ejecucion.estado === 'Completado' ? 'bg-green-500' :
                                ejecucion.estado === 'En Ejecución' ? 'bg-blue-500' :
                                'bg-slate-500'
                              }>
                                {ejecucion.estado}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    
                    {ejecuciones.filter(e => e.relatorId === relatorSeleccionado.id).length === 0 && (
                      <p className="text-center text-slate-500 py-8">No hay cursos registrados</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pagos">
                  <div className="space-y-3">
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
                          <div key={t.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{t.metadatos.nroDocumento}</h4>
                                <p className="text-sm text-slate-500">{curso?.nombre}</p>
                                <p className="text-sm text-slate-400">{t.tracking.fechaEmision}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${t.monto.total.toLocaleString('es-CL')}</p>
                                <Badge className={t.tracking.pagado ? 'bg-green-500' : 'bg-amber-500'}>
                                  {t.tracking.pagado ? 'Pagado' : 'Pendiente'}
                                </Badge>
                              </div>
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
                      <p className="text-center text-slate-500 py-8">No hay pagos registrados</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
