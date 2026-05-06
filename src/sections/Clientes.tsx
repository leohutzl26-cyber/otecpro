import { useState } from 'react';
import { 
  Search, Plus, Building2, Mail, Phone, MapPin, 
  Edit, Trash2, MoreHorizontal, UserPlus, Users
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
import type { Cliente, Contacto, RegionChile } from '@/types';

// ============================================
// MÓDULO CLIENTES - ERP OTEC PRO
// ============================================

interface ClientesProps {
  store: Store;
}

const regionesChile: RegionChile[] = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
  'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
];

export default function Clientes({ store }: ClientesProps) {
  const { clientes, cotizaciones, ejecuciones, alumnos, addCliente, updateCliente, deleteCliente } = store;
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [archivoPreview, setArchivoPreview] = useState<any | null>(null);
  const [nuevoContacto, setNuevoContacto] = useState<Partial<Contacto>>({});

  // Formulario de cliente
  const [formData, setFormData] = useState<Partial<Cliente>>({
    rut: '',
    razonSocial: '',
    giro: '',
    direccion: '',
    comuna: '',
    region: 'Metropolitana',
    contactos: [],
    observaciones: ''
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  const clientesFiltrados = clientes.filter(c => 
    c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rut.includes(busqueda) ||
    c.giro.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itemsPorPagina);
  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina, 
    paginaActual * itemsPorPagina
  );

  // Resetear paginación al buscar
  const handleBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  const handleSubmit = () => {
    if (clienteSeleccionado) {
      updateCliente(clienteSeleccionado.id, formData);
    } else {
      addCliente(formData as Omit<Cliente, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      rut: '',
      razonSocial: '',
      giro: '',
      direccion: '',
      comuna: '',
      region: 'Metropolitana',
      contactos: [],
      observaciones: '',
      documentos: []
    });
    setClienteSeleccionado(null);
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setIsDialogOpen(true);
  };

  const verDetalle = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setIsDetailOpen(true);
    
    // Preview inicial si hay documentos
    const docs = (cliente as any).documentos || [];
    const firstPreview = docs.find((a: any) => 
      a.url.toLowerCase().endsWith('.pdf') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url)
    );
    setArchivoPreview(firstPreview || null);
  };

  const agregarContacto = () => {
    if (clienteSeleccionado && nuevoContacto.nombre) {
      const contacto: Contacto = {
        id: `con${Date.now()}`,
        nombre: nuevoContacto.nombre || '',
        cargo: nuevoContacto.cargo || '',
        email: nuevoContacto.email || '',
        telefono: nuevoContacto.telefono || '',
        esDecisor: nuevoContacto.esDecisor || false,
        esCoordinador: nuevoContacto.esCoordinador || false
      };
      
      updateCliente(clienteSeleccionado.id, {
        contactos: [...clienteSeleccionado.contactos, contacto]
      });
      
      setClienteSeleccionado({
        ...clienteSeleccionado,
        contactos: [...clienteSeleccionado.contactos, contacto]
      });
      
      setNuevoContacto({});
      setIsContactDialogOpen(false);
    }
  };

  const eliminarContacto = (contactoId: string) => {
    if (clienteSeleccionado) {
      const nuevosContactos = clienteSeleccionado.contactos.filter(c => c.id !== contactoId);
      updateCliente(clienteSeleccionado.id, { contactos: nuevosContactos });
      setClienteSeleccionado({ ...clienteSeleccionado, contactos: nuevosContactos });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Base de Datos de Clientes</h2>
          <p className="text-slate-500">Gestiona empresas y contactos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>RUT Empresa *</Label>
                <Input 
                  value={formData.rut} 
                  onChange={e => setFormData({...formData, rut: e.target.value})}
                  placeholder="76.123.456-7"
                />
              </div>
              <div className="space-y-2">
                <Label>Razón Social *</Label>
                <Input 
                  value={formData.razonSocial} 
                  onChange={e => setFormData({...formData, razonSocial: e.target.value})}
                  placeholder="Empresa S.A."
                />
              </div>
              <div className="space-y-2">
                <Label>Giro/Rubro *</Label>
                <Input 
                  value={formData.giro} 
                  onChange={e => setFormData({...formData, giro: e.target.value})}
                  placeholder="Actividad económica"
                />
              </div>
              <div className="space-y-2">
                <Label>Holding (opcional)</Label>
                <Input 
                  value={formData.holding || ''} 
                  onChange={e => setFormData({...formData, holding: e.target.value})}
                  placeholder="Grupo empresarial"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Dirección</Label>
                <Input 
                  value={formData.direccion} 
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Calle y número"
                />
              </div>
              <div className="space-y-2">
                <Label>Comuna</Label>
                <Input 
                  value={formData.comuna} 
                  onChange={e => setFormData({...formData, comuna: e.target.value})}
                  placeholder="Comuna"
                />
              </div>
              <div className="space-y-2">
                <Label>Región</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(v: RegionChile) => setFormData({...formData, region: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionesChile.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Observaciones</Label>
                <Input 
                  value={formData.observaciones || ''} 
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {clienteSeleccionado ? 'Guardar Cambios' : 'Crear Cliente'}
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
          placeholder="Buscar por RUT, razón social o giro..."
          value={busqueda}
          onChange={e => handleBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clientesPaginados.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => verDetalle(cliente)}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-800 hover:text-blue-700 transition-colors">{cliente.razonSocial}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">RUT: {cliente.rut}</p>
                  <p className="text-sm text-slate-600">{cliente.giro}</p>
                  
                  <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {cliente.comuna}, {cliente.region}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cliente.contactos.length} contactos
                    </Badge>
                    {cliente.holding && (
                      <Badge variant="outline">{cliente.holding}</Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => verDetalle(cliente)}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editarCliente(cliente)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setClienteSeleccionado(cliente);
                      setIsContactDialogOpen(true);
                    }}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Agregar Contacto
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => deleteCliente(cliente.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contactos */}
              {cliente.contactos.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-slate-500 mb-2">CONTACTOS</p>
                  <div className="space-y-2">
                    {cliente.contactos.map((contacto) => (
                      <div key={contacto.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{contacto.nombre}</span>
                            {contacto.esDecisor && <Badge className="text-xs bg-purple-500">Decisor</Badge>}
                            {contacto.esCoordinador && <Badge className="text-xs bg-blue-500">Coordinador</Badge>}
                          </div>
                          <p className="text-xs text-slate-500">{contacto.cargo}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contacto.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contacto.telefono}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => eliminarContacto(contacto.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo para agregar contacto */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Contacto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input 
                value={nuevoContacto.nombre || ''} 
                onChange={e => setNuevoContacto({...nuevoContacto, nombre: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo *</Label>
              <Input 
                value={nuevoContacto.cargo || ''} 
                onChange={e => setNuevoContacto({...nuevoContacto, cargo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email"
                value={nuevoContacto.email || ''} 
                onChange={e => setNuevoContacto({...nuevoContacto, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input 
                value={nuevoContacto.telefono || ''} 
                onChange={e => setNuevoContacto({...nuevoContacto, telefono: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={nuevoContacto.esDecisor || false}
                  onChange={e => setNuevoContacto({...nuevoContacto, esDecisor: e.target.checked})}
                />
                <span className="text-sm">Decisor de compra</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={nuevoContacto.esCoordinador || false}
                  onChange={e => setNuevoContacto({...nuevoContacto, esCoordinador: e.target.checked})}
                />
                <span className="text-sm">Coordinador de capacitación</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancelar</Button>
            <Button onClick={agregarContacto}>Agregar Contacto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-500">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>

    {/* Diálogo de Detalle Expandido - ERP OTEC PRO */}
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="max-w-none sm:max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span>Ficha Corporativa: {clienteSeleccionado?.razonSocial}</span>
                <p className="text-sm text-slate-500 font-normal">RUT: {clienteSeleccionado?.rut} • {clienteSeleccionado?.giro}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {clienteSeleccionado && (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Panel Izquierdo: Resumen Corporativo */}
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r bg-slate-50/50 space-y-6">
              <div className="space-y-4">
                <div className="p-5 bg-white border rounded-xl shadow-sm space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Información General</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">RUT:</span>
                        <span className="text-sm font-medium">{clienteSeleccionado.rut}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Holding:</span>
                        <span className="text-sm font-medium">{clienteSeleccionado.holding || 'Independiente'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Ubicación:</span>
                        <span className="text-sm font-medium">{clienteSeleccionado.comuna}, {clienteSeleccionado.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Dirección Fiscal</p>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {clienteSeleccionado.direccion}
                    </p>
                  </div>
                </div>

                {/* Estadísticas Consolidadas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Cots.</p>
                    <p className="font-bold text-lg text-blue-600">
                      {cotizaciones.filter(c => c.clienteId === clienteSeleccionado.id).length}
                    </p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Ejecs.</p>
                    <p className="font-bold text-lg text-green-600">
                      {ejecuciones.filter(e => e.clienteId === clienteSeleccionado.id).length}
                    </p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Alumnos</p>
                    <p className="font-bold text-lg text-purple-600">
                      {alumnos.filter(a => a.empresaId === clienteSeleccionado.id).length}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Observaciones</h4>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {clienteSeleccionado.observaciones || 'Sin observaciones registradas para este cliente.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Documentación Legal</h4>
                {(!(clienteSeleccionado as any).documentos || (clienteSeleccionado as any).documentos.length === 0) ? (
                  <div className="text-center py-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Sin documentos cargados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {(clienteSeleccionado as any).documentos.map((a: any) => (
                      <button 
                        key={a.id} 
                        onClick={() => setArchivoPreview(a)}
                        className={`flex items-center gap-3 p-3 bg-white border rounded-lg text-left transition-all hover:border-blue-600 ${archivoPreview?.id === a.id ? 'border-blue-600 ring-1 ring-blue-600/20' : 'border-slate-200'}`}
                      >
                        <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0">
                          {a.url.toLowerCase().endsWith('.pdf') ? <FileText className="w-4 h-4 text-red-500" /> : <Building2 className="w-4 h-4 text-slate-400" />}
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">{a.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full text-xs" size="sm">
                  <Plus className="w-3 h-3 mr-2" />
                  Adjuntar Archivo
                </Button>
              </div>
            </div>

            {/* Panel Derecho: Tabs de Gestión */}
            <div className="flex-1 flex flex-col bg-slate-100/30">
              <Tabs defaultValue="contactos" className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b px-6 overflow-x-auto">
                  <TabsList className="bg-transparent border-b-0 h-14 gap-6 inline-flex">
                    <TabsTrigger value="contactos" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14 whitespace-nowrap">
                      Contactos ({clienteSeleccionado.contactos.length})
                    </TabsTrigger>
                    <TabsTrigger value="cotizaciones" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14 whitespace-nowrap">
                      Cotizaciones
                    </TabsTrigger>
                    <TabsTrigger value="ejecuciones" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14 whitespace-nowrap">
                      Ejecuciones
                    </TabsTrigger>
                    <TabsTrigger value="alumnos" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14 whitespace-nowrap">
                      Alumnos
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 h-14 whitespace-nowrap">
                      Vista Previa
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="contactos" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-800">Directorio de Contactos</h4>
                      <Button size="sm" onClick={() => setIsContactDialogOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Contacto
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clienteSeleccionado.contactos.map((contacto) => (
                        <div key={contacto.id} className="p-4 bg-white border rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800">{contacto.nombre}</p>
                                {contacto.esDecisor && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Decisor</Badge>}
                              </div>
                              <p className="text-sm text-slate-500">{contacto.cargo}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => eliminarContacto(contacto.id)} className="text-red-400 hover:text-red-600 h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-4 pt-3 border-t grid grid-cols-1 gap-2">
                            <p className="text-sm flex items-center gap-2 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" /> {contacto.email}
                            </p>
                            <p className="text-sm flex items-center gap-2 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" /> {contacto.telefono}
                            </p>
                            {contacto.esCoordinador && (
                              <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Coordinador SENCE
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {clienteSeleccionado.contactos.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>No se han registrado contactos para esta empresa.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="cotizaciones" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {cotizaciones
                        .filter(c => c.clienteId === clienteSeleccionado.id)
                        .map((cot) => (
                          <div key={cot.id} className="p-4 bg-white border rounded-lg flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{cot.nombre}</p>
                              <p className="text-xs text-slate-500">Folio: {cot.codigoUnico || cot.numero} • Fecha: {cot.fechaPropuesta}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">${(cot.precio || 0).toLocaleString('es-CL')}</p>
                              <Badge variant="outline" className={
                                cot.estado === 'Aceptada' ? 'text-green-600 border-green-200 bg-green-50' :
                                cot.estado === 'Cancelada' ? 'text-red-600 border-red-200 bg-red-50' :
                                'text-blue-600 border-blue-200 bg-blue-50'
                              }>
                                {cot.estado}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      {cotizaciones.filter(c => c.clienteId === clienteSeleccionado.id).length === 0 && (
                        <p className="text-center py-12 text-slate-400">Sin historial de cotizaciones.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="ejecuciones" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {ejecuciones
                        .filter(e => e.clienteId === clienteSeleccionado.id)
                        .map((ejec) => (
                          <div key={ejec.id} className="p-4 bg-white border rounded-lg flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">ID: {ejec.codigoPropio || ejec.id.substring(0,8)}</p>
                              <p className="text-sm text-slate-500">Periodo: {ejec.fechaInicio} al {ejec.fechaTermino}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-600">Estado</p>
                              <Badge className={
                                ejec.estado === 'Terminado' ? 'bg-green-500' :
                                ejec.estado === 'En Curso' ? 'bg-blue-500' :
                                'bg-slate-500'
                              }>
                                {ejec.estado}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      {ejecuciones.filter(e => e.clienteId === clienteSeleccionado.id).length === 0 && (
                        <p className="text-center py-12 text-slate-400">Sin ejecuciones registradas.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="alumnos" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alumnos
                        .filter(a => a.empresaId === clienteSeleccionado.id)
                        .map((alum) => (
                          <div key={alum.id} className="p-3 bg-white border rounded-lg flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold">
                              {alum.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800">{alum.nombre}</p>
                              <p className="text-xs text-slate-500">RUT: {alum.rut}</p>
                            </div>
                          </div>
                        ))}
                      {alumnos.filter(a => a.empresaId === clienteSeleccionado.id).length === 0 && (
                        <p className="col-span-full text-center py-12 text-slate-400">Sin alumnos vinculados.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0 h-full">
                    {archivoPreview ? (
                      <div className="h-full flex flex-col bg-white border rounded-xl overflow-hidden shadow-lg">
                        <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                          <span className="text-sm font-bold truncate">{archivoPreview.nombre}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a href={archivoPreview.url} target="_blank" rel="noopener noreferrer">Descargar</a>
                          </Button>
                        </div>
                        <div className="flex-1">
                          {archivoPreview.url.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={`${archivoPreview.url}#toolbar=0`} className="w-full h-full border-0" />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <img src={archivoPreview.url} className="max-w-full max-h-full object-contain" alt="Preview" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>No hay documento seleccionado para previsualizar.</p>
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
