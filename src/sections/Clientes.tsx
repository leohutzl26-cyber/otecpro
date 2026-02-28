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
  const { clientes, addCliente, updateCliente, deleteCliente } = store;
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
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

  const clientesFiltrados = clientes.filter(c => 
    c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rut.includes(busqueda) ||
    c.giro.toLowerCase().includes(busqueda.toLowerCase())
  );

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
      observaciones: ''
    });
    setClienteSeleccionado(null);
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setIsDialogOpen(true);
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
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-800">{cliente.razonSocial}</h3>
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
    </div>
  );
}
