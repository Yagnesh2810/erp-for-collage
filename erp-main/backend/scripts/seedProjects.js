const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const Project = require('../src/models/Project');
const User = require('../src/models/User');

const seedProjects = async () => {
  try {
    console.log('🌱 Starting project seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user to be the manager
    let testUser = await User.findOne({ email: 'test@test.test' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Manager',
        email: 'test@test.test',
        password: '101010',
        role: 'admin'
      });
      console.log('✅ Created test user');
    }

    // Clear existing projects
    await Project.deleteMany({});
    console.log('🗑️ Cleared existing projects');

    // Sample projects data
    const projectsData = [
      {
        name: 'ERP System Development',
        description: 'Complete ERP system with all modules including HR, Finance, and Inventory management',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        priority: 'high',
        budget: 150000,
        spentBudget: 45000,
        progress: 30,
        manager: testUser._id,
        team: [testUser._id],
        client: 'Internal Project',
        tags: ['development', 'erp', 'full-stack']
      },
      {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application for inventory management',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        status: 'active',
        priority: 'medium',
        budget: 75000,
        spentBudget: 25000,
        progress: 45,
        manager: testUser._id,
        team: [testUser._id],
        client: 'ABC Corporation',
        tags: ['mobile', 'react-native', 'inventory']
      },
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
        status: 'completed',
        priority: 'low',
        budget: 25000,
        spentBudget: 24500,
        progress: 100,
        manager: testUser._id,
        team: [testUser._id],
        client: 'XYZ Company',
        tags: ['web', 'design', 'ui-ux']
      },
      {
        name: 'Data Migration Project',
        description: 'Migrate legacy data to new ERP system',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-07-31'),
        status: 'planning',
        priority: 'critical',
        budget: 50000,
        spentBudget: 5000,
        progress: 10,
        manager: testUser._id,
        team: [testUser._id],
        client: 'Internal Project',
        tags: ['data', 'migration', 'database']
      }
    ];

    // Create projects
    const createdProjects = await Project.insertMany(projectsData);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // Display created projects
    createdProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (${project.status}) - ID: ${project._id}`);
    });

    console.log('🎉 Project seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run the seeding
seedProjects();