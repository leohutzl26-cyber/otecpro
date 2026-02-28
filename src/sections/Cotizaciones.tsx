import { useState } from 'react';
import { 
  Search, Plus, FileText, Send, CheckCircle, XCircle, 
  Edit, Trash2, MoreHorizontal, Calendar,
  DollarSign, Users
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
import type { Store } from '@/hooks/useStore';
import type { Cotizacion, EstadoCotizacion, ItemCotizacion } from '@/types';

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
    vigenciaDias: 30,
    items: [],
    observaciones: ''
  });

  const [nuevoItem, setNuevoItem] = useState<Partial<ItemCotizacion>>({
    cursoId: '',
    valorPorParticipante: 0,
    cantidadParticipantes: 1,
    descuento: 0
  });

  const cotizacionesFiltradas = cotizaciones.filter(c => 
    c.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cliente?.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularTotales = (items: ItemCotizacion[]) => {
    const subtotal = items.reduce((sum, item) => item.subtotal + sum, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const agregarItem = () => {
    if (nuevoItem.cursoId && nuevoItem.valorPorParticipante && nuevoItem.cantidadParticipantes) {
      const curso = cursos.find(c => c.id === nuevoItem.cursoId);
      const valorBruto = (nuevoItem.valorPorParticipante || 0) * (nuevoItem.cantidadParticipantes || 0);
      const descuentoMonto = valorBruto * ((nuevoItem.descuento || 0) / 100);
      const subtotal = valorBruto - descuentoMonto;

      const item: ItemCotizacion = {
        cursoId: nuevoItem.cursoId,
        curso,
        valorPorParticipante: nuevoItem.valorPorParticipante || 0,
        cantidadParticipantes: nuevoItem.cantidadParticipantes || 0,
        descuento: nuevoItem.descuento || 0,
        subtotal
      };

      const nuevosItems = [...(formData.items || []), item];
      const totales = calcularTotales(nuevosItems);

      setFormData({
        ...formData,
        items: nuevosItems,
        subtotal: totales.subtotal,
        iva: totales.iva,
        total: totales.total
      });

      setNuevoItem({
        cursoId: '',
        valorPorParticipante: 0,
        cantidadParticipantes: 1,
        descuento: 0
      });
    }
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = formData.items?.filter((_, i) => i !== index) || [];
    const totales = calcularTotales(nuevosItems);
    
    setFormData({
      ...formData,
      items: nuevosItems,
      subtotal: totales.subtotal,
      iva: totales.iva,
      total: totales.total
    });
  };

  const handleSubmit = () => {
    if (formData.clienteId && formData.items && formData.items.length > 0) {
      if (cotizacionSeleccionada) {
        updateCotizacion(cotizacionSeleccionada.id, formData);
      } else {
        addCotizacion({
          ...formData,
          fecha: new Date().toISOString().split('T')[0],
          estado: 'Borrador'
        } as Omit<Cotizacion, 'id' | 'numero'>);
      }
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      vigenciaDias: 30,
      items: [],
      observaciones: ''
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
      'Borrador': { class: 'bg-slate-500', icon: FileText },
      'Enviada': { class: 'bg-blue-500', icon: Send },
      'Aprobada': { class: 'bg-green-500', icon: CheckCircle },
      'Rechazada': { class: 'bg-red-500', icon: XCircle }
    };
    const { class: className, icon: Icon } = config[estado];
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
          <p className="text-slate-500">Crea y gestiona propuestas comerciales</p>
        </div>
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
              {/* Cliente y Vigencia */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select 
                    value={formData.clienteId} 
                    onValueChange={(v) => setFormData({...formData, clienteId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.razonSocial}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vigencia (días)</Label>
                  <Input 
                    type="number"
                    value={formData.vigenciaDias} 
                    onChange={e => setFormData({...formData, vigenciaDias: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Agregar Items */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-slate-700">Agregar Curso</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Select 
                      value={nuevoItem.cursoId} 
                      onValueChange={(v) => setNuevoItem({...nuevoItem, cursoId: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.filter(c => c.activo).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input 
                      type="number"
                      placeholder="Valor/participante"
                      value={nuevoItem.valorPorParticipante || ''} 
                      onChange={e => setNuevoItem({...nuevoItem, valorPorParticipante: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Input 
                      type="number"
                      placeholder="Cantidad"
                      value={nuevoItem.cantidadParticipantes || ''} 
                      onChange={e => setNuevoItem({...nuevoItem, cantidadParticipantes: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <Input 
                      type="number"
                      placeholder="Descuento %"
                      value={nuevoItem.descuento || ''} 
                      onChange={e => setNuevoItem({...nuevoItem, descuento: parseInt(e.target.value)})}
                    />
                  </div>
                  <Button type="button" onClick={agregarItem} variant="secondary">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Items agregados */}
              {formData.items && formData.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-700">Items de la Cotización</h4>
                  <div className="border rounded-lg divide-y">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.curso?.nombre}</p>
                          <p className="text-sm text-slate-500">
                            ${item.valorPorParticipante.toLocaleString('es-CL')} x {item.cantidadParticipantes} participantes
                            {item.descuento > 0 && ` (-${item.descuento}%)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            ${item.subtotal.toLocaleString('es-CL')}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => eliminarItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totales */}
              {formData.items && formData.items.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${formData.subtotal?.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (19%):</span>
                    <span>${formData.iva?.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${formData.total?.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Input 
                  value={formData.observaciones || ''} 
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Condiciones especiales, notas..."
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={!formData.items || formData.items.length === 0}>
                {cotizacionSeleccionada ? 'Guardar Cambios' : 'Crear Cotización'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            className="pl-10"
            placeholder="Buscar por número, cliente o estado..."
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
                    <h3 className="font-semibold text-slate-800">{cotizacion.numero}</h3>
                    {getEstadoBadge(cotizacion.estado)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users className="w-4 h-4" />
                      {cotizacion.cliente?.razonSocial}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {cotizacion.fecha}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <DollarSign className="w-4 h-4" />
                      ${cotizacion.total.toLocaleString('es-CL')}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cotizacion.items.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item.curso?.nombre} ({item.cantidadParticipantes} pers.)
                      </Badge>
                    ))}
                  </div>

                  {cotizacion.observaciones && (
                    <p className="text-sm text-slate-500 mt-2">{cotizacion.observaciones}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {cotizacion.estado === 'Borrador' && (
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
                      Aprobar
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
                      {cotizacion.estado === 'Borrador' && (
                        <DropdownMenuItem onClick={() => editarCotizacion(cotizacion)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => updateCotizacion(cotizacion.id, { estado: 'Rechazada' })}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
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
            <DialogTitle>Cotización {cotizacionSeleccionada?.numero}</DialogTitle>
          </DialogHeader>
          
          {cotizacionSeleccionada && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium">{cotizacionSeleccionada.cliente?.razonSocial}</p>
                  <p className="text-sm text-slate-500">RUT: {cotizacionSeleccionada.cliente?.rut}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-medium">{cotizacionSeleccionada.fecha}</p>
                  <p className="text-sm text-slate-500">
                    Vigencia: {cotizacionSeleccionada.vigenciaDias} días
                  </p>
                </div>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Curso</th>
                      <th className="text-right p-3 text-sm font-medium">Valor</th>
                      <th className="text-right p-3 text-sm font-medium">Cant.</th>
                      <th className="text-right p-3 text-sm font-medium">Desc.</th>
                      <th className="text-right p-3 text-sm font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cotizacionSeleccionada.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.curso?.nombre}</td>
                        <td className="p-3 text-right">
                          ${item.valorPorParticipante.toLocaleString('es-CL')}
                        </td>
                        <td className="p-3 text-right">{item.cantidadParticipantes}</td>
                        <td className="p-3 text-right">{item.descuento}%</td>
                        <td className="p-3 text-right font-medium">
                          ${item.subtotal.toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${cotizacionSeleccionada.subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (19%):</span>
                  <span>${cotizacionSeleccionada.iva.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ${cotizacionSeleccionada.total.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {cotizacionSeleccionada.ejecucionId && (
                <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">
                    Cotización aprobada - Ejecución creada
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
