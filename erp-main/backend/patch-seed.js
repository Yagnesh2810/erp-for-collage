const fs = require('fs');
const file = './scripts/seed-comprehensive-data.js';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('../src/models/User')) {
    data = data.replace('const Product = require(', 'const User = require(\'../src/models/User\').default;\nconst Product = require(');
}

data = data.replace('// 1. Create Products', `
        // 0. Create Admin and Default Supplier
        let adminUser = await User.findOne({ email: 'admin@erp-demo.com' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@erp-demo.com',
                password: 'password123',
                role: 'admin'
            });
        }

        const defaultSupplier = await Supplier.create({
            name: 'Default Supplier',
            email: 'default@supplier.com',
            phone: '+1234567890',
            address: '123 Supplier St, City, ST 12345',
            contactPerson: 'Supplier Contact',
            isActive: true
        });

        // 1. Create Products`);

data = data.replace(/image: `\/images\/products\/\$\{data\.sku\.toLowerCase\(\)\}\.jpg`,/g,
    'imageUrls: [`/images/products/${data.sku.toLowerCase()}.jpg`],\n                costPrice: data.price * 0.6,\n                stockQuantity: data.stock,\n                supplier: defaultSupplier._id,\n                createdBy: adminUser._id,\n                updatedBy: adminUser._id,');

fs.writeFileSync('./scripts/seed-fixed.js', data);
console.log('Patch applied successfully to seed-fixed.js');
