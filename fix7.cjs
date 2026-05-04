const fs = require('fs');
let c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace(/'Borrador'/g, "'En Preparación'");
c = c.replace(/'Aprobada'/g, "'Aceptada'");
c = c.replace(/fecha:/g, "fechaPropuesta:");
fs.writeFileSync('src/data/mockData.ts', c);
