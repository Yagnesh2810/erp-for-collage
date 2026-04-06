// Path: backend/src/controllers/customerController.ts

import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/Customer';
import mongoose from 'mongoose';
import Order from '../models/Order';

// Get all customers with pagination, sorting, and filtering
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc', 
      type, 
      search,
      active,
      city,
      country 
    } = req.query;
    
    // Build query
    let query: any = {};
    
    // Filter by customer type if provided
    if (type) {
      query.customerType = type;
    }
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    // Filter by city if provided
    if (city) {
      query['address.city'] = new RegExp(String(city), 'i');
    }
    
    // Filter by country if provided
    if (country) {
      query['address.country'] = new RegExp(String(country), 'i');
    }
    
    // Search functionality (text search)
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'address.city': searchRegex },
        { 'address.country': searchRegex },
        { contactPerson: searchRegex }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Determine sort order
    const sortOption: any = {};
    sortOption[sort as string] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const customers = await Customer.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const totalCustomers = await Customer.countDocuments(query);
    
    res.status(200).json({
      data: customers,
      pagination: {
        total: totalCustomers,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCustomers / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { name, email, phone, address } = req.body;
    
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        requiredFields: ['name', 'email', 'phone', 'address']
      });
    }
    
    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create new customer
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    
    res.status(201).json(savedCustomer);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Error creating customer', error });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    // Check if changing email and if it already exists
    if (req.body.email) {
      const existingCustomer = await Customer.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: id } // Exclude current customer
      });
      
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already in use by another customer' });
      }
    }
    
    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(updatedCustomer);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Error updating customer', error });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    // Check if customer has orders
    const hasOrders = await Order.exists({ customer: id });
    
    if (hasOrders) {
      // Instead of deleting, just mark as inactive
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      );
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      return res.status(200).json({ 
        message: 'Customer has existing orders and was marked as inactive instead of being deleted',
        customer: updatedCustomer
      });
    }
    
    // If no orders, delete the customer
    const customer = await Customer.findByIdAndDelete(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
};

// Get customers by type
export const getCustomersByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    // Validate customer type
    if (!['regular', 'wholesale', 'vip'].includes(type)) {
      return res.status(400).json({ message: 'Invalid customer type' });
    }
    
    const customers = await Customer.find({ customerType: type }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers by type', error });
  }
};

// Search customers
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(String(q), 'i');
    
    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.country': searchRegex },
        { contactPerson: searchRegex }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error searching customers', error });
  }
};

// Get customer stats
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const stats = await Customer.aggregate([
      {
        $facet: {
          'totalCount': [{ $count: 'count' }],
          'activeCount': [{ $match: { active: true } }, { $count: 'count' }],
          'inactiveCount': [{ $match: { active: false } }, { $count: 'count' }],
          'byType': [
            { $group: { _id: '$customerType', count: { $sum: 1 } } }
          ],
          'byCountry': [
            { $group: { _id: '$address.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          'recentlyAdded': [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { name: 1, email: 1, phone: 1, customerType: 1, createdAt: 1 } }
          ]
        }
      }
    ]);
    
    // Format the results
    const formattedStats = {
      totalCount: stats[0].totalCount[0]?.count || 0,
      activeCount: stats[0].activeCount[0]?.count || 0,
      inactiveCount: stats[0].inactiveCount[0]?.count || 0,
      byType: stats[0].byType,
      byCountry: stats[0].byCountry,
      recentlyAdded: stats[0].recentlyAdded
    };
    
    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer statistics', error });
  }
};

// Add tags to customer
export const addCustomerTags = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be provided as an array' });
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Add new tags without duplicates
    const existingTags = customer.tags || [];
    const uniqueTags = [...new Set([...existingTags, ...tags])];
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { tags: uniqueTags },
      { new: true }
    );
    
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tags to customer', error });
  }
};

// Remove tags from customer
export const removeCustomerTags = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be provided as an array' });
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Remove specified tags
    const existingTags = customer.tags || [];
    const updatedTags = existingTags.filter(tag => !tags.includes(tag));
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { tags: updatedTags },
      { new: true }
    );
    
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error removing tags from customer', error });
  }
};

// Update customer status (active/inactive)
export const updateCustomerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status must be provided' });
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { active },
      { new: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer status', error });
  }
};

// Get customers by tag
export const getCustomersByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    
    const customers = await Customer.find({ tags: tag }).sort({ createdAt: -1 });
    
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers by tag', error });
  }
};