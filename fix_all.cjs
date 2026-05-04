const fs = require('fs');

let d = fs.readFileSync('src/sections/Dashboard.tsx', 'utf8');
d = d.replace(/'Borrador'/g, "'En Preparación'").replace(/'Aprobada'/g, "'Aceptada'");
fs.writeFileSync('src/sections/Dashboard.tsx', d);

let c = fs.readFileSync('src/sections/Calendario.tsx', 'utf8');
c = c.replace(/'En Ejecución'/g, "'En Curso'").replace(/'Planificado'/g, "'Programado'");
fs.writeFileSync('src/sections/Calendario.tsx', c);

let m = fs.readFileSync('src/data/mockData.ts', 'utf8');
m = m.replace(/'Planificado'/g, "'Programado'");
fs.writeFileSync('src/data/mockData.ts', m);

let cot = fs.readFileSync('src/sections/Cotizaciones.tsx', 'utf8');
cot = cot.replace('Trash2, ', '');
fs.writeFileSync('src/sections/Cotizaciones.tsx', cot);

let eje = fs.readFileSync('src/sections/Ejecuciones.tsx', 'utf8');
eje = eje.replace('Upload, Download, GraduationCap, DollarSign, Paperclip', 'Upload, Download, GraduationCap, DollarSign, Paperclip, Plus');
fs.writeFileSync('src/sections/Ejecuciones.tsx', eje);

console.log('Fixed all TS errors');
