const fs = require('fs');
let c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace(/'En Ejecución'/g, "'En Curso'");
fs.writeFileSync('src/data/mockData.ts', c);
