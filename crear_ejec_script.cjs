const fs = require('fs');
let c = fs.readFileSync('src/sections/Ejecuciones.tsx', 'utf8');

const stateVars = `
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nuevaE, setNuevaE] = useState<Partial<Ejecucion>>({
    estado: 'Programado',
    participantes: [],
    archivosAdjuntos: [],
    financiero: { valor: 0 }
  });

  const handleCrear = async () => {
    try {
      // Mock de participantes según la cantidad
      const cantidad = parseInt((document.getElementById('cantPart') as HTMLInputElement)?.value || '0');
      const participantesArr = Array.from({ length: cantidad }).map((_, i) => ({
        id: \`p\${Date.now()}-\${i}\`,
        rut: '',
        nombre: \`Alumno \${i+1}\`,
        apellido: '',
        asistenciaProgreso: 0,
        estadoSAG: 'No Aplica',
        documentosSAG: {
          colinesterasa: { valido: false },
          certificadoMedico: { valido: false },
          poderSimple: { valido: false }
        }
      }));

      await store.addEjecucion({
        ...nuevaE,
        participantes: participantesArr,
        configuracion: { modalidad: 'Presencial', totalHoras: 0, sesiones: [] }
      } as Ejecucion);
      setIsCreateOpen(false);
    } catch (e) {
      console.error(e);
    }
  };
`;

c = c.replace('const [activeTab, setActiveTab] = useState(\'general\');', 'const [activeTab, setActiveTab] = useState(\'general\');\n' + stateVars);

const headerButton = `
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ejecuciones de Cursos</h2>
          <p className="text-slate-500">Gestiona cursos, logística y participantes</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ejecución
        </Button>
`;

c = c.replace(`<div>
          <h2 className="text-2xl font-bold text-slate-800">Ejecuciones de Cursos</h2>
          <p className="text-slate-500">Gestiona cursos, logística y participantes</p>
        </div>`, headerButton);

const createDialog = `
      {/* Dialogo Crear Ejecución */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Ejecución</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Único</label>
              <Input placeholder="Ejem: EJEC-2025-001" value={nuevaE.codigoUnico || ''} onChange={e => setNuevaE({...nuevaE, codigoUnico: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.estado} onChange={e => setNuevaE({...nuevaE, estado: e.target.value as EstadoEjecucion})}>
                {estadosKanban.map(es => <option key={es} value={es}>{es}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Cliente</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.clienteId || ''} onChange={e => setNuevaE({...nuevaE, clienteId: e.target.value})}>
                <option value="">Seleccionar Cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Cotización</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.cotizacionId || ''} onChange={e => setNuevaE({...nuevaE, cotizacionId: e.target.value})}>
                <option value="">Seleccionar Cotización...</option>
                {cotizaciones.map(c => <option key={c.id} value={c.id}>{c.nombre || c.codigoUnico}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Relator</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.relatorId || ''} onChange={e => setNuevaE({...nuevaE, relatorId: e.target.value})}>
                <option value="">Seleccionar Relator...</option>
                {relatores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar Curso (Catálogo)</label>
              <select className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                value={nuevaE.cursoId || ''} onChange={e => setNuevaE({...nuevaE, cursoId: e.target.value})}>
                <option value="">Seleccionar Curso...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad de Participantes</label>
              <Input id="cantPart" type="number" placeholder="0" min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lugares de Ejecución</label>
              <Input placeholder="Lugar o URL" value={nuevaE.lugaresEjecucion || ''} onChange={e => setNuevaE({...nuevaE, lugaresEjecucion: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Input type="date" value={nuevaE.fechaInicio || ''} onChange={e => setNuevaE({...nuevaE, fechaInicio: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Término</label>
              <Input type="date" value={nuevaE.fechaTermino || ''} onChange={e => setNuevaE({...nuevaE, fechaTermino: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID Acción Sence</label>
              <Input placeholder="ID Acción Sence" value={nuevaE.idAccionSence || ''} onChange={e => setNuevaE({...nuevaE, idAccionSence: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Sence (Manual)</label>
              <Input placeholder="Código Sence" value={nuevaE.codigoSence || ''} onChange={e => setNuevaE({...nuevaE, codigoSence: e.target.value})} />
            </div>

            <div className="col-span-2 pt-4 border-t mt-2">
              <h4 className="font-semibold mb-3">Datos Financieros</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orden de Compra</label>
                  <Input placeholder="N° OC" value={nuevaE.financiero?.ordenCompra || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, ordenCompra: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Total</label>
                  <Input type="number" placeholder="0" value={nuevaE.financiero?.valor || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, valor: parseInt(e.target.value) || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pago</label>
                  <Input placeholder="Ejem: Transferencia a 30 días" value={nuevaE.financiero?.formaPago || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, formaPago: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Pago Estimada</label>
                  <Input type="date" value={nuevaE.financiero?.fechaPago || ''} onChange={e => setNuevaE({...nuevaE, financiero: {...nuevaE.financiero, fechaPago: e.target.value, valor: nuevaE.financiero?.valor || 0}})} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCrear}>Crear Ejecución</Button>
          </div>
        </DialogContent>
      </Dialog>
`;

c = c.replace('</DialogContent>\n      </Dialog>', '</DialogContent>\n      </Dialog>\n' + createDialog);

fs.writeFileSync('src/sections/Ejecuciones.tsx', c);
