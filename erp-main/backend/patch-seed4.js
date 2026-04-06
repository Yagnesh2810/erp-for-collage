const fs = require('fs');
const file = './scripts/seed-fixed.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('const order = await Order.create({', 'const orderPayload = {');
data = data.replace('orders.push(order);', 'orders.push(orderPayload);');
data = data.replace('console.log(`✅ Created ${orders.length} orders\\n`);', 'const createdOrders = await Order.insertMany(orders);\n        orders.length = 0;\n        orders.push(...createdOrders);\n        console.log(`✅ Created ${orders.length} orders\\n`);');

fs.writeFileSync(file, data);
console.log('Fixed Order creation to use insertMany to bypass save hooks on orderNumber');
