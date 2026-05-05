import React, { useState } from 'react';
import { 
  DollarSign, Users, Download, Paperclip, File, Image, FileText, CheckCircle, XCircle
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
  const [archivoPreview, setArchivoPreview] = useState<any | null>(null);

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
    // Seleccionar primer archivo PDF o Imagen para vista previa por defecto
    const firstPreview = cotizacion.archivosAdjuntos?.find(a => 
      a.url.toLowerCase().endsWith('.pdf') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url)
    );
    setArchivoPreview(firstPreview || null);
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
                <div className="flex-1 cursor-pointer" onClick={() => verCotizacion(cotizacion)}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800 hover:text-[#1E3A5F] transition-colors">{cotizacion.codigoUnico || cotizacion.numero}</h3>
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
        <DialogContent className="max-w-none sm:max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Cotización {cotizacionSeleccionada?.codigoUnico || cotizacionSeleccionada?.numero} - {cotizacionSeleccionada?.cliente?.razonSocial}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {cotizacionSeleccionada && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Lado Izquierdo: Resumen y Datos */}
              <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r bg-slate-50/50 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white border rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estado Actual</p>
                      {getEstadoBadge(cotizacionSeleccionada.estado)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cliente</p>
                      <p className="font-bold text-slate-800">{cotizacionSeleccionada.cliente?.razonSocial}</p>
                      <p className="text-xs text-slate-500">{cotizacionSeleccionada.cliente?.rut}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Servicio propuesto</p>
                      <p className="font-semibold text-[#1E3A5F]">{cotizacionSeleccionada.nombre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Inversión Total</p>
                      <p className="font-bold text-lg text-blue-600">
                        ${(cotizacionSeleccionada.precio || cotizacionSeleccionada.total || 0).toLocaleString('es-CL')}
                      </p>
                    </div>
                    <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Fecha Tentativa</p>
                      <p className="font-bold text-slate-700">{cotizacionSeleccionada.fechaTentativa || 'TBD'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Detalles de la Propuesta</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {cotizacionSeleccionada.descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Archivos de la Cotización</h4>
                  {(!cotizacionSeleccionada.archivosAdjuntos || cotizacionSeleccionada.archivosAdjuntos.length === 0) ? (
                    <div className="text-center py-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                      <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Sin documentos adjuntos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {cotizacionSeleccionada.archivosAdjuntos.map(a => (
                        <button 
                          key={a.id} 
                          onClick={() => setArchivoPreview(a)}
                          className={`flex items-center gap-3 p-3 bg-white border rounded-lg text-left transition-all hover:border-[#1E3A5F] ${archivoPreview?.id === a.id ? 'border-[#1E3A5F] ring-1 ring-[#1E3A5F]/20' : 'border-slate-200'}`}
                        >
                          <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0">
                            {a.url.toLowerCase().endsWith('.pdf') ? <FileText className="w-4 h-4 text-red-500" /> : <File className="w-4 h-4 text-slate-400" />}
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate">{a.nombre}</span>
                        </button>
                      ))}
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
                        <div className="w-8 h-8 bg-[#1E3A5F] rounded flex items-center justify-center text-white">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">{archivoPreview.nombre}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </a>
                      </Button>
                    </div>
                    
                    <div className="flex-1 bg-slate-200/50 flex items-center justify-center p-4 overflow-hidden">
                      {archivoPreview.url.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${archivoPreview.url}#toolbar=0`} 
                          className="w-full h-full border-0 rounded-lg shadow-lg bg-white"
                          title="Preview PDF"
                        />
                      ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(archivoPreview.url) ? (
                        <img 
                          src={archivoPreview.url} 
                          alt={archivoPreview.nombre}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                      ) : (
                        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm">
                          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h4 className="font-bold text-slate-800 mb-2">Vista previa no disponible</h4>
                          <p className="text-sm text-slate-500 mb-6">Descarga el archivo para visualizar su contenido.</p>
                          <Button asChild>
                            <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">
                              Descargar Archivo
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <div className="w-24 h-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">Previsualizador de Cotización</h3>
                    <p className="max-w-xs text-sm">Selecciona un documento adjunto para revisar la propuesta técnica o comercial sin salir del gestor.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
