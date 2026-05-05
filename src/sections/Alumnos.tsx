import { useState } from 'react';
import { Search, GraduationCap, FileText, Upload, Plus, Download, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Store } from '@/hooks/useStore';

interface AlumnosProps {
  store: Store;
}

export default function Alumnos({ store }: AlumnosProps) {
  const { getTodosLosAlumnos } = store;
  const [busqueda, setBusqueda] = useState('');
  
  const alumnos = getTodosLosAlumnos();

  const alumnosFiltrados = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.cursoNombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const exportarCSV = () => {
    const encabezados = ['RUT', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Curso', 'Código Ejecución'];
    const filas = alumnosFiltrados.map(a => [
      a.rut,
      `"${a.nombre}"`,
      `"${a.apellido}"`,
      a.email || '',
      a.telefono || '',
      `"${a.cursoNombre}"`,
      a.ejecucionCodigo
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [encabezados.join(','), ...filas.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alumnos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Directorio de Alumnos
          </h2>
          <p className="text-slate-500">Listado global de participantes de todos los cursos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            className="pl-10"
            placeholder="Buscar por RUT, nombre, apellido o curso..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">RUT</th>
                  <th className="px-4 py-3">Nombre Completo</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Curso Asociado</th>
                  <th className="px-4 py-3">Ejecución</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumnosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron alumnos con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  alumnosFiltrados.map((alumno, idx) => (
                    <tr key={`${alumno.id}-${idx}`} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700">{alumno.rut}</td>
                      <td className="px-4 py-3">
                        {alumno.nombre} {alumno.apellido}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-500">{alumno.email || 'Sin email'}</div>
                        <div className="text-xs text-slate-500">{alumno.telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]" title={alumno.cursoNombre}>
                        {alumno.cursoNombre}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{alumno.ejecucionCodigo}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          Ir a Ejecución
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
