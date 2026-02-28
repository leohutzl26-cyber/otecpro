import { useState } from 'react';
import { 
  Search, Plus, BookOpen, Clock, Monitor, MapPin,
  Edit, Trash2, MoreHorizontal, FileText, CheckCircle,
  XCircle, Download, Paperclip, Upload, File, Image, Video, 
  Presentation, Trash
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Store } from '@/hooks/useStore';
import type { Curso, ModalidadCurso, ArchivoAdjunto, TipoArchivo } from '@/types';

// ============================================
// MÓDULO CATÁLOGO DE CURSOS - ERP OTEC PRO
// ============================================

interface CursosProps {
  store: Store;
}

const modalidades: ModalidadCurso[] = [
  'Presencial', 'E-learning Sincrónico', 'E-learning Asincrónico', 'Auto-instrucción'
];

const tipoArchivoIcons: Record<TipoArchivo, React.ElementType> = {
  temario: BookOpen,
  manual: FileText,
  presentacion: Presentation,
  video: Video,
  documento: File,
  imagen: Image,
  otro: File
};

const tipoArchivoLabels: Record<TipoArchivo, string> = {
  temario: 'Temario',
  manual: 'Manual',
  presentacion: 'Presentación',
  video: 'Video',
  documento: 'Documento',
  imagen: 'Imagen',
  otro: 'Otro'
};

export default function Cursos({ store }: CursosProps) {
  const { cursos, addCurso, updateCurso, deleteCurso, addArchivoAdjunto, deleteArchivoAdjunto } = store;
  const [busqueda, setBusqueda] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isArchivosOpen, setIsArchivosOpen] = useState(false);
  const [nuevoArchivo, setNuevoArchivo] = useState<Partial<ArchivoAdjunto>>({ tipo: 'documento', nombre: '', descripcion: '' });

  // Formulario
  const [formData, setFormData] = useState<Partial<Curso>>({
    codigoInterno: '',
    codigoSence: '',
    nombre: '',
    descripcion: '',
    horasTotales: 0,
    modalidad: 'Presencial',
    esSAG: false,
    activo: true
  });

  const cursosFiltrados = cursos.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigoInterno.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.codigoSence && c.codigoSence.includes(busqueda))
  );

  const handleSubmit = () => {
    if (cursoSeleccionado) {
      updateCurso(cursoSeleccionado.id, formData);
    } else {
      addCurso(formData as Omit<Curso, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      codigoInterno: '',
      codigoSence: '',
      nombre: '',
      descripcion: '',
      horasTotales: 0,
      modalidad: 'Presencial',
      esSAG: false,
      activo: true,
      archivosAdjuntos: []
    });
    setCursoSeleccionado(null);
  };

  const editarCurso = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setFormData(curso);
    setIsDialogOpen(true);
  };

  const verDetalle = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setIsDetailOpen(true);
  };

  const getModalidadIcon = (modalidad: ModalidadCurso) => {
    switch (modalidad) {
      case 'Presencial':
        return <MapPin className="w-4 h-4" />;
      case 'E-learning Sincrónico':
      case 'E-learning Asincrónico':
        return <Monitor className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo Maestro de Cursos</h2>
          <p className="text-slate-500">Gestiona los cursos disponibles para cotización</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{cursoSeleccionado ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código Interno *</Label>
                <Input 
                  value={formData.codigoInterno} 
                  onChange={e => setFormData({...formData, codigoInterno: e.target.value})}
                  placeholder="OTEC-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Código SENCE (opcional)</Label>
                <Input 
                  value={formData.codigoSence || ''} 
                  onChange={e => setFormData({...formData, codigoSence: e.target.value})}
                  placeholder="12345678"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Nombre del Curso *</Label>
                <Input 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Nombre completo del curso"
                />
              </div>
              <div className="space-y-2">
                <Label>Horas Totales *</Label>
                <Input 
                  type="number"
                  value={formData.horasTotales} 
                  onChange={e => setFormData({...formData, horasTotales: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Modalidad *</Label>
                <Select 
                  value={formData.modalidad} 
                  onValueChange={(v: ModalidadCurso) => setFormData({...formData, modalidad: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descripción</Label>
                <Textarea 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción detallada del curso..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Curso SAG</Label>
                  <p className="text-sm text-slate-500">Requiere documentación SAG</p>
                </div>
                <Switch 
                  checked={formData.esSAG} 
                  onCheckedChange={(v) => setFormData({...formData, esSAG: v})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Curso Activo</Label>
                  <p className="text-sm text-slate-500">Disponible para cotización</p>
                </div>
                <Switch 
                  checked={formData.activo} 
                  onCheckedChange={(v) => setFormData({...formData, activo: v})}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {cursoSeleccionado ? 'Guardar Cambios' : 'Crear Curso'}
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
          placeholder="Buscar por nombre, código interno o SENCE..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursosFiltrados.map((curso) => (
          <Card key={curso.id} className={`hover:shadow-md transition-shadow ${!curso.activo && 'opacity-60'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">
                      {curso.codigoInterno}
                    </Badge>
                    {curso.codigoSence && (
                      <Badge className="bg-blue-500 text-xs">SENCE {curso.codigoSence}</Badge>
                    )}
                    {curso.esSAG && (
                      <Badge className="bg-amber-500 text-xs">SAG</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mt-2">{curso.nombre}</h3>
                  
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {curso.descripcion}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {curso.horasTotales} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      {getModalidadIcon(curso.modalidad)}
                      {curso.modalidad}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => verDetalle(curso)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editarCurso(curso)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCursoSeleccionado(curso);
                      setIsArchivosOpen(true);
                    }}>
                      <Paperclip className="w-4 h-4 mr-2" />
                      Archivos ({curso.archivosAdjuntos.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateCurso(curso.id, { activo: !curso.activo })}
                    >
                      {curso.activo ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteCurso(curso.id)}
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
        ))}
      </div>

      {/* Diálogo de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{cursoSeleccionado?.nombre}</DialogTitle>
          </DialogHeader>
          
          {cursoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">
                  {cursoSeleccionado.codigoInterno}
                </Badge>
                {cursoSeleccionado.codigoSence && (
                  <Badge className="bg-blue-500">SENCE {cursoSeleccionado.codigoSence}</Badge>
                )}
                {cursoSeleccionado.esSAG && (
                  <Badge className="bg-amber-500">SAG</Badge>
                )}
                <Badge className={cursoSeleccionado.activo ? 'bg-green-500' : 'bg-slate-500'}>
                  {cursoSeleccionado.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Horas Totales</p>
                  <p className="font-semibold">{cursoSeleccionado.horasTotales} horas</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Modalidad</p>
                  <p className="font-semibold flex items-center gap-2">
                    {getModalidadIcon(cursoSeleccionado.modalidad)}
                    {cursoSeleccionado.modalidad}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Descripción</p>
                <p className="text-slate-700">{cursoSeleccionado.descripcion}</p>
              </div>

              {cursoSeleccionado.esSAG && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Requisitos SAG</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Examen de colinesterasa (vigencia 90 días)</li>
                    <li>• Certificado médico</li>
                    <li>• Poder simple para retiro de credenciales</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Temario
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsArchivosOpen(true)}>
                  <Paperclip className="w-4 h-4 mr-2" />
                  Archivos ({cursoSeleccionado.archivosAdjuntos.length})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Archivos Adjuntos */}
      <Dialog open={isArchivosOpen} onOpenChange={setIsArchivosOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Archivos Adjuntos - {cursoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          {cursoSeleccionado && (
            <div className="space-y-6">
              {/* Formulario para agregar archivo */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                <h4 className="font-medium text-slate-700">Agregar Nuevo Archivo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del archivo</Label>
                    <Input 
                      value={nuevoArchivo.nombre} 
                      onChange={e => setNuevoArchivo({...nuevoArchivo, nombre: e.target.value})}
                      placeholder="Ej: Temario del curso.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de archivo</Label>
                    <Select 
                      value={nuevoArchivo.tipo} 
                      onValueChange={(v: TipoArchivo) => setNuevoArchivo({...nuevoArchivo, tipo: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(tipoArchivoLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Descripción (opcional)</Label>
                    <Input 
                      value={nuevoArchivo.descripcion || ''} 
                      onChange={e => setNuevoArchivo({...nuevoArchivo, descripcion: e.target.value})}
                      placeholder="Breve descripción del archivo..."
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>URL del archivo</Label>
                    <Input 
                      value={nuevoArchivo.url || ''} 
                      onChange={e => setNuevoArchivo({...nuevoArchivo, url: e.target.value})}
                      placeholder="https://ejemplo.com/archivo.pdf"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (nuevoArchivo.nombre && nuevoArchivo.url) {
                      addArchivoAdjunto(cursoSeleccionado.id, nuevoArchivo as Omit<ArchivoAdjunto, 'id' | 'fechaSubida'>);
                      setNuevoArchivo({ tipo: 'documento', nombre: '', descripcion: '' });
                    }
                  }}
                  disabled={!nuevoArchivo.nombre || !nuevoArchivo.url}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Agregar Archivo
                </Button>
              </div>

              {/* Lista de archivos */}
              <div>
                <h4 className="font-medium text-slate-700 mb-3">
                  Archivos ({cursoSeleccionado.archivosAdjuntos.length})
                </h4>
                {cursoSeleccionado.archivosAdjuntos.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay archivos adjuntos</p>
                    <p className="text-sm">Agrega temarios, manuales, presentaciones y más</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cursoSeleccionado.archivosAdjuntos.map((archivo) => {
                      const IconComponent = tipoArchivoIcons[archivo.tipo];
                      return (
                        <div key={archivo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{archivo.nombre}</p>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Badge variant="secondary" className="text-xs">{tipoArchivoLabels[archivo.tipo]}</Badge>
                                {archivo.tamaño && <span>{(archivo.tamaño / 1024 / 1024).toFixed(2)} MB</span>}
                                <span>• {archivo.fechaSubida}</span>
                              </div>
                              {archivo.descripcion && (
                                <p className="text-sm text-slate-600 mt-1">{archivo.descripcion}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => deleteArchivoAdjunto(cursoSeleccionado.id, archivo.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
