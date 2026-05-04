import { useState } from 'react';
import { 
  Search, Plus, FileText, Send, CheckCircle, XCircle, 
  Edit, MoreHorizontal, Calendar,
  DollarSign, Users, Download, Paperclip
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
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Store } from '@/hooks/useStore';
import type { Cotizacion, EstadoCotizacion } from '@/types';

// ============================================
// MÓDULO COTIZACIONES - ERP OTEC PRO
// ============================================

interface CotizacionesProps {
  store: Store;
}

export default function Cotizaciones({ store }: CotizacionesProps) {
  const { cotizaciones, clientes, cursos, addCotizacion, updateCotizacion, aprobarCotizacion } = store;
  const [busqueda, setBusqueda] = useState('');
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Formulario
  const [formData, setFormData] = useState<Partial<Cotizacion>>({
    clienteId: '',
    nombre: '',
    perteneceCatalogo: false,
    cursoId: '',
    descripcion: '',
    validezPropuesta: '30 días',
    fechaTentativa: '',
    precio: 0,
    archivosAdjuntos: [],
    estado: 'En Preparación'
  });

  const cotizacionesFiltradas = cotizaciones.filter(c => 
    c.codigoUnico?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cliente?.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const exportarCSV = () => {
    const encabezados = ['Codigo Unico', 'Cliente', 'RUT', 'Nombre Servicio', 'Fecha Propuesta', 'Fecha Tentativa', 'Precio', 'Estado'];
    const filas = cotizacionesFiltradas.map(c => [
      c.codigoUnico,
      `"${c.cliente?.razonSocial || ''}"`,
      c.cliente?.rut || '',
      c.fechaPropuesta,
      `"${c.nombre || ''}"`,
      c.fechaTentativa,
      c.precio,
      c.estado
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [encabezados.join(','), ...filas.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (formData.clienteId && formData.nombre && formData.precio !== undefined) {
      if (cotizacionSeleccionada) {
        updateCotizacion(cotizacionSeleccionada.id, formData);
      } else {
        addCotizacion({
          ...formData,
          fechaPropuesta: new Date().toISOString().split('T')[0],
          estado: 'En Preparación'
        } as Omit<Cotizacion, 'id' | 'codigoUnico'>);
      }
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      nombre: '',
      perteneceCatalogo: false,
      cursoId: '',
      descripcion: '',
      validezPropuesta: '30 días',
      fechaTentativa: '',
      precio: 0,
      archivosAdjuntos: [],
      estado: 'En Preparación'
    });
    setCotizacionSeleccionada(null);
  };

  const editarCotizacion = (cotizacion: Cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setFormData(cotizacion);
    setIsDialogOpen(true);
  };

  const verCotizacion = (cotizacion: Cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setIsViewDialogOpen(true);
  };

  const getEstadoBadge = (estado: EstadoCotizacion) => {
    const config = {
      'En Preparación': { class: 'bg-slate-500', icon: FileText },
      'Enviada': { class: 'bg-blue-500', icon: Send },
      'Aceptada': { class: 'bg-green-500', icon: CheckCircle },
      'Cancelada': { class: 'bg-red-500', icon: XCircle }
    };
    const { class: className, icon: Icon } = config[estado] || { class: 'bg-gray-500', icon: FileText };
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestor de Cotizaciones</h2>
          <p className="text-slate-500">Crea cotizaciones personalizadas o de catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {cotizacionSeleccionada ? 'Editar Cotización' : 'Nueva Cotización'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select 
                    value={formData.clienteId} 
                    onValueChange={(v) => setFormData({...formData, clienteId: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.razonSocial}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Validez de la Propuesta</Label>
                  <Input 
                    value={formData.validezPropuesta || ''} 
                    onChange={e => setFormData({...formData, validezPropuesta: e.target.value})}
                    placeholder="Ej. 30 días, hasta 31/12..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 my-4">
                <Switch 
                  id="catalogo" 
                  checked={formData.perteneceCatalogo}
                  onCheckedChange={(v) => setFormData({...formData, perteneceCatalogo: v, cursoId: v ? formData.cursoId : '', nombre: v ? formData.nombre : ''})}
                />
                <Label htmlFor="catalogo">Pertenece al Catálogo SENCE</Label>
              </div>

              {formData.perteneceCatalogo ? (
                <div className="space-y-2">
                  <Label>Seleccionar Curso del Catálogo</Label>
                  <Select 
                    value={formData.cursoId || ''} 
                    onValueChange={(v) => {
                      const c = cursos.find(curso => curso.id === v);
                      setFormData({...formData, cursoId: v, nombre: c ? c.nombre : ''});
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar curso..." /></SelectTrigger>
                    <SelectContent>
                      {cursos.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Nombre del Servicio / Curso (Personalizado) *</Label>
                  <Input 
                    value={formData.nombre || ''} 
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del servicio o curso"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Descripción / Detalles</Label>
                <Textarea 
                  value={formData.descripcion || ''} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción detallada de la propuesta..."
                  className="h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Tentativa</Label>
                  <Input 
                    type="date"
                    value={formData.fechaTentativa || ''} 
                    onChange={e => setFormData({...formData, fechaTentativa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio / Valor Propuesto *</Label>
                  <Input 
                    type="number"
                    value={formData.precio || ''} 
                    onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="pt-4 pb-2">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> 
                  Los archivos adjuntos podrán gestionarse una vez guardada la cotización en su detalle.
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={!formData.clienteId || !formData.nombre || formData.precio === undefined}>
                {cotizacionSeleccionada ? 'Guardar Cambios' : 'Crear Cotización'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            className="pl-10"
            placeholder="Buscar por código, cliente o nombre del servicio..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Cotizaciones */}
      <div className="space-y-4">
        {cotizacionesFiltradas.map((cotizacion) => (
          <Card key={cotizacion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800">{cotizacion.codigoUnico || cotizacion.numero}</h3>
                    {getEstadoBadge(cotizacion.estado)}
                    {cotizacion.perteneceCatalogo && <Badge variant="outline">Catálogo</Badge>}
                  </div>
                  
                  <h4 className="font-medium text-slate-700 mt-2">{cotizacion.nombre}</h4>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users className="w-4 h-4" />
                      {cotizacion.cliente?.razonSocial}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      Tentativa: {cotizacion.fechaTentativa || 'TBD'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <DollarSign className="w-4 h-4" />
                      ${(cotizacion.precio || cotizacion.total || 0).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cotizacion.estado === 'En Preparación' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateCotizacion(cotizacion.id, { estado: 'Enviada' })}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  {cotizacion.estado === 'Enviada' && (
                    <Button 
                      size="sm"
                      onClick={() => aprobarCotizacion(cotizacion.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aceptar
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => verCotizacion(cotizacion)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Ver detalle
                      </DropdownMenuItem>
                      {cotizacion.estado === 'En Preparación' && (
                        <DropdownMenuItem onClick={() => editarCotizacion(cotizacion)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => updateCotizacion(cotizacion.id, { estado: 'Cancelada' })}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo Ver Cotización */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización {cotizacionSeleccionada?.codigoUnico || cotizacionSeleccionada?.numero}</DialogTitle>
          </DialogHeader>
          
          {cotizacionSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-slate-500">Cliente</p>
                  <p className="font-semibold">{cotizacionSeleccionada.cliente?.razonSocial}</p>
                </div>
                <div>
                  <p className="text-slate-500">Estado</p>
                  {getEstadoBadge(cotizacionSeleccionada.estado)}
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Servicio / Curso</p>
                  <p className="font-medium">{cotizacionSeleccionada.nombre}</p>
                </div>
                <div>
                  <p className="text-slate-500">Precio</p>
                  <p className="font-semibold text-lg text-blue-600">
                    ${(cotizacionSeleccionada.precio || cotizacionSeleccionada.total || 0).toLocaleString('es-CL')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Fecha Tentativa</p>
                  <p>{cotizacionSeleccionada.fechaTentativa || 'No definida'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Descripción</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap border p-3 rounded-md bg-white">
                  {cotizacionSeleccionada.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-700 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" /> Archivos Adjuntos
                  </h4>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Adjuntar
                  </Button>
                </div>
                {(!cotizacionSeleccionada.archivosAdjuntos || cotizacionSeleccionada.archivosAdjuntos.length === 0) ? (
                  <p className="text-sm text-slate-500 italic">No hay archivos adjuntos.</p>
                ) : (
                  <ul className="space-y-2">
                    {cotizacionSeleccionada.archivosAdjuntos.map(a => (
                      <li key={a.id} className="flex items-center justify-between bg-slate-50 p-2 rounded text-sm border">
                        <span className="truncate">{a.nombre}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={a.url} target="_blank" rel="noreferrer">Descargar</a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
