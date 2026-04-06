const fs = require('fs');
const file = './scripts/seed-fixed.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@company.com`,',
    'email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}${i}@company.com`,');

fs.writeFileSync(file, data);
console.log('Fixed duplicate email in seed-fixed.js');
