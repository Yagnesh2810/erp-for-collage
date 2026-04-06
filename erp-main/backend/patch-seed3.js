const fs = require('fs');
const file = './scripts/seed-fixed.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/'delivered'/g, '\'completed\'');
data = data.replace(/'cash'\]/g, '\'cash_on_delivery\'\]');

fs.writeFileSync(file, data);
console.log('Fixed Order enum values');
