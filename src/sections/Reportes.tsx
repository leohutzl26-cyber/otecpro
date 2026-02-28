import { useState } from 'react';
import { 
  TrendingUp, DollarSign, BarChart3, 
  PieChart, FileText, Download, Calendar, Filter,
  Building, GraduationCap, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import type { Store } from '@/hooks/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

// ============================================
// MÓDULO REPORTES - ERP OTEC PRO
// ============================================

interface ReportesProps {
  store: Store;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reportes({ store }: ReportesProps) {
  const { 
    ejecuciones, transacciones, cursos, clientes, getMargenCurso, 
    getEstadoResultados, getFlujoCaja 
  } = store;
  
  const [periodo, setPeriodo] = useState('2025-02');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('todos');

  // Datos para reportes
  const estadoResultados = getEstadoResultados('Febrero 2025');
  const flujoCaja = getFlujoCaja(30);

  // Márgenes por curso
  const margenesCursos = ejecuciones
    .filter(e => e.estado === 'Completado' || e.estado === 'En Ejecución')
    .map(e => {
      const margen = getMargenCurso(e.id);
      const curso = cursos.find(c => c.id === e.cursoId);
      const cliente = clientes.find(c => c.id === e.clienteId);
      return {
        nombre: curso?.nombre || 'Sin nombre',
        cliente: cliente?.razonSocial || 'Sin cliente',
        ingresos: margen.ingresosNetos,
        gastos: margen.gastosDirectos,
        margen: margen.margenBruto,
        margenPorcentaje: margen.margenPorcentaje
      };
    })
    .filter(m => m.ingresos > 0)
    .sort((a, b) => b.margen - a.margen);

  // Gastos por categoría
  const gastosPorCategoria = transacciones
    .filter(t => t.tipo === 'Egreso')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto.total;
      return acc;
    }, {} as Record<string, number>);

  const gastosCategoriaData = Object.entries(gastosPorCategoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Ingresos vs Egresos mensual
  const ingresosEgresosData = [
    { 
      name: 'Ingresos', 
      valor: transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto.total, 0),
      color: '#10b981'
    },
    { 
      name: 'Egresos Directos', 
      valor: transacciones.filter(t => t.tipo === 'Egreso' && t.esDirecto).reduce((sum, t) => sum + t.monto.total, 0),
      color: '#f59e0b'
    },
    { 
      name: 'Egresos Indirectos', 
      valor: transacciones.filter(t => t.tipo === 'Egreso' && !t.esDirecto).reduce((sum, t) => sum + t.monto.total, 0),
      color: '#ef4444'
    },
  ];

  // Flujo de caja
  const flujoData = flujoCaja.slice(0, 14).map(f => ({
    fecha: f.fecha.slice(5),
    ingresos: f.ingresosProyectados,
    egresos: f.egresosProyectados,
    saldo: f.saldoProyectado
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes y Dashboards</h2>
          <p className="text-slate-500">Análisis financiero y operacional</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-02">Febrero 2025</SelectItem>
              <SelectItem value="2025-01">Enero 2025</SelectItem>
              <SelectItem value="2024-12">Diciembre 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rentabilidad">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rentabilidad">Rentabilidad</TabsTrigger>
          <TabsTrigger value="flujo">Flujo de Caja</TabsTrigger>
          <TabsTrigger value="cursos">Por Curso</TabsTrigger>
          <TabsTrigger value="gastos">Análisis de Gastos</TabsTrigger>
        </TabsList>

        {/* Tab Rentabilidad */}
        <TabsContent value="rentabilidad" className="space-y-6">
          {/* Estado de Resultados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Estado de Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${estadoResultados.ingresosTotales.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Gastos Directos</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${estadoResultados.gastosDirectos.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Margen de Contribución</p>
                      <p className={`text-2xl font-bold ${estadoResultados.margenContribucion >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                        ${estadoResultados.margenContribucion.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <Badge className={estadoResultados.margenContribucion >= 0 ? 'bg-blue-500' : 'bg-amber-500'}>
                      {((estadoResultados.margenContribucion / estadoResultados.ingresosTotales) * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Gastos Indirectos</p>
                    <p className="text-xl font-bold text-slate-700">
                      ${estadoResultados.gastosIndirectos.toLocaleString('es-CL')}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg flex items-center justify-between ${estadoResultados.utilidadNeta >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div>
                      <p className={`text-sm ${estadoResultados.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Utilidad Neta
                      </p>
                      <p className={`text-3xl font-bold ${estadoResultados.utilidadNeta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${estadoResultados.utilidadNeta.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <Badge className={estadoResultados.utilidadNeta >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                      {estadoResultados.utilidadPorcentaje.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribución
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={ingresosEgresosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                    >
                      {ingresosEgresosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Flujo de Caja */}
        <TabsContent value="flujo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Proyección de Flujo de Caja (Próximos 14 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={flujoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos" strokeWidth={2} />
                  <Line type="monotone" dataKey="egresos" stroke="#ef4444" name="Egresos" strokeWidth={2} />
                  <Line type="monotone" dataKey="saldo" stroke="#3b82f6" name="Saldo" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ingresos Proyectados</p>
                    <p className="text-xl font-bold text-green-600">
                      ${flujoCaja.reduce((sum, f) => sum + f.ingresosProyectados, 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Egresos Proyectados</p>
                    <p className="text-xl font-bold text-red-600">
                      ${flujoCaja.reduce((sum, f) => sum + f.egresosProyectados, 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Saldo Neto</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${flujoCaja.reduce((sum, f) => sum + f.saldoProyectado, 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Por Curso */}
        <TabsContent value="cursos" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Rentabilidad por Curso
              </CardTitle>
              <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los cursos</SelectItem>
                  {cursos.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={margenesCursos.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={200} tick={{fontSize: 11}} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                  <Bar dataKey="margen" fill="#3b82f6" name="Margen" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Curso</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-right p-3">Ingresos</th>
                  <th className="text-right p-3">Gastos Directos</th>
                  <th className="text-right p-3">Margen</th>
                  <th className="text-center p-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {margenesCursos.map((curso, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-medium">{curso.nombre}</p>
                    </td>
                    <td className="p-3 text-sm text-slate-500">{curso.cliente}</td>
                    <td className="p-3 text-right text-green-600">
                      ${curso.ingresos.toLocaleString('es-CL')}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      ${curso.gastos.toLocaleString('es-CL')}
                    </td>
                    <td className={`p-3 text-right font-bold ${curso.margen >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                      ${curso.margen.toLocaleString('es-CL')}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={curso.margenPorcentaje >= 20 ? 'bg-green-500' : curso.margenPorcentaje >= 0 ? 'bg-blue-500' : 'bg-red-500'}>
                        {curso.margenPorcentaje.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab Análisis de Gastos */}
        <TabsContent value="gastos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Gastos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={gastosCategoriaData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {gastosCategoriaData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gastosCategoriaData.map((gasto, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{gasto.name}</span>
                          <span className="text-slate-600">
                            ${gasto.value.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              backgroundColor: COLORS[idx % COLORS.length],
                              width: `${(gasto.value / gastosCategoriaData[0].value) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo Directos vs Indirectos */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo: Gastos Directos vs Indirectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Gastos Directos</p>
                      <p className="text-sm text-blue-600">Imputados a cursos</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    ${transacciones
                      .filter(t => t.tipo === 'Egreso' && t.esDirecto)
                      .reduce((sum, t) => sum + t.monto.total, 0)
                      .toLocaleString('es-CL')}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {transacciones.filter(t => t.tipo === 'Egreso' && t.esDirecto).length} transacciones
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Gastos Indirectos</p>
                      <p className="text-sm text-slate-600">Gastos de administración</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-700">
                    ${transacciones
                      .filter(t => t.tipo === 'Egreso' && !t.esDirecto)
                      .reduce((sum, t) => sum + t.monto.total, 0)
                      .toLocaleString('es-CL')}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {transacciones.filter(t => t.tipo === 'Egreso' && !t.esDirecto).length} transacciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
