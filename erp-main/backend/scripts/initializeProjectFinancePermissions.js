//path: backend/scripts/initializeProjectFinancePermissions.js
const mongoose = require('mongoose');
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');

const projectFinancePermissions = [
  {
    name: 'pms.finance.view',
    description: 'View project finance data',
    module: 'PMS',
    action: 'view'
  },
  {
    name: 'pms.finance.add',
    description: 'Add project expenses and financial data',
    module: 'PMS',
    action: 'create'
  },
  {
    name: 'pms.finance.edit',
    description: 'Edit project expenses and budget',
    module: 'PMS',
    action: 'update'
  },
  {
    name: 'pms.finance.delete',
    description: 'Delete project expenses',
    module: 'PMS',
    action: 'delete'
  }
];

async function initializeProjectFinancePermissions() {
  try {
    console.log('Initializing Project Finance RBAC permissions...');

    // Create permissions
    for (const permData of projectFinancePermissions) {
      const existingPerm = await Permission.findOne({ name: permData.name });
      if (!existingPerm) {
        await Permission.create(permData);
        console.log(`Created permission: ${permData.name}`);
      } else {
        console.log(`Permission already exists: ${permData.name}`);
      }
    }

    // Assign permissions to admin roles
    const adminRoles = await Role.find({ 
      name: { $in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } 
    });

    const permissionNames = projectFinancePermissions.map(p => p.name);

    for (const role of adminRoles) {
      const newPermissions = permissionNames.filter(perm => !role.permissions.includes(perm));
      if (newPermissions.length > 0) {
        role.permissions.push(...newPermissions);
        await role.save();
        console.log(`Added permissions to ${role.name}: ${newPermissions.join(', ')}`);
      }
    }

    console.log('Project Finance RBAC permissions initialized successfully!');
  } catch (error) {
    console.error('Error initializing permissions:', error);
  }
}

module.exports = initializeProjectFinancePermissions;

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system')
    .then(() => {
      console.log('Connected to MongoDB');
      return initializeProjectFinancePermissions();
    })
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}