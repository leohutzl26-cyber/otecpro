import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Building, Users, ShieldAlert, BadgeInfo } from 'lucide-react';
import { StoreState } from '@/hooks/useStore';

interface ConfiguracionProps {
  store: StoreState;
}

export default function Configuracion({ store }: ConfiguracionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      store.addAlerta('Configuración guardada exitosamente.', 'Operativa', 'Baja');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Administra los parámetros generales de la OTEC y del sistema.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[600px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sence">SENCE</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Datos de la Empresa
              </CardTitle>
              <CardDescription>
                Información pública que aparecerá en cotizaciones y reportes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Razón Social</Label>
                  <Input id="nombre" defaultValue="Otec Pro SpA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" defaultValue="76.123.456-7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección Comercial</Label>
                  <Input id="direccion" defaultValue="Av. Providencia 1234, Of 501" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono de Contacto</Label>
                  <Input id="telefono" defaultValue="+56 9 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" defaultValue="contacto@otecpro.cl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeInfo className="w-5 h-5 text-green-600" />
                Configuración SENCE
              </CardTitle>
              <CardDescription>
                Parámetros necesarios para la integración y reportes SENCE.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigoOtec">Código SENCE OTEC</Label>
                  <Input id="codigoOtec" defaultValue="123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vigencia">Vigencia Examen Colinesterasa (Días)</Label>
                  <Input id="vigencia" type="number" defaultValue="365" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra los usuarios que tienen acceso al sistema (En desarrollo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border border-dashed rounded-lg bg-slate-50">
                <p className="text-slate-500 mb-4">La gestión completa de usuarios y roles estará disponible próximamente.</p>
                <Button variant="outline">Invitar Nuevo Usuario</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Seguridad y Respaldo
              </CardTitle>
              <CardDescription>
                Opciones de copia de seguridad y seguridad de la cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between border p-4 rounded-lg">
                 <div>
                    <h4 className="font-semibold text-sm">Copia de Seguridad de Datos</h4>
                    <p className="text-sm text-muted-foreground">Descarga todos los datos de la plataforma en formato JSON.</p>
                 </div>
                 <Button variant="outline">Descargar Backup</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
