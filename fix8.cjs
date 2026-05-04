const fs = require('fs');
let c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace(/fechaPropuesta:/g, "fecha:"); // Revert the breaking change everywhere
fs.writeFileSync('src/data/mockData.ts', c);

// Empty cotizaciones and ejecuciones mock data because they are no longer compatible with the new schema without a massive rewrite
c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace(/export const cotizacionesMock: Cotizacion\[\] = \[([\s\S]*?)\];/, "export const cotizacionesMock: Cotizacion[] = [];");
c = c.replace(/export const ejecucionesMock: Ejecucion\[\] = \[([\s\S]*?)\];/, "export const ejecucionesMock: Ejecucion[] = [];");
fs.writeFileSync('src/data/mockData.ts', c);
