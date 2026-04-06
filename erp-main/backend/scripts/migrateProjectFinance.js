//path: backend/scripts/migrateProjectFinance.js
const mongoose = require('mongoose');
const Project = require('../src/models/Project');

async function migrateProjectFinance() {
  try {
    console.log('Starting project finance migration...');

    // Find all projects that don't have finance field
    const projects = await Project.find({
      $or: [
        { finance: { $exists: false } },
        { finance: null }
      ]
    });

    console.log(`Found ${projects.length} projects to migrate`);

    for (const project of projects) {
      // Initialize finance object with default values
      project.finance = {
        totalExpenses: 0,
        totalRevenue: 0,
        profitLoss: 0,
        expenseIds: [],
        budgetAllocations: []
      };

      // Set spentBudget to 0 if not already set
      if (project.spentBudget === undefined || project.spentBudget === null) {
        project.spentBudget = 0;
      }

      await project.save();
      console.log(`Migrated project: ${project.name} (${project._id})`);
    }

    console.log('Project finance migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

module.exports = migrateProjectFinance;

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system')
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateProjectFinance();
    })
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}