const fs = require('fs');
let c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace('// const generateParticipantes =', 'const generateParticipantes =');
c = c.replace('const generateParticipantes =', '// @ts-ignore\\nconst generateParticipantes =');
fs.writeFileSync('src/data/mockData.ts', c);
