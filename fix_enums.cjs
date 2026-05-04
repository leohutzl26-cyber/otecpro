const fs = require('fs');
const files = ['src/sections/Dashboard.tsx', 'src/sections/Relatores.tsx', 'src/sections/Reportes.tsx'];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/'En Ejecución'/g, "'En Curso'");
  c = c.replace(/'Completado'/g, "'Terminado'");
  c = c.replace(/'Cancelado'/g, "'Anulado'");
  c = c.replace(/'Planificado'/g, "'Programado'");
  fs.writeFileSync(f, c);
});
console.log('Fixed simple enums');
