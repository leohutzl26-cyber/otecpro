import React, { useState } from 'react';
import { Store } from '@/hooks/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building2, BellRing, Save, BadgeInfo, Users, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ConfiguracionProps {
  store: Store;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ store }) => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      store.addAlerta({
        tipo: 'Operativa',
        mensaje: 'Configuración guardada exitosamente.',
        fecha: new Date().toISOString().split('T')[0],
        prioridad: 'Baja'
      });
      toast.success('Configuración guardada exitosamente');
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configuración del Sistema</h2>
          <p className="text-slate-500">Administra los parámetros generales de la OTEC y del sistema.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8 h-auto p-1">
          <TabsTrigger value="perfil" className="flex items-center gap-2 py-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="otec" className="flex items-center gap-2 py-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden md:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="sence" className="flex items-center gap-2 py-2">
            <BadgeInfo className="w-4 h-4" />
            <span className="hidden md:inline">SENCE</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2 py-2">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2 py-2">
            <BellRing className="w-4 h-4" />
            <span className="hidden md:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2 py-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden md:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Personal</CardTitle>
              <CardDescription>
                Actualiza tu información personal y credenciales de acceso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-2 border-slate-100">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-semibold">AD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Cambiar foto</Button>
                  <p className="text-xs text-slate-500">JPG, GIF o PNG. Tamaño máximo de 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" defaultValue="Administrador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_user">Correo Electrónico</Label>
                  <Input id="email_user" type="email" defaultValue="admin@otecpro.cl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input id="password" type="password" placeholder="Dejar en blanco para mantener actual" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datos OTEC */}
        <TabsContent value="otec">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa (OTEC)</CardTitle>
              <CardDescription>
                Estos datos aparecerán en las cotizaciones, facturas y certificados generados por el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input id="razonSocial" defaultValue="Capacitaciones OTEC PRO SpA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" defaultValue="76.123.456-7" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección Comercial</Label>
                  <Input id="direccion" defaultValue="Av. Providencia 1234, Oficina 56, Santiago" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono de Contacto</Label>
                  <Input id="telefono" defaultValue="+56 9 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_otec">Correo Electrónico Comercial</Label>
                  <Input id="email_otec" defaultValue="contacto@otecpro.cl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sitioWeb">Sitio Web</Label>
                  <Input id="sitioWeb" defaultValue="www.otecpro.cl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SENCE */}
        <TabsContent value="sence">
          <Card>
            <CardHeader>
              <CardTitle>Configuración SENCE</CardTitle>
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

        {/* Usuarios */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
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

        {/* Notificaciones */}
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Alertas</CardTitle>
              <CardDescription>
                Configura qué eventos generan notificaciones dentro del sistema y por correo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Nuevas Cotizaciones Aprobadas</Label>
                    <p className="text-sm text-slate-500">Recibir alerta cuando un cliente aprueba una cotización.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Vencimiento de Documentos SAG</Label>
                    <p className="text-sm text-slate-500">Notificar 15 días antes que venza la colinesterasa o certificado.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Facturas Vencidas</Label>
                    <p className="text-sm text-slate-500">Avisar diariamente sobre ingresos no recaudados.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Resumen Semanal</Label>
                    <p className="text-sm text-slate-500">Enviar un email todos los lunes con el estado financiero.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="seguridad">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y Respaldo</CardTitle>
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
};

export default Configuracion;
