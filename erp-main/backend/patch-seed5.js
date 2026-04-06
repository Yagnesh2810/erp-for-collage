const fs = require('fs');
const file = './scripts/seed-fixed.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('teamMembers: teamMembers,', 'teamMembers: teamMembers,\n                manager: employees[Math.floor(Math.random() * employees.length)]._id,');
data = data.replace('assignedTo: assignee,', 'assignedTo: assignee,\n                    assignedBy: project.manager,');

fs.writeFileSync(file, data);
console.log('Fixed Project and Task creation');
