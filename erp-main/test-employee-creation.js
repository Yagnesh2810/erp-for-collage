const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEmployeeCreation() {
  try {
    console.log('🔍 Testing Employee Creation...\n');

    // Step 1: Create or login with test user
    console.log('1. Creating/logging in with test user...');
    
    // First try to create test user
    try {
      await axios.post(`${API_URL}/create-test-user`);
      console.log('✅ Test user created/exists');
    } catch (error) {
      console.log('ℹ️ Test user might already exist');
    }

    // Login with test user
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.test',
      password: '101010'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as: ${user.name} (${user.role})`);

    // Step 2: Test employee creation
    console.log('\n2. Testing employee creation...');
    
    const employeeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      department: 'IT',
      position: 'Software Developer',
      salary: 75000,
      hireDate: '2024-01-15',
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567891'
      },
      skills: ['JavaScript', 'React', 'Node.js']
    };

    const createResponse = await axios.post(`${API_URL}/employees`, employeeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (createResponse.data.employee) {
      console.log('✅ Employee created successfully!');
      console.log(`   Employee ID: ${createResponse.data.employee.employeeId}`);
      console.log(`   Name: ${createResponse.data.employee.firstName} ${createResponse.data.employee.lastName}`);
      console.log(`   Email: ${createResponse.data.employee.email}`);
      
      if (createResponse.data.userCreated) {
        console.log('✅ User account also created for employee');
      }
    } else {
      console.log('❌ Employee creation failed');
      console.log('Response:', createResponse.data);
    }

    // Step 3: Verify employee was created
    console.log('\n3. Verifying employee was created...');
    
    const employeesResponse = await axios.get(`${API_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const employees = employeesResponse.data;
    const createdEmployee = employees.find(emp => emp.email === employeeData.email);
    
    if (createdEmployee) {
      console.log('✅ Employee found in database');
      console.log(`   Total employees: ${employees.length}`);
    } else {
      console.log('❌ Employee not found in database');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('Network error - is the server running?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testEmployeeCreation();