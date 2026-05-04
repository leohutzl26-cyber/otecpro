const fs = require('fs');
let c = fs.readFileSync('src/data/mockData.ts', 'utf8');
c = c.replace('const generateParticipantes =', '// const generateParticipantes =');
fs.writeFileSync('src/data/mockData.ts', c);
