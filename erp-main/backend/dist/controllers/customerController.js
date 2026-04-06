"use strict";
// Path: backend/src/controllers/customerController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersByTag = exports.updateCustomerStatus = exports.removeCustomerTags = exports.addCustomerTags = exports.getCustomerStats = exports.searchCustomers = exports.getCustomersByType = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getAllCustomers = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
// Get all customers with pagination, sorting, and filtering
const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', type, search, active, city, country } = req.query;
        // Build query
        let query = {};
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
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Determine sort order
        const sortOption = {};
        sortOption[sort] = order === 'asc' ? 1 : -1;
        // Execute query with pagination
        const customers = await Customer_1.default.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);
        // Get total count for pagination
        const totalCustomers = await Customer_1.default.countDocuments(query);
        res.status(200).json({
            data: customers,
            pagination: {
                total: totalCustomers,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(totalCustomers / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};
exports.getAllCustomers = getAllCustomers;
// Get customer by ID
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        const customer = await Customer_1.default.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error });
    }
};
exports.getCustomerById = getCustomerById;
// Create a new customer
const createCustomer = async (req, res) => {
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
        const existingCustomer = await Customer_1.default.findOne({ email: email.toLowerCase() });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // Create new customer
        const newCustomer = new Customer_1.default(req.body);
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    }
    catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        res.status(500).json({ message: 'Error creating customer', error });
    }
};
exports.createCustomer = createCustomer;
// Update customer
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        // Check if changing email and if it already exists
        if (req.body.email) {
            const existingCustomer = await Customer_1.default.findOne({
                email: req.body.email.toLowerCase(),
                _id: { $ne: id } // Exclude current customer
            });
            if (existingCustomer) {
                return res.status(400).json({ message: 'Email already in use by another customer' });
            }
        }
        // Update customer
        const updatedCustomer = await Customer_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        res.status(500).json({ message: 'Error updating customer', error });
    }
};
exports.updateCustomer = updateCustomer;
// Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        // Check if customer has orders
        const hasOrders = await Order_1.default.exists({ customer: id });
        if (hasOrders) {
            // Instead of deleting, just mark as inactive
            const updatedCustomer = await Customer_1.default.findByIdAndUpdate(id, { active: false }, { new: true });
            if (!updatedCustomer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            return res.status(200).json({
                message: 'Customer has existing orders and was marked as inactive instead of being deleted',
                customer: updatedCustomer
            });
        }
        // If no orders, delete the customer
        const customer = await Customer_1.default.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
exports.deleteCustomer = deleteCustomer;
// Get customers by type
const getCustomersByType = async (req, res) => {
    try {
        const { type } = req.params;
        // Validate customer type
        if (!['regular', 'wholesale', 'vip'].includes(type)) {
            return res.status(400).json({ message: 'Invalid customer type' });
        }
        const customers = await Customer_1.default.find({ customerType: type }).sort({ createdAt: -1 });
        res.status(200).json(customers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customers by type', error });
    }
};
exports.getCustomersByType = getCustomersByType;
// Search customers
const searchCustomers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const searchRegex = new RegExp(String(q), 'i');
        const customers = await Customer_1.default.find({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error searching customers', error });
    }
};
exports.searchCustomers = searchCustomers;
// Get customer stats
const getCustomerStats = async (req, res) => {
    try {
        const stats = await Customer_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customer statistics', error });
    }
};
exports.getCustomerStats = getCustomerStats;
// Add tags to customer
const addCustomerTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be provided as an array' });
        }
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        const customer = await Customer_1.default.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        // Add new tags without duplicates
        const existingTags = customer.tags || [];
        const uniqueTags = [...new Set([...existingTags, ...tags])];
        const updatedCustomer = await Customer_1.default.findByIdAndUpdate(id, { tags: uniqueTags }, { new: true });
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding tags to customer', error });
    }
};
exports.addCustomerTags = addCustomerTags;
// Remove tags from customer
const removeCustomerTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({ message: 'Tags must be provided as an array' });
        }
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        const customer = await Customer_1.default.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        // Remove specified tags
        const existingTags = customer.tags || [];
        const updatedTags = existingTags.filter(tag => !tags.includes(tag));
        const updatedCustomer = await Customer_1.default.findByIdAndUpdate(id, { tags: updatedTags }, { new: true });
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing tags from customer', error });
    }
};
exports.removeCustomerTags = removeCustomerTags;
// Update customer status (active/inactive)
const updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        if (active === undefined) {
            return res.status(400).json({ message: 'Active status must be provided' });
        }
        // Validate ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid customer ID format' });
        }
        const updatedCustomer = await Customer_1.default.findByIdAndUpdate(id, { active }, { new: true });
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating customer status', error });
    }
};
exports.updateCustomerStatus = updateCustomerStatus;
// Get customers by tag
const getCustomersByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const customers = await Customer_1.default.find({ tags: tag }).sort({ createdAt: -1 });
        res.status(200).json(customers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customers by tag', error });
    }
};
exports.getCustomersByTag = getCustomersByTag;
