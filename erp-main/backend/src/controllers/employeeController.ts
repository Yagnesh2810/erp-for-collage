import { Request, Response } from 'express';
import Employee from '../models/Employee';
import Task from '../models/Task';
import User, { UserRole } from '../models/User';
// Socket will be imported dynamically to avoid circular dependency

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find().populate('manager', 'firstName lastName');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('manager', 'firstName lastName');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee', error });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employeeData = req.body;
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'salary', 'hireDate'];
    const missingFields = requiredFields.filter(field => !employeeData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields,
        error: `Please provide: ${missingFields.join(', ')}` 
      });
    }
    
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this email already exists',
        error: 'Email must be unique' 
      });
    }
    
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const nextId = lastEmployee ? 
      `EMP${(parseInt(lastEmployee.employeeId.slice(3)) + 1).toString().padStart(4, '0')}` : 
      'EMP0001';
    
    employeeData.employeeId = nextId;
    const employee = new Employee(employeeData);
    await employee.save();
    
    // Create user account for the employee with normal role
    let userCreated = false;
    try {
      const existingUser = await User.findOne({ email: employee.email });
      if (!existingUser) {
        const defaultPassword = `${employee.firstName.toLowerCase()}123`; // Simple default password
        await User.create({
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          password: defaultPassword,
          role: UserRole.NORMAL
        });
        userCreated = true;
      }
    } catch (userError) {
      console.warn('Failed to create user account for employee:', userError);
      // Continue with employee creation even if user creation fails
    }
    
    // Emit socket events
    const { io } = await import('../server');
    io.emit('employee:created', employee);
    io.emit('dashboard:refresh'); // Trigger dashboard refresh
    
    res.status(201).json({
      employee,
      userCreated,
      message: userCreated ? 
        `Employee created successfully. User account created with email: ${employee.email} and default password: ${employee.firstName.toLowerCase()}123` :
        'Employee created successfully. User account already exists or creation failed.'
    });
  } catch (error: any) {
    console.error('Employee creation error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: validationErrors.join(', '),
        details: error.errors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Duplicate ${field}`, 
        error: `${field} already exists` 
      });
    }
    
    res.status(400).json({ 
      message: 'Error creating employee', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const oldEmployee = await Employee.findById(req.params.id);
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update corresponding user account if email or name changed
    if (oldEmployee && (oldEmployee.email !== employee.email || 
        oldEmployee.firstName !== employee.firstName || 
        oldEmployee.lastName !== employee.lastName)) {
      try {
        await User.findOneAndUpdate(
          { email: oldEmployee.email },
          { 
            email: employee.email,
            name: `${employee.firstName} ${employee.lastName}`
          }
        );
      } catch (userError) {
        console.warn('Failed to update user account for employee:', userError);
      }
    }
    
    // Emit socket events
    const { io } = await import('../server');
    io.emit('employee:updated', employee);
    io.emit('dashboard:refresh'); // Trigger dashboard refresh
    
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Delete corresponding user account
    try {
      await User.findOneAndDelete({ email: employee.email });
    } catch (userError) {
      console.warn('Failed to delete user account for employee:', userError);
    }
    
    // Emit socket event
    const { io } = await import('../server');
    io.emit('employee:deleted', { id: req.params.id });
    res.json({ message: 'Employee and associated user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
};

export const getEmployeeTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('project', 'name')
      .populate('assignedBy', 'firstName lastName');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee tasks', error });
  }
};

export const getEmployeeTaskStats = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;
    const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
    const completedTasks = await Task.countDocuments({ assignedTo: employeeId, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ assignedTo: employeeId, status: 'in-progress' });
    const overdueTasks = await Task.countDocuments({ 
      assignedTo: employeeId,
      dueDate: { $lt: new Date() }, 
      status: { $ne: 'completed' } 
    });
    
    const stats = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      todoTasks: await Task.countDocuments({ assignedTo: employeeId, status: 'todo' }),
      reviewTasks: await Task.countDocuments({ assignedTo: employeeId, status: 'review' })
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee task stats', error });
  }
};

export const getEmployeeUserCredentials = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const user = await User.findOne({ email: employee.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User account not found for this employee' });
    }
    
    // Return user info and default password pattern
    const defaultPassword = `${employee.firstName.toLowerCase()}123`;
    
    res.json({
      user: {
        email: user.email,
        role: user.role,
        status: user.status
      },
      defaultPassword,
      message: 'Employee can login with email and default password. Recommend changing password after first login.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee user credentials', error });
  }
};