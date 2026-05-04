const fs = require('fs');
let c = fs.readFileSync('src/sections/Dashboard.tsx', 'utf8');
c = c.replace(/'Borrador'/g, "'En Preparación'");
c = c.replace(/'Aprobada'/g, "'Aceptada'");
c = c.replace(/'En Ejecución'/g, "'En Curso'");
c = c.replace(/'Planificado'/g, "'Programado'");
fs.writeFileSync('src/sections/Dashboard.tsx', c);
console.log('Fixed Dashboard');
