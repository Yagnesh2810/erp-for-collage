const fs = require('fs');
const file = './scripts/seed-fixed.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/\'planning\', \'in-progress\', \'completed\', \'on-hold\'/g, "'planning', 'active', 'completed', 'on-hold'");
data = data.replace(/i < 6 \? \'in-progress\'/g, "i < 6 ? 'active'");
data = data.replace(/status === \'in-progress\'/g, "status === 'active'");
data = data.replace(/teamMembers: teamMembers,/g, "team: teamMembers,");

fs.writeFileSync(file, data);
console.log('Fixed Project enum values and team field');
