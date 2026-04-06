// Extended seed data script for multi-industry ERP system
const mongoose = require('mongoose');
require('dotenv').config();

async function seedMultiIndustryData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Import models dynamically
        const User = require('../src/models/User').default;
        const CompanySettings = require('../src/models/CompanySettings').default;
        const Product = require('../src/models/Product').default;
        const Customer = require('../src/models/Customer').default;
        const Employee = require('../src/models/Employee').default;
        const Project = require('../src/models/Project').default;

        // Manufacturing models
        const BillOfMaterials = require('../src/models/manufacturing/BillOfMaterials').default;
        const WorkOrder = require('../src/models/manufacturing/WorkOrder').default;
        const Machine = require('../src/models/manufacturing/Machine').default;

        // IT models
        const Sprint = require('../src/models/it/Sprint').default;
        const TimeEntry = require('../src/models/it/TimeEntry').default;
        const SupportTicket = require('../src/models/it/SupportTicket').default;

        // Service models
        const ServiceCatalog = require('../src/models/services/ServiceCatalog').default;
        const Appointment = require('../src/models/services/Appointment').default;
        const Subscription = require('../src/models/services/Subscription').default;

        // Finance models
        const Currency = require('../src/models/finance/Currency').default;
        const Tax = require('../src/models/finance/Tax').default;

        // HR models
        const Payroll = require('../src/models/hr/Payroll').default;
        const PerformanceReview = require('../src/models/hr/PerformanceReview').default;

        console.log('📦 All models loaded successfully');

        // 1. Create Company Settings
        console.log('\n🏢 Creating Company Settings...');
        await CompanySettings.deleteMany({});
        const companySettings = await CompanySettings.create({
            companyName: 'Multi-Industry ERP Demo',
            industryType: 'HYBRID',
            activeModules: {
                manufacturing: true,
                it: true,
                services: true,
                finance: true,
                hr: true,
                scm: true,
                crm: true,
                inventory: true,
                projects: true,
            },
            companyProfile: {
                email: 'info@erp-demo.com',
                phone: '+1-555-0100',
                address: {
                    street: '123 Business Park',
                    city: 'Tech City',
                    state: 'CA',
                    country: 'USA',
                    postalCode: '94000',
                },
            },
            regionalSettings: {
                currency: 'USD',
                timezone: 'America/Los_Angeles',
                dateFormat: 'MM/DD/YYYY',
                locale: 'en-US',
            },
        });
        console.log('✅ Company settings created');

        // 2. Create Currencies
        console.log('\n💱 Creating Currencies...');
        await Currency.deleteMany({});
        const currencies = await Currency.insertMany([
            {
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                exchangeRate: 1,
                isBaseCurrency: true,
                isActive: true,
            },
            {
                code: 'EUR',
                name: 'Euro',
                symbol: '€',
                exchangeRate: 0.85,
                isActive: true,
            },
            {
                code: 'GBP',
                name: 'British Pound',
                symbol: '£',
                exchangeRate: 0.73,
                isActive: true,
            },
            {
                code: 'INR',
                name: 'Indian Rupee',
                symbol: '₹',
                exchangeRate: 83.12,
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${currencies.length} currencies`);

        // 3. Create Taxes
        console.log('\n💰 Creating Taxes...');
        await Tax.deleteMany({});

        // Get admin user for createdBy
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('⚠️  No admin user found, creating one...');
            const newAdmin = await User.create({
                name: 'Admin User',
                email: 'admin@erp-demo.com',
                password: 'Admin@123',
                role: 'admin',
            });
            adminUser = newAdmin;
        }

        const taxes = await Tax.insertMany([
            {
                name: 'Sales Tax',
                code: 'ST-CA',
                type: 'SALES_TAX',
                rate: 7.25,
                applicableOn: 'BOTH',
                country: 'USA',
                region: 'California',
                isActive: true,
                effectiveFrom: new Date('2024-01-01'),
                createdBy: adminUser._id,
            },
            {
                name: 'GST',
                code: 'GST-IN',
                type: 'GST',
                rate: 18,
                applicableOn: 'BOTH',
                country: 'India',
                isActive: true,
                effectiveFrom: new Date('2024-01-01'),
                createdBy: adminUser._id,
            },
            {
                name: 'VAT',
                code: 'VAT-UK',
                type: 'VAT',
                rate: 20,
                applicableOn: 'BOTH',
                country: 'UK',
                isActive: true,
                effectiveFrom: new Date('2024-01-01'),
                createdBy: adminUser._id,
            },
        ]);
        console.log(`✅ Created ${taxes.length} tax configurations`);

        // 4. Create Products for Manufacturing
        console.log('\n🏭 Creating Manufacturing Products...');
        const rawMaterials = await Product.insertMany([
            {
                name: 'Steel Sheet',
                sku: 'RM-STEEL-001',
                price: 50,
                stock: 1000,
                unit: 'sheets',
                category: 'Raw Material',
            },
            {
                name: 'Aluminum Bar',
                sku: 'RM-ALUM-001',
                price: 30,
                stock: 500,
                unit: 'bars',
                category: 'Raw Material',
            },
            {
                name: 'Plastic Pellets',
                sku: 'RM-PLASTIC-001',
                price: 15,
                stock: 2000,
                unit: 'kg',
                category: 'Raw Material',
            },
        ]);

        const finishedProduct = await Product.create({
            name: 'Premium Widget Assembly',
            sku: 'FG-WIDGET-001',
            price: 250,
            stock: 50,
            unit: 'units',
            category: 'Finished Goods',
        });
        console.log(`✅ Created ${rawMaterials.length + 1} products`);

        // 5. Create BOM
        console.log('\n📋 Creating Bill of Materials...');
        await BillOfMaterials.deleteMany({});
        const bom = await BillOfMaterials.create({
            bomNumber: 'BOM-2601-0001',
            product: finishedProduct._id,
            name: 'Premium Widget Assembly BOM v1.0',
            version: 1,
            components: [
                {
                    product: rawMaterials[0]._id,
                    quantity: 2,
                    unit: 'sheets',
                    costPerUnit: 50,
                    scrapPercentage: 5,
                },
                {
                    product: rawMaterials[1]._id,
                    quantity: 3,
                    unit: 'bars',
                    costPerUnit: 30,
                    scrapPercentage: 3,
                },
                {
                    product: rawMaterials[2]._id,
                    quantity: 5,
                    unit: 'kg',
                    costPerUnit: 15,
                },
            ],
            laborCost: 50,
            overheadCost: 25,
            productionTime: 120,
            isActive: true,
            isDefault: true,
            createdBy: adminUser._id,
        });
        console.log('✅ Created BOM');

        // 6. Create Machine
        console.log('\n⚙️  Creating Machine...');
        await Machine.deleteMany({});
        const machine = await Machine.create({
            machineNumber: 'MCH-26-0001',
            name: 'CNC Machine 3000',
            type: 'CNC',
            manufacturer: 'TechMachines Inc',
            modelName: 'CNC-3000X',
            serialNumber: 'SN-2024-001',
            purchaseDate: new Date('2023-01-15'),
            status: 'OPERATIONAL',
            location: 'Production Floor A',
            specifications: {
                capacity: '1000 units/day',
                powerRating: '15 kW',
                dimensions: '3m x 2m x 2.5m',
                weight: '2500 kg',
            },
            maintenanceSchedule: {
                type: 'MONTHLY',
                lastMaintenance: new Date('2026-01-01'),
                nextMaintenance: new Date('2026-02-01'),
            },
            operatingHours: 5240,
            efficiency: 95,
            createdBy: adminUser._id,
        });
        console.log('✅ Created machine');

        // 7. Create Work Order
        console.log('\n🔧 Creating Work Order...');
        await WorkOrder.deleteMany({});
        const workOrder = await WorkOrder.create({
            workOrderNumber: 'WO-2601-0001',
            product: finishedProduct._id,
            bom: bom._id,
            quantity: 100,
            unit: 'units',
            priority: 'HIGH',
            scheduledStartDate: new Date('2026-01-15'),
            scheduledEndDate: new Date('2026-01-20'),
            status: 'PLANNED',
            materialConsumption: {
                planned: bom.components.map(c => ({
                    product: c.product,
                    quantity: c.quantity * 100,
                    unit: c.unit,
                })),
                actual: [],
            },
            createdBy: adminUser._id,
        });
        console.log('✅ Created work order');

        // 8. Create Services
        console.log('\n🎯 Creating Service Catalog...');
        await ServiceCatalog.deleteMany({});

        const employee = await Employee.findOne() || await Employee.create({
            name: 'John Smith',
            email: 'john.smith@erp-demo.com',
            position: 'Service Provider',
            department: 'Services',
            joiningDate: new Date('2023-01-01'),
            salary: 75000,
            status: 'ACTIVE',
        });

        const services = await ServiceCatalog.insertMany([
            {
                serviceCode: 'CONSULT-BUSINESS',
                name: 'Business Consultation',
                category: 'Consulting',
                description: 'Professional business strategy consultation',
                duration: 60,
                price: 150,
                currency: 'USD',
                available: true,
                providers: [employee._id],
                createdBy: adminUser._id,
            },
            {
                serviceCode: 'TRAINING-IT',
                name: 'IT Training Session',
                category: 'Training',
                description: 'Comprehensive IT skills training',
                duration: 120,
                price: 200,
                currency: 'USD',
                available: true,
                providers: [employee._id],
                createdBy: adminUser._id,
            },
        ]);
        console.log(`✅ Created ${services.length} services`);

        // 9. Create Customer
        const customer = await Customer.findOne() || await Customer.create({
            name: 'Acme Corporation',
            email: 'contact@acme.com',
            phone: '+1-555-0200',
            address: {
                street: '456 Business Ave',
                city: 'Commerce City',
                state: 'CA',
                country: 'USA',
                postalCode: '94001',
            },
        });

        // 10. Create Appointment
        console.log('\n📅 Creating Appointment...');
        await Appointment.deleteMany({});
        const appointment = await Appointment.create({
            appointmentNumber: 'APT-20260110-001',
            service: services[0]._id,
            customer: customer._id,
            provider: employee._id,
            scheduledDate: new Date('2026-01-15'),
            scheduledTime: '14:00',
            duration: 60,
            status: 'SCHEDULED',
            price: 150,
            paymentStatus: 'PENDING',
            createdBy: adminUser._id,
        });
        console.log('✅ Created appointment');

        // 11. Create Subscription
        console.log('\n💳 Creating Subscription...');
        await Subscription.deleteMany({});
        const subscription = await Subscription.create({
            subscriptionNumber: 'SUB-2026-00001',
            customer: customer._id,
            service: services[1]._id,
            plan: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date('2026-01-01'),
            nextBillingDate: new Date('2026-02-01'),
            billingCycle: 30,
            price: 199.99,
            currency: 'USD',
            autoRenew: true,
            billingHistory: [
                {
                    date: new Date('2026-01-01'),
                    amount: 199.99,
                    status: 'SUCCESS',
                },
            ],
            createdBy: adminUser._id,
        });
        console.log('✅ Created subscription');

        // 12. Create Project for IT Module
        const project = await Project.findOne() || await Project.create({
            name: 'ERP Enhancement Project',
            description: 'Adding new features to the ERP system',
            status: 'IN_PROGRESS',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-03-31'),
            budget: 50000,
        });

        // 13. Create Sprint
        console.log('\n🏃 Creating Sprint...');
        await Sprint.deleteMany({});
        const sprint = await Sprint.create({
            sprintNumber: 'SPR-0001',
            name: 'Sprint 1 - Q1 2026',
            project: project._id,
            goal: 'Implement manufacturing module',
            startDate: new Date('2026-01-13'),
            endDate: new Date('2026-01-27'),
            status: 'ACTIVE',
            totalPoints: 50,
            completedPoints: 0,
            createdBy: adminUser._id,
        });
        console.log('✅ Created sprint');

        // 14. Create Time Entry
        console.log('\n⏰ Creating Time Entry...');
        await TimeEntry.deleteMany({});
        const timeEntry = await TimeEntry.create({
            employee: employee._id,
            project: project._id,
            date: new Date('2026-01-10'),
            startTime: new Date('2026-01-10T09:00:00Z'),
            endTime: new Date('2026-01-10T17:00:00Z'),
            description: 'Implemented BOM management features',
            billable: true,
            hourlyRate: 75,
            status: 'DRAFT',
            createdBy: adminUser._id,
        });
        console.log('✅ Created time entry');

        // 15. Create Support Ticket
        console.log('\n🎫 Creating Support Ticket...');
        await SupportTicket.deleteMany({});
        const supportTicket = await SupportTicket.create({
            ticketNumber: 'TKT-2601-00001',
            customer: customer._id,
            subject: 'System Performance Issue',
            description: 'System is running slowly during peak hours',
            category: 'TECHNICAL',
            priority: 'HIGH',
            status: 'OPEN',
            sla: {
                responseTime: 240,
                resolutionTime: 480,
                responseDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
                resolutionDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
            },
            createdBy: adminUser._id,
        });
        console.log('✅ Created support ticket');

        console.log('\n' + '='.repeat(60));
        console.log('✨ SEED DATA SUMMARY');
        console.log('='.repeat(60));
        console.log(`📊 Company Settings: 1`);
        console.log(`💱 Currencies: ${currencies.length}`);
        console.log(`💰 Taxes: ${taxes.length}`);
        console.log(`📦 Products: ${rawMaterials.length + 1}`);
        console.log(`📋 BOMs: 1`);
        console.log(`⚙️  Machines: 1`);
        console.log(`🔧 Work Orders: 1`);
        console.log(`🎯 Services: ${services.length}`);
        console.log(`📅 Appointments: 1`);
        console.log(`💳 Subscriptions: 1`);
        console.log(`🏃 Sprints: 1`);
        console.log(`⏰ Time Entries: 1`);
        console.log(`🎫 Support Tickets: 1`);
        console.log('='.repeat(60));
        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📌 You can now test all modules with sample data');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

// Run the seed function
seedMultiIndustryData()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
