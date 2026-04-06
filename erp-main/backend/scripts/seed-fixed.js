const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User').default;
const Product = require('../src/models/Product').default;
const Customer = require('../src/models/Customer').default;
const Order = require('../src/models/Order').default;
const Inventory = require('../src/models/Inventory').default;
const Employee = require('../src/models/Employee').default;
const Supplier = require('../src/models/Supplier').default;
const Project = require('../src/models/Project').default;
const Task = require('../src/models/Task').default;
const Attendance = require('../src/models/Attendance').default;

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system';

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedData();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function seedData() {
    try {
        console.log('\n🌱 Starting comprehensive data seeding...\n');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Product.deleteMany({}),
            Customer.deleteMany({}),
            Order.deleteMany({}),
            Inventory.deleteMany({}),
            Employee.deleteMany({}),
            Supplier.deleteMany({}),
            Project.deleteMany({}),
            Task.deleteMany({}),
            Attendance.deleteMany({})
        ]);
        console.log('✅ Existing data cleared\n');


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

        // 1. Create Products
        console.log('📦 Creating products...');
        const products = [];

        const productData = [
            // Electronics
            { name: 'Wireless Bluetooth Headphones', sku: 'ELEC-001', price: 79.99, category: 'Electronics', description: 'Premium noise-canceling headphones', stock: 150 },
            { name: 'Smart Watch Pro', sku: 'ELEC-002', price: 299.99, category: 'Electronics', description: 'Advanced fitness tracking smartwatch', stock: 85 },
            { name: 'USB-C Fast Charger', sku: 'ELEC-003', price: 24.99, category: 'Electronics', description: '65W fast charging adapter', stock: 200 },
            { name: 'Wireless Mouse', sku: 'ELEC-004', price: 34.99, category: 'Electronics', description: 'Ergonomic wireless mouse', stock: 120 },
            { name: 'Mechanical Keyboard', sku: 'ELEC-005', price: 129.99, category: 'Electronics', description: 'RGB mechanical gaming keyboard', stock: 45 },
            { name: 'Portable Power Bank 20000mAh', sku: 'ELEC-006', price: 49.99, category: 'Electronics', description: 'High capacity portable charger', stock: 5 }, // Low stock

            // Clothing
            { name: 'Cotton T-Shirt - Navy', sku: 'CLTH-001', price: 19.99, category: 'Clothing', description: '100% cotton crew neck t-shirt', stock: 250 },
            { name: 'Denim Jeans - Blue', sku: 'CLTH-002', price: 59.99, category: 'Clothing', description: 'Classic fit denim jeans', stock: 180 },
            { name: 'Leather Jacket', sku: 'CLTH-003', price: 199.99, category: 'Clothing', description: 'Genuine leather biker jacket', stock: 30 },
            { name: 'Running Shoes', sku: 'CLTH-004', price: 89.99, category: 'Clothing', description: 'Lightweight running shoes', stock: 95 },
            { name: 'Wool Sweater', sku: 'CLTH-005', price: 69.99, category: 'Clothing', description: 'Warm merino wool sweater', stock: 3 }, // Low stock

            // Home & Garden
            { name: 'Coffee Maker Deluxe', sku: 'HOME-001', price: 149.99, category: 'Home & Garden', description: 'Programmable coffee maker with thermal carafe', stock: 65 },
            { name: 'Non-Stick Cookware Set', sku: 'HOME-002', price: 119.99, category: 'Home & Garden', description: '10-piece non-stick cookware set', stock: 40 },
            { name: 'LED Desk Lamp', sku: 'HOME-003', price: 39.99, category: 'Home & Garden', description: 'Adjustable LED desk lamp', stock: 110 },
            { name: 'Garden Tool Set', sku: 'HOME-004', price: 79.99, category: 'Home & Garden', description: 'Complete garden tool set', stock: 55 },

            // Office Supplies
            { name: 'Office Chair Ergonomic', sku: 'OFFC-001', price: 249.99, category: 'Office Supplies', description: 'Ergonomic office chair with lumbar support', stock: 35 },
            { name: 'Standing Desk Adjustable', sku: 'OFFC-002', price: 399.99, category: 'Office Supplies', description: 'Electric height-adjustable desk', stock: 20 },
            { name: 'Printer All-in-One', sku: 'OFFC-003', price: 179.99, category: 'Office Supplies', description: 'Wireless all-in-one printer', stock: 42 },
            { name: 'Paper Shredder', sku: 'OFFC-004', price: 89.99, category: 'Office Supplies', description: 'Cross-cut paper shredder', stock: 28 },
            { name: 'Whiteboard 4x6 ft', sku: 'OFFC-005', price: 129.99, category: 'Office Supplies', description: 'Magnetic dry erase whiteboard', stock: 0 }, // Out of stock

            // Sports Equipment
            { name: 'Yoga Mat Premium', sku: 'SPRT-001', price: 34.99, category: 'Sports', description: 'Extra thick non-slip yoga mat', stock: 140 },
            { name: 'Dumbbells Set 20kg', sku: 'SPRT-002', price: 79.99, category: 'Sports', description: 'Adjustable dumbbell set', stock: 60 },
            { name: 'Resistance Bands Set', sku: 'SPRT-003', price: 24.99, category: 'Sports', description: 'Set of 5 resistance bands', stock: 185 },
            { name: 'Basketball Official Size', sku: 'SPRT-004', price: 29.99, category: 'Sports', description: 'Official size basketball', stock: 75 },
            { name: 'Tennis Racket Pro', sku: 'SPRT-005', price: 149.99, category: 'Sports', description: 'Professional tennis racket', stock: 4 }, // Low stock

            // Books & Media
            { name: 'Business Strategy Book', sku: 'BOOK-001', price: 34.99, category: 'Books', description: 'Best-selling business strategy guide', stock: 95 },
            { name: 'Programming Guide - Python', sku: 'BOOK-002', price: 44.99, category: 'Books', description: 'Comprehensive Python programming guide', stock: 120 },
            { name: 'Bluetooth Speaker Portable', sku: 'ELEC-007', price: 59.99, category: 'Electronics', description: 'Waterproof portable speaker', stock: 88 },
            { name: 'External SSD 1TB', sku: 'ELEC-008', price: 119.99, category: 'Electronics', description: 'High-speed external SSD', stock: 52 },
            { name: 'Gaming Mouse RGB', sku: 'ELEC-009', price: 69.99, category: 'Electronics', description: 'High DPI gaming mouse with RGB', stock: 67 }
        ];

        for (const data of productData) {
            const product = await Product.create({
                name: data.name,
                sku: data.sku,
                description: data.description,
                price: data.price,
                category: data.category,
                stock: data.stock,
                imageUrls: [`/images/products/${data.sku.toLowerCase()}.jpg`],
                costPrice: data.price * 0.6,
                stockQuantity: data.stock,
                supplier: defaultSupplier._id,
                createdBy: adminUser._id,
                updatedBy: adminUser._id,
                isActive: true
            });
            products.push(product);
        }
        console.log(`✅ Created ${products.length} products\n`);

        // 2. Create Inventory Records for Products
        console.log('📊 Creating inventory records...');
        const inventoryRecords = [];
        const locations = ['Warehouse A', 'Warehouse B', 'Store Front', 'Distribution Center'];

        for (const product of products) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const inventory = await Inventory.create({
                productId: product._id,
                quantity: product.stock,
                location: location,
                minimumStockLevel: 10,
                maximumStockLevel: 200,
                reorderPoint: 20,
                lastUpdated: new Date()
            });
            inventoryRecords.push(inventory);
        }
        console.log(`✅ Created ${inventoryRecords.length} inventory records\n`);

        // 3. Create Customers
        console.log('👥 Creating customers...');
        const customers = [];
        const customerTypes = ['regular', 'wholesale', 'vip'];
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];

        const customerNames = [
            'Tech Solutions Inc', 'Global Retail Corp', 'Premium Distributors', 'City Market LLC',
            'Digital Innovations', 'Wholesale Partners', 'Elite Enterprises', 'Metro Trading Co',
            'Smart Buy Corporation', 'Quality Goods Ltd', 'Express Retail Group', 'Prime Merchants',
            'Urban Suppliers', 'Mega Store Chain', 'Value Plus Distributors', 'Quick Commerce Inc',
            'Regional Wholesalers', 'Best Deal Trading', 'Superior Goods Co', 'Rapid Retail Solutions'
        ];

        for (let i = 0; i < 20; i++) {
            const cityIndex = i % cities.length;
            const customer = await Customer.create({
                name: customerNames[i],
                email: `contact${i + 1}@${customerNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                address: {
                    street: `${100 + i * 10} ${['Main', 'Oak', 'Maple', 'Pine'][i % 4]} Street`,
                    city: cities[cityIndex],
                    state: states[cityIndex],
                    zipCode: `${10000 + i * 100}`,
                    country: 'USA'
                },
                contactPerson: `${['John', 'Jane', 'Michael', 'Sarah', 'David'][i % 5]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`,
                customerType: customerTypes[i % 3],
                taxId: `TAX${1000 + i}`,
                creditLimit: [5000, 10000, 25000, 50000][i % 4],
                paymentTerms: ['Net 30', 'Net 60', 'Immediate', 'Net 45'][i % 4],
                active: true,
                tags: [['preferred', 'wholesale'], ['regular'], ['vip', 'high-value'], ['new']][i % 4]
            });
            customers.push(customer);
        }
        console.log(`✅ Created ${customers.length} customers\n`);

        // 4. Create Employees
        console.log('👨‍💼 Creating employees...');
        const employees = [];
        const departments = ['Engineering', 'Sales', 'HR', 'Operations', 'Finance', 'Marketing'];
        const positions = {
            'Engineering': ['Software Developer', 'Senior Engineer', 'Tech Lead', 'DevOps Engineer'],
            'Sales': ['Sales Representative', 'Account Manager', 'Sales Director'],
            'HR': ['HR Manager', 'Recruiter', 'HR Coordinator'],
            'Operations': ['Operations Manager', 'Logistics Coordinator', 'Warehouse Supervisor'],
            'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager'],
            'Marketing': ['Marketing Manager', 'Content Specialist', 'Social Media Coordinator']
        };

        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson'];

        for (let i = 0; i < 15; i++) {
            const dept = departments[i % departments.length];
            const positionList = positions[dept];
            const employee = await Employee.create({
                employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
                firstName: firstNames[i % firstNames.length],
                lastName: lastNames[i % lastNames.length],
                email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}${i}@company.com`,
                phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                department: dept,
                position: positionList[i % positionList.length],
                salary: 50000 + (i * 5000) + Math.floor(Math.random() * 20000),
                hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                status: 'active',
                address: {
                    street: `${200 + i * 15} ${['Elm', 'Cedar', 'Birch', 'Willow'][i % 4]} Avenue`,
                    city: cities[i % cities.length],
                    state: states[i % states.length],
                    zipCode: `${20000 + i * 100}`,
                    country: 'USA'
                },
                emergencyContact: {
                    name: `Emergency Contact ${i + 1}`,
                    relationship: ['Spouse', 'Parent', 'Sibling'][i % 3],
                    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`
                },
                skills: [
                    ['JavaScript', 'React', 'Node.js'],
                    ['Sales', 'CRM', 'Communication'],
                    ['HR Management', 'Recruitment'],
                    ['Logistics', 'Planning'],
                    ['Accounting', 'Excel', 'QuickBooks']
                ][i % 5]
            });
            employees.push(employee);
        }
        console.log(`✅ Created ${employees.length} employees\n`);

        // 5. Create Attendance Records for Current Month
        console.log('📅 Creating attendance records...');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let attendanceCount = 0;

        for (const employee of employees) {
            // Create attendance for working days in current month
            for (let day = 1; day <= today.getDate(); day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dayOfWeek = date.getDay();

                // Skip weekends
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
                    const checkInMinute = Math.floor(Math.random() * 60);
                    const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
                    const checkOutMinute = Math.floor(Math.random() * 60);

                    const checkIn = new Date(currentYear, currentMonth, day, checkInHour, checkInMinute);
                    const checkOut = new Date(currentYear, currentMonth, day, checkOutHour, checkOutMinute);
                    const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

                    await Attendance.create({
                        employee: employee._id,
                        date: new Date(currentYear, currentMonth, day, 0, 0, 0, 0),
                        checkIn: checkIn,
                        checkOut: checkOut,
                        status: 'present',
                        totalHours: totalHours,
                        breakTime: 60 // 1 hour break
                    });
                    attendanceCount++;
                }
            }
        }
        console.log(`✅ Created ${attendanceCount} attendance records\n`);

        // 6. Create Suppliers
        console.log('🏭 Creating suppliers...');
        const suppliers = [];
        const supplierNames = [
            'TechSource Wholesale',
            'Global Manufacturing Co',
            'Quality Imports Ltd',
            'Premium Goods Supplier',
            'Industrial Partners Inc',
            'Reliable Distributors',
            'Elite Manufacturers',
            'Direct Import Solutions'
        ];

        for (let i = 0; i < 8; i++) {
            const supplier = await Supplier.create({
                name: supplierNames[i],
                email: `sales@${supplierNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                address: `${300 + i * 20} Industrial Parkway, ${cities[i % cities.length]}, ${states[i % states.length]} ${30000 + i * 100}`,
                contactPerson: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
                products: products.slice(i * 3, (i * 3) + 3).map(p => p._id),
                isActive: true,
                notes: `Reliable supplier specializing in ${['electronics', 'clothing', 'home goods', 'office supplies', 'sports equipment'][i % 5]}`
            });
            suppliers.push(supplier);
        }
        console.log(`✅ Created ${suppliers.length} suppliers\n`);

        // 7. Create Orders
        console.log('🛒 Creating orders...');
        const orders = [];
        const orderStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];
        const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

        // Create orders over the last 90 days
        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 90);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);

            // Select random customer
            const customer = customers[Math.floor(Math.random() * customers.length)];

            // Select 1-5 random products
            const numProducts = Math.floor(Math.random() * 5) + 1;
            const orderProducts = [];
            let totalAmount = 0;

            for (let j = 0; j < numProducts; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 5) + 1;
                const price = product.price;

                orderProducts.push({
                    product: product._id,
                    quantity: quantity,
                    price: price
                });

                totalAmount += price * quantity;
            }

            // Determine status based on order age
            let status;
            let paymentStatus;
            if (daysAgo < 2) {
                status = 'pending';
                paymentStatus = 'pending';
            } else if (daysAgo < 5) {
                status = 'processing';
                paymentStatus = Math.random() > 0.5 ? 'completed' : 'pending';
            } else if (daysAgo < 10) {
                status = 'shipped';
                paymentStatus = 'completed';
            } else if (daysAgo < 60) {
                status = 'completed';
                paymentStatus = 'completed';
            } else {
                status = Math.random() > 0.9 ? 'cancelled' : 'completed';
                paymentStatus = status === 'cancelled' ? 'refunded' : 'completed';
            }

            const orderPayload = {
                orderNumber: `ORD-${String(i + 1).padStart(5, '0')}`,
                customer: customer._id,
                products: orderProducts,
                totalAmount: totalAmount,
                status: status,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                paymentStatus: paymentStatus,
                shippingAddress: customer.address,
                notes: `Order placed on ${orderDate.toLocaleDateString()}`,
                createdAt: orderDate,
                updatedAt: orderDate
            };
            orders.push(orderPayload);
        }
        const createdOrders = await Order.insertMany(orders);
        orders.length = 0;
        orders.push(...createdOrders);
        console.log(`✅ Created ${orders.length} orders\n`);

        // 8. Create Projects
        console.log('📋 Creating projects...');
        const projects = [];
        const projectNames = [
            'Website Redesign',
            'Mobile App Development',
            'Inventory System Upgrade',
            'Customer Portal Implementation',
            'Marketing Campaign Q1',
            'ERP Integration',
            'Cloud Migration',
            'Security Audit',
            'Database Optimization',
            'AI Chatbot Development'
        ];

        const projectStatuses = ['planning', 'active', 'completed', 'on-hold'];

        for (let i = 0; i < 10; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 180));

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 90) + 30);

            const status = i < 3 ? 'completed' : i < 6 ? 'active' : i < 8 ? 'planning' : 'on-hold';
            const progress = status === 'completed' ? 100 : status === 'active' ? Math.floor(Math.random() * 70) + 20 : Math.floor(Math.random() * 20);

            const teamMembers = employees.slice(i % 5, (i % 5) + 3).map(e => e._id);

            const project = await Project.create({
                name: projectNames[i],
                description: `Strategic project for ${projectNames[i].toLowerCase()}`,
                status: status,
                priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
                startDate: startDate,
                endDate: endDate,
                budget: 10000 + (i * 5000) + Math.floor(Math.random() * 20000),
                team: teamMembers,
                manager: employees[Math.floor(Math.random() * employees.length)]._id,
                progress: progress,
                client: customers[i % customers.length].name,
                tags: [['web', 'design'], ['mobile', 'development'], ['backend'], ['infrastructure'], ['marketing']][i % 5]
            });
            projects.push(project);
        }
        console.log(`✅ Created ${projects.length} projects\n`);

        // 9. Create Tasks for Projects
        console.log('✅ Creating tasks...');
        let taskCount = 0;
        const taskStatuses = ['todo', 'in-progress', 'review', 'completed'];
        const taskPriorities = ['low', 'medium', 'high', 'critical'];

        for (const project of projects) {
            const numTasks = Math.floor(Math.random() * 8) + 3; // 3-10 tasks per project

            for (let i = 0; i < numTasks; i++) {
                const taskNames = [
                    'Requirements Gathering',
                    'Design Mockups',
                    'Backend API Development',
                    'Frontend Implementation',
                    'Testing & QA',
                    'Documentation',
                    'Code Review',
                    'Deployment',
                    'User Training',
                    'Performance Optimization'
                ];

                const assignee = project.team[Math.floor(Math.random() * project.team.length)];

                const dueDate = new Date(project.startDate);
                dueDate.setDate(dueDate.getDate() + (i * 7) + Math.floor(Math.random() * 7));

                let status;
                if (project.status === 'completed') {
                    status = 'completed';
                } else if (project.status === 'active') {
                    status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
                } else {
                    status = i === 0 ? 'in-progress' : 'todo';
                }

                await Task.create({
                    title: taskNames[i % taskNames.length],
                    description: `${taskNames[i % taskNames.length]} for ${project.name}`,
                    project: project._id,
                    assignedTo: assignee,
                    assignedBy: project.manager,
                    status: status,
                    priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
                    dueDate: dueDate,
                    estimatedHours: Math.floor(Math.random() * 40) + 8,
                    actualHours: status === 'completed' ? Math.floor(Math.random() * 40) + 8 : 0,
                    tags: [['urgent'], ['backend'], ['frontend'], ['design'], ['testing']][i % 5]
                });
                taskCount++;
            }
        }
        console.log(`✅ Created ${taskCount} tasks\n`);

        // Summary
        console.log('═══════════════════════════════════════════════');
        console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
        console.log('═══════════════════════════════════════════════');
        console.log(`\n📊 Summary:\n`);
        console.log(`   Products:      ${products.length}`);
        console.log(`   Inventory:     ${inventoryRecords.length}`);
        console.log(`   Customers:     ${customers.length}`);
        console.log(`   Employees:     ${employees.length}`);
        console.log(`   Attendance:    ${attendanceCount}`);
        console.log(`   Suppliers:     ${suppliers.length}`);
        console.log(`   Orders:        ${orders.length}`);
        console.log(`   Projects:      ${projects.length}`);
        console.log(`   Tasks:         ${taskCount}`);
        console.log(`\n📈 Order Statistics:\n`);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const processingOrders = orders.filter(o => o.status === 'processing').length;
        const shippedOrders = orders.filter(o => o.status === 'shipped').length;
        const deliveredOrders = orders.filter(o => o.status === 'completed').length;
        console.log(`   Pending:       ${pendingOrders}`);
        console.log(`   Processing:    ${processingOrders}`);
        console.log(`   Shipped:       ${shippedOrders}`);
        console.log(`   Delivered:     ${deliveredOrders}`);

        const totalRevenue = orders.filter(o => o.paymentStatus === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);
        console.log(`\n💰 Total Revenue:  $${totalRevenue.toFixed(2)}`);
        console.log(`\n✅ Your ERP system is now fully populated with realistic data!`);
        console.log(`   Navigate to http://localhost:3000 to see your dashboard.\n`);

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}
