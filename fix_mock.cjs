const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');
code = code.replace(/export const ejecucionesMock: Ejecucion\[\] = \[[\s\S]*?\];/g, 'export const ejecucionesMock: Ejecucion[] = [];');
code = code.replace(/export const cotizacionesMock: Cotizacion\[\] = \[[\s\S]*?\];/g, 'export const cotizacionesMock: Cotizacion[] = [];');
fs.writeFileSync('src/data/mockData.ts', code);
console.log('Fixed mock data');
