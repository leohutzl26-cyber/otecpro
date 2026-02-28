import { useState } from 'react';
import { 
  Search, Plus, ArrowDownLeft, ArrowUpRight, FileText, 
  CheckCircle, AlertCircle, MoreHorizontal,
  TrendingUp, TrendingDown, 
  Building
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { Store } from '@/hooks/useStore';
import type { Transaccion, CategoriaGasto } from '@/types';

// ============================================
// MÓDULO FINANZAS - ERP OTEC PRO
// ============================================

interface FinanzasProps {
  store: Store;
}

const categoriasIngreso: CategoriaGasto[] = ['Honorarios'];
const categoriasEgresoDirecto: CategoriaGasto[] = ['Honorarios', 'Materiales', 'Viaticos', 'Colaciones', 'Traslados', 'Arriendo Sala'];
const categoriasEgresoIndirecto: CategoriaGasto[] = ['Combustible', 'Sueldos', 'Arriendo Oficina', 'Insumos', 'Otros'];

export default function Finanzas({ store }: FinanzasProps) {
  const { 
    transacciones, ejecuciones, clientes, addTransaccion, 
    registrarPago, emitirNotaCredito 
  } = store;
  
  const [busqueda, setBusqueda] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotaCreditoOpen, setIsNotaCreditoOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Transaccion | null>(null);
  const [montoNC, setMontoNC] = useState(0);
  const [motivoNC, setMotivoNC] = useState('');

  // Formulario
  const [formData, setFormData] = useState<Partial<Transaccion>>({
    tipo: 'Ingreso',
    categoria: 'Honorarios',
    esDirecto: true,
    idEjecucion: '',
    clienteId: '',
    monto: { neto: 0, iva: 0, total: 0 },
    metadatos: { nroDocumento: '', descripcion: '' },
    tracking: { fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento: '', pagado: false }
  });

  const transaccionesFiltradas = transacciones.filter(t => 
    t.metadatos.nroDocumento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.metadatos.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularIVA = (neto: number) => neto * 0.19;

  const handleNetoChange = (neto: number) => {
    const iva = calcularIVA(neto);
    setFormData({
      ...formData,
      monto: { neto, iva, total: neto + iva }
    });
  };

  const handleSubmit = () => {
    addTransaccion(formData as Omit<Transaccion, 'id'>);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tipo: 'Ingreso',
      categoria: 'Honorarios',
      esDirecto: true,
      idEjecucion: '',
      clienteId: '',
      monto: { neto: 0, iva: 0, total: 0 },
      metadatos: { nroDocumento: '', descripcion: '' },
      tracking: { fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento: '', pagado: false }
    });
  };

  const emitirNC = () => {
    if (facturaSeleccionada && montoNC > 0) {
      emitirNotaCredito(facturaSeleccionada.id, montoNC, motivoNC);
      setIsNotaCreditoOpen(false);
      setMontoNC(0);
      setMotivoNC('');
      setFacturaSeleccionada(null);
    }
  };

  // Resumen financiero
  const ingresosTotal = transacciones
    .filter(t => t.tipo === 'Ingreso')
    .reduce((sum, t) => sum + t.monto.total, 0);
  
  const ingresosPendientes = transacciones
    .filter(t => t.tipo === 'Ingreso' && !t.tracking.pagado)
    .reduce((sum, t) => sum + (t.saldoPendiente || t.monto.total), 0);

  const egresosDirectos = transacciones
    .filter(t => t.tipo === 'Egreso' && t.esDirecto)
    .reduce((sum, t) => sum + t.monto.total, 0);

  const egresosIndirectos = transacciones
    .filter(t => t.tipo === 'Egreso' && !t.esDirecto)
    .reduce((sum, t) => sum + t.monto.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión Financiera</h2>
          <p className="text-slate-500">Control de ingresos, egresos y flujo de caja</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Transacción</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                    <input 
                      type="radio" 
                      name="tipo"
                      checked={formData.tipo === 'Ingreso'}
                      onChange={() => setFormData({...formData, tipo: 'Ingreso', categoria: 'Honorarios'})}
                    />
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    <span>Ingreso</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                    <input 
                      type="radio" 
                      name="tipo"
                      checked={formData.tipo === 'Egreso'}
                      onChange={() => setFormData({...formData, tipo: 'Egreso', categoria: 'Honorarios'})}
                    />
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                    <span>Egreso</span>
                  </label>
                </div>
              </div>

              {/* Es Directo */}
              {formData.tipo === 'Egreso' && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Gasto Directo (Costo de Venta)</Label>
                    <p className="text-sm text-slate-500">Se imputa a un curso específico</p>
                  </div>
                  <Switch 
                    checked={formData.esDirecto} 
                    onCheckedChange={(v) => setFormData({...formData, esDirecto: v})}
                  />
                </div>
              )}

              {/* Categoría */}
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(v: CategoriaGasto) => setFormData({...formData, categoria: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.tipo === 'Ingreso' 
                      ? categoriasIngreso 
                      : formData.esDirecto 
                        ? categoriasEgresoDirecto 
                        : categoriasEgresoIndirecto
                    ).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vinculación */}
              {formData.tipo === 'Ingreso' && (
                <div className="space-y-2">
                  <Label>Cliente</Label>
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
              )}

              {(formData.tipo === 'Egreso' && formData.esDirecto) || formData.tipo === 'Ingreso' ? (
                <div className="space-y-2">
                  <Label>Curso/Ejecución</Label>
                  <Select 
                    value={formData.idEjecucion} 
                    onValueChange={(v) => setFormData({...formData, idEjecucion: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ejecución" />
                    </SelectTrigger>
                    <SelectContent>
                      {ejecuciones.map(e => {
                        const curso = store.cursos.find(c => c.id === e.cursoId);
                        const cliente = clientes.find(c => c.id === e.clienteId);
                        return (
                          <SelectItem key={e.id} value={e.id}>
                            {curso?.nombre} - {cliente?.razonSocial}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {/* Campos específicos */}
              {formData.categoria === 'Combustible' && !formData.esDirecto && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patente Vehículo</Label>
                    <Input 
                      value={formData.metadatos?.patenteVehiculo || ''} 
                      onChange={e => setFormData({
                        ...formData, 
                        metadatos: {...formData.metadatos, patenteVehiculo: e.target.value}
                      })}
                      placeholder="ABCD-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kilometraje</Label>
                    <Input 
                      type="number"
                      value={formData.metadatos?.kilometraje || ''} 
                      onChange={e => setFormData({
                        ...formData, 
                        metadatos: {...formData.metadatos, kilometraje: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              )}

              {/* Montos */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Monto Neto *</Label>
                  <Input 
                    type="number"
                    value={formData.monto?.neto || ''} 
                    onChange={e => handleNetoChange(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IVA (19%)</Label>
                  <Input 
                    type="number"
                    value={formData.monto?.iva || ''} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total</Label>
                  <Input 
                    type="number"
                    value={formData.monto?.total || ''} 
                    disabled
                    className="font-bold"
                  />
                </div>
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label>Número Documento *</Label>
                <Input 
                  value={formData.metadatos?.nroDocumento} 
                  onChange={e => setFormData({
                    ...formData, 
                    metadatos: {...formData.metadatos, nroDocumento: e.target.value}
                  })}
                  placeholder="F-001-12345"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Emisión *</Label>
                  <Input 
                    type="date"
                    value={formData.tracking?.fechaEmision} 
                    onChange={e => setFormData({
                      ...formData, 
                      tracking: {...formData.tracking, fechaEmision: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Vencimiento</Label>
                  <Input 
                    type="date"
                    value={formData.tracking?.fechaVencimiento} 
                    onChange={e => setFormData({
                      ...formData, 
                      tracking: {...formData.tracking, fechaVencimiento: e.target.value}
                    })}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input 
                  value={formData.metadatos?.descripcion || ''} 
                  onChange={e => setFormData({
                    ...formData, 
                    metadatos: {...formData.metadatos, descripcion: e.target.value}
                  })}
                  placeholder="Descripción del gasto/ingreso..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>Guardar Transacción</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  ${ingresosTotal.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Por Cobrar</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${ingresosPendientes.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Gastos Directos</p>
                <p className="text-2xl font-bold text-red-600">
                  ${egresosDirectos.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Gastos Indirectos</p>
                <p className="text-2xl font-bold text-slate-600">
                  ${egresosIndirectos.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="egresos">Egresos</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              className="pl-10"
              placeholder="Buscar por número, categoría o descripción..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* Lista */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Documento</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Entidad</th>
                  <th className="text-right p-3">Monto</th>
                  <th className="text-center p-3">Estado</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transaccionesFiltradas.map((t) => {
                  const ejecucion = ejecuciones.find(e => e.id === t.idEjecucion);
                  const curso = store.cursos.find(c => c.id === ejecucion?.cursoId);
                  const cliente = clientes.find(c => c.id === t.clienteId);
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {t.tipo === 'Ingreso' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : t.tipo === 'Egreso' ? (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-600" />
                          )}
                          <div>
                            <p className="font-medium">{t.metadatos.nroDocumento}</p>
                            <p className="text-xs text-slate-500">{t.tracking.fechaEmision}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{t.categoria}</Badge>
                        {t.esDirecto && <Badge className="ml-1 bg-blue-500 text-xs">Directo</Badge>}
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{cliente?.razonSocial || curso?.nombre || 'N/A'}</p>
                      </td>
                      <td className="p-3 text-right">
                        <p className={`font-semibold ${
                          t.tipo === 'Ingreso' ? 'text-green-600' : 
                          t.tipo === 'NotaCredito' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {t.tipo === 'Ingreso' ? '+' : t.tipo === 'NotaCredito' ? '-' : '-'}
                          ${t.monto.total.toLocaleString('es-CL')}
                        </p>
                        {t.saldoPendiente !== undefined && t.saldoPendiente > 0 && (
                          <p className="text-xs text-amber-600">
                            Pendiente: ${t.saldoPendiente.toLocaleString('es-CL')}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {t.tipo !== 'NotaCredito' && (
                          <Badge className={t.tracking.pagado ? 'bg-green-500' : 'bg-amber-500'}>
                            {t.tracking.pagado ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!t.tracking.pagado && t.tipo === 'Ingreso' && (
                              <DropdownMenuItem onClick={() => {
                                setFacturaSeleccionada(t);
                                setIsNotaCreditoOpen(true);
                              }}>
                                <FileText className="w-4 h-4 mr-2" />
                                Emitir Nota de Crédito
                              </DropdownMenuItem>
                            )}
                            {!t.tracking.pagado && (
                              <DropdownMenuItem onClick={() => registrarPago(t.id, new Date().toISOString().split('T')[0])}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Registrar Pago
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="ingresos">
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Documento</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Curso</th>
                  <th className="text-right p-3">Monto</th>
                  <th className="text-center p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transacciones
                  .filter(t => t.tipo === 'Ingreso')
                  .map((t) => {
                    const ejecucion = ejecuciones.find(e => e.id === t.idEjecucion);
                    const curso = store.cursos.find(c => c.id === ejecucion?.cursoId);
                    const cliente = clientes.find(c => c.id === t.clienteId);
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-medium">{t.metadatos.nroDocumento}</p>
                          <p className="text-xs text-slate-500">{t.tracking.fechaEmision}</p>
                        </td>
                        <td className="p-3">{cliente?.razonSocial}</td>
                        <td className="p-3">{curso?.nombre}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          +${t.monto.total.toLocaleString('es-CL')}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={t.tracking.pagado ? 'bg-green-500' : 'bg-amber-500'}>
                            {t.tracking.pagado ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="egresos">
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Documento</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Monto</th>
                  <th className="text-center p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transacciones
                  .filter(t => t.tipo === 'Egreso')
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-medium">{t.metadatos.nroDocumento}</p>
                        <p className="text-xs text-slate-500">{t.tracking.fechaEmision}</p>
                      </td>
                      <td className="p-3">{t.categoria}</td>
                      <td className="p-3">
                        <Badge className={t.esDirecto ? 'bg-blue-500' : 'bg-slate-500'}>
                          {t.esDirecto ? 'Directo' : 'Indirecto'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-red-600 font-semibold">
                        -${t.monto.total.toLocaleString('es-CL')}
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
        </TabsContent>

        <TabsContent value="pendientes">
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Documento</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Monto</th>
                  <th className="text-center p-3">Vencimiento</th>
                  <th className="text-center p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transacciones
                  .filter(t => !t.tracking.pagado && t.tipo !== 'NotaCredito')
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-medium">{t.metadatos.nroDocumento}</p>
                        <p className="text-xs text-slate-500">{t.metadatos.descripcion}</p>
                      </td>
                      <td className="p-3">
                        <Badge className={t.tipo === 'Ingreso' ? 'bg-green-500' : 'bg-red-500'}>
                          {t.tipo === 'Ingreso' ? 'Por Cobrar' : 'Por Pagar'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ${(t.saldoPendiente || t.monto.total).toLocaleString('es-CL')}
                      </td>
                      <td className="p-3 text-center">
                        {t.tracking.fechaVencimiento || 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <Button 
                          size="sm" 
                          onClick={() => registrarPago(t.id, new Date().toISOString().split('T')[0])}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registrar Pago
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo Nota de Crédito */}
      <Dialog open={isNotaCreditoOpen} onOpenChange={setIsNotaCreditoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emitir Nota de Crédito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Factura Original</p>
              <p className="font-medium">{facturaSeleccionada?.metadatos.nroDocumento}</p>
              <p className="text-sm">
                Monto: ${facturaSeleccionada?.monto.total.toLocaleString('es-CL')}
              </p>
              <p className="text-sm">
                Saldo Pendiente: ${facturaSeleccionada?.saldoPendiente?.toLocaleString('es-CL')}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Monto Nota de Crédito *</Label>
              <Input 
                type="number"
                value={montoNC || ''} 
                onChange={e => setMontoNC(parseInt(e.target.value) || 0)}
                max={facturaSeleccionada?.saldoPendiente}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Input 
                value={motivoNC} 
                onChange={e => setMotivoNC(e.target.value)}
                placeholder="Descuento acordado, error en facturación, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotaCreditoOpen(false)}>Cancelar</Button>
            <Button 
              onClick={emitirNC}
              disabled={montoNC <= 0 || montoNC > (facturaSeleccionada?.saldoPendiente || 0) || !motivoNC}
            >
              Emitir Nota de Crédito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
