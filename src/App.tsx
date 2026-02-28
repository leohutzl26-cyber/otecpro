import { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  DollarSign, Calendar, BarChart3, Settings, Menu, 
  X, Bell, User, LogOut, ChevronDown, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/hooks/useStore';

// Módulos
import Dashboard from '@/sections/Dashboard';
import Clientes from '@/sections/Clientes';
import Cotizaciones from '@/sections/Cotizaciones';
import Cursos from '@/sections/Cursos';
import Ejecuciones from '@/sections/Ejecuciones';
import Relatores from '@/sections/Relatores';
import Finanzas from '@/sections/Finanzas';
import Calendario from '@/sections/Calendario';
import Reportes from '@/sections/Reportes';

// ============================================
// ERP OTEC PRO - APLICACIÓN PRINCIPAL
// ============================================

type Modulo = 'dashboard' | 'clientes' | 'cotizaciones' | 'cursos' | 'ejecuciones' | 
              'relatores' | 'finanzas' | 'calendario' | 'reportes' | 'configuracion';

interface MenuItem {
  id: Modulo;
  label: string;
  icon: React.ElementType;
  subItems?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'clientes', 
    label: 'Comercial', 
    icon: Briefcase,
    subItems: [
      { id: 'clientes', label: 'Clientes' },
      { id: 'cotizaciones', label: 'Cotizaciones' }
    ]
  },
  { id: 'cursos', label: 'Catálogo de Cursos', icon: BookOpen },
  { id: 'ejecuciones', label: 'Ejecuciones', icon: GraduationCap },
  { id: 'relatores', label: 'Relatores', icon: Users },
  { 
    id: 'finanzas', 
    label: 'Finanzas', 
    icon: DollarSign,
    subItems: [
      { id: 'finanzas', label: 'Ingresos y Egresos' },
      { id: 'reportes', label: 'Reportes P&L' }
    ]
  },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

function App() {
  const [moduloActivo, setModuloActivo] = useState<Modulo>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submenuAbierto, setSubmenuAbierto] = useState<string | null>(null);
  
  const store = useStore();
  const { alertas, dismissAlerta } = store;

  const alertasPendientes = alertas.filter(a => a.prioridad === 'Alta').length;

  const toggleSubmenu = (id: string) => {
    setSubmenuAbierto(submenuAbierto === id ? null : id);
  };

  const renderModulo = () => {
    switch (moduloActivo) {
      case 'dashboard':
        return <Dashboard store={store} onNavigate={setModuloActivo} />;
      case 'clientes':
        return <Clientes store={store} />;
      case 'cotizaciones':
        return <Cotizaciones store={store} />;
      case 'cursos':
        return <Cursos store={store} />;
      case 'ejecuciones':
        return <Ejecuciones store={store} />;
      case 'relatores':
        return <Relatores store={store} />;
      case 'finanzas':
        return <Finanzas store={store} />;
      case 'calendario':
        return <Calendario store={store} />;
      case 'reportes':
        return <Reportes store={store} />;
      case 'configuracion':
        return <Dashboard store={store} onNavigate={setModuloActivo} />;
      default:
        return <Dashboard store={store} onNavigate={setModuloActivo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#1E3A5F] text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#2a4a73]">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img 
                src="/logo-facilita.png" 
                alt="Facilita" 
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-[#84CC16] rounded-lg flex items-center justify-center mx-auto">
              <span className="text-[#1E3A5F] font-bold text-lg">F</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-300 hover:text-white hover:bg-[#2a4a73]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Menú */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleSubmenu(item.id);
                  } else {
                    setModuloActivo(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  moduloActivo === item.id 
                    ? 'bg-[#84CC16] text-[#1E3A5F] font-semibold' 
                    : 'text-slate-300 hover:bg-[#2a4a73] hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.subItems && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${submenuAbierto === item.id ? 'rotate-180' : ''}`} />
                    )}
                  </>
                )}
              </button>
              
              {/* Submenú */}
              {sidebarOpen && item.subItems && submenuAbierto === item.id && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#2a4a73] pl-3">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setModuloActivo(sub.id as Modulo)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        moduloActivo === sub.id 
                          ? 'text-[#84CC16] font-medium' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Versión */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2a4a73]">
            <p className="text-xs text-slate-400 text-center">Facilita ERP v1.0.0</p>
          </div>
        )}
      </aside>

      {/* Contenido Principal */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              {menuItems.find(m => m.id === moduloActivo)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  {alertasPendientes > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#84CC16] text-[#1E3A5F]">
                      {alertasPendientes}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm">Alertas Pendientes</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {alertas.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 text-center">No hay alertas pendientes</p>
                  ) : (
                    alertas.map((alerta) => (
                      <div key={alerta.id} className="p-3 border-b hover:bg-slate-50">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            alerta.prioridad === 'Alta' ? 'bg-red-500' : 
                            alerta.prioridad === 'Media' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-slate-800">{alerta.mensaje}</p>
                            <p className="text-xs text-slate-500 mt-1">{alerta.fecha}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => dismissAlerta(alerta.id)}
                          >
                            Descartar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-slate-800">Administrador</p>
                    <p className="text-xs text-slate-500">admin@otecpro.cl</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Contenido del Módulo */}
        <div className="p-6">
          {renderModulo()}
        </div>
      </main>
    </div>
  );
}

export default App;
